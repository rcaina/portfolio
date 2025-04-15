import {
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { SortingState, createColumnHelper } from "@tanstack/react-table";
import { useEffect, useState } from "react";

import { GetResearchOrdersResponse } from "@/pages/api/research/order";
import Input from "@/components/common/Input";
import { MEDIUM_DATE_FORMAT } from "@/lib/contants";
import MagnifyingGlassIcon from "@heroicons/react/20/solid/MagnifyingGlassIcon";
import Pagination from "@/components/common/Pagination";
import { Section } from "@/components/common/Section";
import { Table } from "@/components/common/Table";
import dayjs from "dayjs";
import useDebouncedSearch from "@/lib/hooks/useDebounceSearch";
import { useOrders } from "@/lib/hooks/research/useOrders";

type Props = Record<string, unknown>;

const columnHelper =
  createColumnHelper<GetResearchOrdersResponse["orders"][number]>();

export const createOrderColumns = () => [
  columnHelper.accessor("orderId", {
    header: () => "Order ID",
    cell: (info) => <strong>{info.renderValue()}</strong>,
  }),
  columnHelper.accessor("status", {
    header: () => "Status",
    cell: (info) => info.renderValue(),
    enableSorting: true,
  }),
  columnHelper.accessor("submittedToLab", {
    header: () => "Submitted to Lab",
    cell: (info) =>
      info.renderValue() === true ? (
        <CheckCircleIcon className="h-5 w-5" />
      ) : (
        <XCircleIcon className="h-5 w-5" />
      ),
    enableSorting: true,
  }),
  columnHelper.accessor("createdAt", {
    header: () => "Created Date",
    cell: (info) => dayjs(info.renderValue()).format(MEDIUM_DATE_FORMAT),
  }),
];

export default function OrderTable({}: Props) {
  const { searchValue, setSearchValue, debouncedValue } =
    useDebouncedSearch("");
  const [sorting, setSorting] = useState<SortingState>([
    { desc: false, id: "status" },
  ]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  useEffect(() => {
    setPage(0);
  }, [debouncedValue]);

  const { orders, totalOrders } = useOrders({
    search: debouncedValue,
    page,
    pageSize,
  });
  const totalPages = Math.ceil(totalOrders / pageSize);

  const columns = createOrderColumns();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-row items-center gap-4">
        <div className="w-full">
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            name="search"
            type="text"
            placeholder="Search"
            Icon={MagnifyingGlassIcon}
          />
        </div>
        <div className="hidden sm:flex sm:items-baseline sm:space-x-8"></div>
      </div>
      {orders.length > 0 ? (
        <Table
          className="mt-6"
          data={orders || []}
          columns={columns}
          rowLinkBase={"/research/orders/"}
          sorting={sorting}
          setSorting={setSorting}
        />
      ) : (
        <Section>
          <div className="flex w-full flex-col items-center gap-4">
            <ClipboardDocumentCheckIcon className="h-8 w-8 fill-secondary-400" />
            <p>No orders found</p>
          </div>
        </Section>
      )}
      {orders.length > pageSize && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </div>
  );
}
