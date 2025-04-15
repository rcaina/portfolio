import MagnifyingGlassIcon from "@heroicons/react/20/solid/MagnifyingGlassIcon";
import { createColumnHelper } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

import Input from "@/components/common/Input";
import { Table } from "@/components/common/Table";
import Pagination from "@/components/common/Pagination";
import { SHORT_DATE_FORMAT } from "@/lib/contants";
import { S3Link, S3ResourceType } from "@/components/misc/S3Link";
import SpecimenStatusBadge from "@/components/misc/badges/SpecimenStatusBadge";
import { useServices } from "@/lib/hooks/patient/useServices";
import useDebouncedSearch from "@/lib/hooks/useDebounceSearch";
import { GetSpecimenResponse } from "@/pages/api/clinical/specimen";

type Props = {
  patientId: string;
};

const columnHelper =
  createColumnHelper<GetSpecimenResponse["specimens"][number]>();

const createColumns = () => [
  columnHelper.accessor("kitId", {
    header: () => "Kit Id",
    cell: (info) => <strong>{info.renderValue()}</strong>,
  }),
  columnHelper.accessor("serviceRequest.serviceType.name", {
    header: () => "Test",
    enableSorting: true,
  }),
  columnHelper.accessor("status", {
    header: () => "Status",
    cell: (info) =>
      info.row.original.status && (
        <SpecimenStatusBadge status={info.row.original.status} />
      ),
    enableSorting: true,
  }),
  columnHelper.accessor("createdAt", {
    header: () => "Created Date",
    cell: (info) => dayjs(info.renderValue()).format(SHORT_DATE_FORMAT),
  }),
  columnHelper.display({
    header: "Result",
    cell: (props) => {
      return (
        <S3Link
          allowedToView={Boolean(props.row.original.resultS3Key)}
          resourceType={S3ResourceType.RESULTS}
          resourceIdentifier={props.row.original.id}
          text="Result"
        />
      );
    },
  }),
];

export default function ServiceTable({ patientId }: Props) {
  const { searchValue, setSearchValue, debouncedValue } =
    useDebouncedSearch("");
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  useEffect(() => {
    setPage(0);
  }, [debouncedValue]);

  const { specimens, totalSpecimens } = useServices({
    patientId,
    search: debouncedValue,
    page,
    pageSize,
  });
  const totalPages = Math.ceil(totalSpecimens / pageSize);

  const columns = createColumns();

  return (
    <div className="flex flex-col">
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
        // rowLinkBase={"/service/"}
        // sorting={sorting}
        // setSorting={setSorting}
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
