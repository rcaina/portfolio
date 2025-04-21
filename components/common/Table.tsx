import {
  ColumnDef,
  OnChangeFn,
  Row,
  RowSelectionState,
  SortingState,
  Table as TableType,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { Dispatch, HTMLProps } from "react";

import { ChevronDownIcon } from "@heroicons/react/20/solid";
import EmptyTableBody from "../tables/EmptyTableBody";
import Pagination from "./Pagination";
import { cx } from "@/lib/utils";
import { useRouter } from "next/router";

function IndeterminateCheckbox({
  indeterminate,
  className = "",
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current &&
        (ref.current.indeterminate = !rest.checked && indeterminate);
    }
  }, [ref, indeterminate, rest.checked]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={cx(
        "h-4 w-4 cursor-pointer rounded border-gray-300 text-highlight-600  focus:ring-primary-500",
        className
      )}
      {...rest}
    />
  );
}

interface Props<Type> {
  data: Type[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<Type, any>[];
  isLoading?: boolean;
  rowLinkBase?: string;
  height?: "sm" | "md" | "lg";
  onRowClick?: (row: Row<Type>) => void;
  rowSelection?: RowSelectionState;
  setRowSelection?: Dispatch<React.SetStateAction<RowSelectionState>>;
  className?: string;
  headerClassName?: string;
  paginate?: boolean;
  sorting?: SortingState;
  setSorting?: OnChangeFn<SortingState>;
}

export function Table<
  Type extends {
    id: string;
  }
>({
  data,
  columns,
  isLoading,
  rowLinkBase,
  onRowClick,
  rowSelection,
  setRowSelection,
  height,
  className,
  headerClassName,
  paginate = false,
  sorting,
  setSorting,
}: Props<Type>) {
  const router = useRouter();
  const selectable =
    rowSelection !== undefined && setRowSelection !== undefined;

  const adjustedColumns = selectable
    ? [
        {
          id: "selected",
          size: 1,
          minSize: 1,
          header: ({ table }: { table: TableType<Type> }) => (
            <IndeterminateCheckbox
              {...{
                checked: table.getIsAllRowsSelected(),
                indeterminate: table.getIsSomeRowsSelected(),
                onChange: table.getToggleAllRowsSelectedHandler(),
              }}
            />
          ),
          cell: ({ row }: { row: Row<Type> }) => (
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          ),
        },
        ...columns,
      ]
    : columns;

  const table = useReactTable({
    data: data || [],
    columns: adjustedColumns,
    state: {
      sorting,
      rowSelection: rowSelection,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
    ...(paginate ? { getPaginationRowModel: getPaginationRowModel() } : {}),
  });

  return (
    <div className={cx("flex flex-col", className)}>
      <div
        className={cx(
          "overflow-auto border border-highlight-600 shadow-2xl shadow-highlight-600 ring-1 ring-black ring-opacity-5 dark:ring-gray-400 md:rounded-md",
          { "max-h-96": height === "sm" },
          { "max-h-[32rem]": height === "md" },
          { "max-h-[48rem]": height === "lg" }
        )}
      >
        <table className="min-w-full border-separate border-spacing-0">
          <thead
            className={
              headerClassName
                ? headerClassName
                : "sticky top-0 z-10  bg-secondary-600 text-primary-500 dark:bg-slate-700"
            }
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b border-highlight-600 px-3 py-4 text-left text-sm font-semibold dark:text-white"
                    style={{ width: header.column.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: (
                            <ChevronDownIcon className="inline-block h-4 w-4 rotate-180" />
                          ),
                          desc: (
                            <ChevronDownIcon className="inline-block h-4 w-4" />
                          ),
                        }[header.column.getIsSorted() as string] ?? (
                          <div className="inline-block h-4 w-4" />
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-primary-500 dark:bg-slate-500">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={cx({
                    "cursor-pointer hover:bg-secondary-100 dark:hover:bg-slate-700":
                      rowLinkBase || onRowClick,
                  })}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      onClick={() => {
                        (!cell.id.includes("actions") &&
                          !cell.id.includes("selected") &&
                          !cell.id.includes("result") &&
                          onRowClick &&
                          onRowClick(row as Row<Type>)) ||
                          (!cell.id.includes("actions") &&
                            !cell.id.includes("selected") &&
                            !cell.id.includes("result") &&
                            rowLinkBase &&
                            "id" in row.original &&
                            router.push(`${rowLinkBase}/${row.original.id}`));
                      }}
                      className={cx(
                        "whitespace-nowrap px-3 py-4 text-sm  dark:text-white",
                        {
                          "border-b border-b-gray-200 dark:border-b-gray-400":
                            rowIndex < table.getRowModel().rows.length - 1,
                        }
                      )}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <EmptyTableBody isLoading={isLoading} />
            )}
          </tbody>
        </table>
      </div>
      {paginate && (
        <Pagination
          page={table.getState().pagination.pageIndex}
          totalPages={table.getPageCount()}
          onPageChange={(newPage) => table.setPageIndex(newPage)}
        />
      )}
    </div>
  );
}
