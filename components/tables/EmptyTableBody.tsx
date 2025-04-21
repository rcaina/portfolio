import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import React from "react";

import Spinner from "@/components/common/Spinner";

interface Props {
  isLoading?: boolean;
}

export default function EmptyTableBody({ isLoading = false }: Props) {
  return (
    <tr>
      <td colSpan={100}>
        <div className="flex h-96 flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            {isLoading ? (
              <>
                <div className="flex h-24 w-24 items-center justify-center">
                  <Spinner className="h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium leading-6 text-highlight-900">
                  Loading...
                </h3>
              </>
            ) : (
              <>
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-highlight-100">
                  <MagnifyingGlassIcon className="h-12 w-12 text-primary-400" />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-lg font-medium leading-6 text-highlight-200">
                    No results found
                  </h3>
                </div>
              </>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
