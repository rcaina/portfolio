import { Fragment, useEffect } from "react";
import { Popover, Transition } from "@headlessui/react";

import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { NextRouter } from "next/router";
import { ensureArray } from "@/lib/utils";

interface Props {
  name: string;
  options: { label: string; value: string }[] | string[];
  queryName: string;
  pageQueryName?: string;
  defaultQuery?: string[];
  router: NextRouter;
  statusType?:
    | "sample"
    | "order"
    | "invoice"
    | "batch"
    | "inventory"
    | "service";
}

export default function Filter({
  name,
  options,
  defaultQuery,
  router,
  queryName,
  pageQueryName = "page",
}: Props) {
  useEffect(() => {
    const currentPath = router.pathname;
    const currentQuery = router.query;

    if (!currentQuery[queryName] && defaultQuery) {
      const newQueryParams = {
        ...currentQuery,
        [queryName]: defaultQuery,
        [pageQueryName]: 0,
      };

      router.replace(
        {
          pathname: currentPath,
          query: newQueryParams,
        },
        undefined,
        { shallow: true }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryName, defaultQuery]);

  const selected = new URLSearchParams(router.asPath.split("?")[1]).getAll(
    queryName
  );

  const optionsObjects = options.map((option) => {
    if (typeof option === "string") {
      return {
        label: option,
        value: option,
      };
    }
    return option;
  });

  return (
    <Popover
      as="div"
      key={name}
      className="relative inline-block rounded-sm border border-secondary-600 p-1 pl-2 pr-2 text-left hover:bg-secondary-200/60"
    >
      <div>
        <Popover.Button className="group inline-flex items-center justify-center text-sm font-medium dark:text-white dark:hover:text-primary-600">
          <span className="underline-across whitespace-nowrap">{name}</span>

          {selected && selected.length > 0 ? (
            <span className="ml-1.5 rounded-sm bg-gray-200 px-1.5 py-0.5 text-xs font-medium tabular-nums dark:bg-slate-900">
              {selected.length}
            </span>
          ) : null}

          <ChevronDownIcon
            className="-mr-1 ml-1 h-4 w-4 flex-shrink-0"
            aria-hidden="true"
          />
        </Popover.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Popover.Panel className="absolute right-0 z-50 mt-2 origin-top-right rounded-md bg-white p-4 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-600 dark:ring-white">
          <form className="space-y-4">
            {optionsObjects.map((option) => {
              const checked = selected?.includes(option.value);
              const onCheckboxChange = () => {
                const currentPath = router.pathname;
                const currentQuery = router.query;
                const changed = checked
                  ? selected.filter((value) => value !== option.value)
                  : [...(selected || []), option.value];

                const newQueryParams = {
                  ...currentQuery,
                  [queryName]: ensureArray(changed),
                  page: 0,
                };

                router.replace(
                  {
                    pathname: currentPath,
                    query: newQueryParams,
                  },
                  undefined,
                  { shallow: true }
                );
              };
              return (
                <div key={option.value} className="flex items-center">
                  <input
                    id={`filter-${name}-${option.value}`}
                    name={`${name}[]`}
                    onChange={onCheckboxChange}
                    value={option.value}
                    checked={checked}
                    type="checkbox"
                    className="rounded-sm border-secondary-600 text-highlight-600 focus:ring-highlight-500"
                  />
                  <label
                    htmlFor={`filter-${name}-${option.value}`}
                    className="ml-3 whitespace-nowrap pr-6 text-sm font-medium dark:text-white"
                  >
                    {option.label}
                  </label>
                </div>
              );
            })}
          </form>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
