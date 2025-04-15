import { SortingState, createColumnHelper } from "@tanstack/react-table";
import { useEffect, useState } from "react";

import { GetSpecimenResponse } from "@/pages/api/clinical/specimen";
import Input from "@/components/common/Input";
import MagnifyingGlassIcon from "@heroicons/react/20/solid/MagnifyingGlassIcon";
import Pagination from "@/components/common/Pagination";
import { SHORT_DATE_FORMAT } from "@/lib/contants";
import SpecimenStatusBadge from "@/components/misc/badges/SpecimenStatusBadge";
import { Table } from "@/components/common/Table";
import dayjs from "dayjs";
import { mapAdminStatusToCustomerStatus } from "@/lib/utils";
import useDebouncedSearch from "@/lib/hooks/useDebounceSearch";
import { useSpecimens } from "@/lib/hooks/research/useSpecimens";

type Props = Record<string, unknown>;

const columnHelper =
  createColumnHelper<GetSpecimenResponse["specimens"][number]>();

const createColumns = () => [
  columnHelper.accessor("kitId", {
    header: () => "Kit ID",
    cell: (info) => <strong>{info.renderValue()}</strong>,
  }),
  columnHelper.accessor("status", {
    header: () => "Status",
    cell: (info) =>
      info.row.original.status && (
        <SpecimenStatusBadge
          status={mapAdminStatusToCustomerStatus(info.row.original.status)}
        />
      ),
    enableSorting: true,
  }),
  columnHelper.accessor("serviceRequest.project.name", {
    header: () => "Project",
    cell: (info) => info.renderValue(),
    enableSorting: true,
  }),
  columnHelper.accessor("createdAt", {
    header: () => "Created Date",
    cell: (info) => dayjs(info.renderValue()).format(SHORT_DATE_FORMAT),
  }),
];

export default function SpecimenTable({}: Props) {
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

  const { specimens, totalSpecimens } = useSpecimens({
    search: debouncedValue,
    page,
    pageSize,
  });
  const totalPages = Math.ceil(totalSpecimens / pageSize);

  const columns = createColumns();

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
      <Table
        className="mt-6"
        data={specimens || []}
        columns={columns}
        sorting={sorting}
        setSorting={setSorting}
      />
      {specimens.length > pageSize && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </div>
  );
}
