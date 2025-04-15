import { cx } from "@/lib/utils";
import {
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
} from "@heroicons/react/20/solid";
import { useCallback } from "react";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  const handleClick = useCallback(
    (
      newPage: number,
      event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
    ) => {
      event.preventDefault();
      if (newPage !== page && newPage >= 0 && newPage < totalPages) {
        onPageChange(newPage);
      }
    },
    [onPageChange, page, totalPages]
  );

  const renderPages = useCallback(() => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) {
        const isActive = i === page;
        const className = `inline-flex items-center border-t-2 ${
          isActive
            ? "border-primary-500 text-gray-900 dark:text-white"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-white dark:hover:text-primary-600"
        } px-4 pt-4 text-sm font-medium`;

        pages.push(
          <a
            key={i}
            href="#"
            className={className}
            aria-current={isActive ? "page" : undefined}
            onClick={(event) => handleClick(i, event)}
          >
            {i + 1}
          </a>
        );
      }
    } else {
      pages.push(
        <a
          key={0}
          href="#"
          className={`inline-flex items-center border-t-2 ${
            page === 0
              ? "border-primary-500 text-gray-900 dark:text-white"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-white dark:hover:text-primary-600"
          } px-4 pt-4 text-sm font-medium`}
          aria-current={page === 0 ? "page" : undefined}
          onClick={(event) => handleClick(0, event)}
        >
          1
        </a>
      );

      if (page > 2) {
        pages.push(
          <span
            key="leftDots"
            className="inline-flex items-center px-4 pt-4 text-sm font-medium dark:text-white"
          >
            &hellip;
          </span>
        );
      }

      for (
        let i = Math.max(1, page - 1);
        i <= Math.min(totalPages - 2, page + 1);
        i++
      ) {
        const isActive = i === page;
        const className = `inline-flex items-center border-t-2 ${
          isActive
            ? "border-primary-500 text-gray-900 dark:text-white"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-white dark:hover:text-primary-600"
        } px-4 pt-4 text-sm font-medium`;

        pages.push(
          <a
            key={i}
            href="#"
            className={className}
            aria-current={isActive ? "page" : undefined}
            onClick={(event) => handleClick(i, event)}
          >
            {i + 1}
          </a>
        );
      }

      if (page < totalPages - 3) {
        pages.push(
          <span
            key="rightDots"
            className="inline-flex items-center px-4 pt-4 text-sm font-medium dark:text-white"
          >
            &hellip;
          </span>
        );
      }

      pages.push(
        <a
          key={totalPages - 1}
          href="#"
          className={`inline-flex items-center border-t-2 ${
            page === totalPages - 1
              ? "border-primary-500 text-gray-900 dark:text-white"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-white dark:hover:text-primary-600"
          } px-4 pt-4 text-sm font-medium`}
          aria-current={page === totalPages - 1 ? "page" : undefined}
          onClick={(event) => handleClick(totalPages - 1, event)}
        >
          {totalPages}
        </a>
      );
    }

    return pages;
  }, [handleClick, page, totalPages]);

  return (
    <nav className="flex items-center justify-between px-4 sm:px-0">
      <div className="-mt-px flex w-0 flex-1">
        <a
          href="#"
          className={cx(
            "inline-flex items-center pr-1 pt-4 text-sm font-medium text-gray-400 dark:text-white",
            page === 0
              ? "hidden"
              : "cursor-pointer hover:border-gray-300 hover:text-gray-700 dark:hover:text-primary-600"
          )}
          onClick={(event) => handleClick(page - 1, event)}
        >
          <ArrowLongLeftIcon className="mr-3 h-5 w-5" aria-hidden="true" />
          <span className="hidden md:inline">Previous</span>
        </a>
      </div>
      <div className="flex">{renderPages()}</div>
      <div className="-mt-px flex w-0 flex-1 justify-end">
        <a
          href="#"
          className={cx(
            "inline-flex items-center pl-1 pt-4 text-sm font-medium text-gray-400 dark:text-white",
            page === totalPages - 1
              ? "hidden"
              : "cursor-pointer hover:border-gray-300 hover:text-gray-700 dark:hover:text-primary-600"
          )}
          onClick={(event) => handleClick(page + 1, event)}
        >
          <span className="hidden md:inline">Next</span>
          <ArrowLongRightIcon className="ml-3 h-5 w-5" aria-hidden="true" />
        </a>
      </div>
    </nav>
  );
}
