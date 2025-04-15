import { S3Link, S3ResourceType } from "@/components/misc/S3Link";
import { SortingState, createColumnHelper } from "@tanstack/react-table";
import { useEffect, useState } from "react";

import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { GetSpecimenResponse } from "@/pages/api/clinical/specimen";
import Input from "@/components/common/Input";
import MagnifyingGlassIcon from "@heroicons/react/20/solid/MagnifyingGlassIcon";
import Pagination from "@/components/common/Pagination";
import { SHORT_DATE_FORMAT } from "@/lib/contants";
import { Section } from "@/components/common/Section";
import SpecimenStatusBadge from "@/components/misc/badges/SpecimenStatusBadge";
import { Table } from "@/components/common/Table";
import dayjs from "dayjs";
import { mapAdminStatusToCustomerStatus } from "@/lib/utils";
import useDebouncedSearch from "@/lib/hooks/useDebounceSearch";
import { useSpecimens } from "@/lib/hooks/employees/useSpecimens";

type Props = {
  practitionerId?: string;
};

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

export default function SpecimenTable({ practitionerId }: Props) {
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
    practitionerId,
    search: debouncedValue,
    page,
    pageSize,
  });
  const totalPages = Math.ceil(totalSpecimens / pageSize);

  const columns = createColumns();

  return (
    <div className="flex min-h-screen flex-col gap-8">
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
      {specimens.length > 0 ? (
        <Table
          className="mt-6"
          data={specimens || []}
          columns={columns}
          rowLinkBase={"/practitioner/specimen/"}
          sorting={sorting}
          setSorting={setSorting}
        />
      ) : (
        <Section>
          <div className="flex w-full flex-col items-center gap-4">
            <ClipboardDocumentListIcon className="h-8 w-8 fill-secondary-400" />
            <p>No specimens found</p>
          </div>
        </Section>
      )}
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
