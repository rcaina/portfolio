import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import { Fragment, ReactNode, forwardRef } from "react";

import { cx } from "@/lib/utils";

export interface SelectItem {
  label: string | ReactNode;
  value: string;
  imageUrl?: string;
}

interface Props {
  value?: string | null;
  onChange: (item: string) => void;
  data: SelectItem[] | string[];
  label?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  required?: boolean;
}

export default forwardRef<HTMLButtonElement, Props>(function Select(
  {
    value,
    onChange,
    data,
    disabled,
    className,
    label,
    error,
    required = false,
    ...otherProps
  }: Props,
  ref
) {
  const optionsObjects = data.map((option) => {
    if (typeof option === "string") {
      return {
        label: option,
        value: option,
      };
    }
    return option;
  });
  const selectedTest = optionsObjects.find((test) => test.value === value);

  return (
    <Listbox
      value={value || null}
      onChange={onChange}
      disabled={disabled}
      {...otherProps}
    >
      {({ open }) => (
        <div>
          {label && (
            <Listbox.Label className="block text-sm font-medium">
              {label}
            </Listbox.Label>
          )}
          <div className="relative ">
            <Listbox.Button
              ref={ref}
              aria-invalid={error ? "true" : undefined}
              className={cx(
                `relative h-10 w-full cursor-default rounded-sm border border-highlight-200 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-highlight-600 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 disabled:opacity-70 aria-[invalid]:border-red-300 aria-[invalid]:placeholder-red-300 aria-[invalid]:focus:border-red-300 aria-[invalid]:focus:ring-red-500 sm:text-sm`,
                className
              )}
            >
              <span className="flex h-[24px] items-center">
                {selectedTest?.imageUrl && (
                  <Image
                    width={24}
                    height={24}
                    src={selectedTest?.imageUrl || ""}
                    alt=""
                    className="h-6 w-6 flex-shrink-0 rounded-full"
                  />
                )}
                <span className="ml-3 block truncate ">
                  {selectedTest?.label}
                </span>
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {optionsObjects?.map &&
                  optionsObjects.map((item) => (
                    <Listbox.Option
                      key={item.value}
                      className={({ active }) =>
                        cx(
                          active ? "bg-secondary-600 text-white" : "",
                          "relative cursor-default select-none py-2 pl-3 pr-9"
                        )
                      }
                      value={item.value}
                      aria-required={required}
                    >
                      {({ selected, active }) => (
                        <>
                          <div className="flex items-center">
                            {item?.imageUrl && (
                              <Image
                                width={24}
                                height={24}
                                src={item.imageUrl || ""}
                                alt=""
                                className="h-6 w-6 flex-shrink-0 rounded-full"
                              />
                            )}
                            <span
                              className={cx(
                                selected ? "font-semibold" : "font-normal",
                                "ml-3 block"
                              )}
                            >
                              {item.label}
                            </span>
                          </div>

                          {selected ? (
                            <span
                              className={cx(
                                active ? "text-white" : "text-primary-600",
                                "absolute inset-y-0 right-0 flex items-center pr-4"
                              )}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
              </Listbox.Options>
            </Transition>
          </div>
        </div>
      )}
    </Listbox>
  );
});
