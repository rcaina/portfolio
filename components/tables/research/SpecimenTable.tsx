import {
  ArrowUpRightIcon,
  ChevronDownIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/common/DropdownMenu";
import { SortingState, createColumnHelper } from "@tanstack/react-table";
import { useEffect, useState } from "react";

import DataDownloadModal from "@/components/modals/DataDownloadModal";
import Filter from "@/components/common/Filter";
import { GetSpecimenResponse } from "@/pages/api/clinical/specimen";
import Input from "@/components/common/Input";
import { MEDIUM_DATE_FORMAT } from "@/lib/contants";
import MagnifyingGlassIcon from "@heroicons/react/20/solid/MagnifyingGlassIcon";
import Pagination from "@/components/common/Pagination";
import { Section } from "@/components/common/Section";
import SpecimenStatusBadge from "@/components/misc/badges/SpecimenStatusBadge";
import { Table } from "@/components/common/Table";
import dayjs from "dayjs";
import { fetchResult } from "@/lib/utils";
import { toast } from "react-toastify";
import useDebouncedSearch from "@/lib/hooks/useDebounceSearch";
import { useProjects } from "@/lib/hooks/filters/useProjects";
import { useRouter } from "next/router";
import { useRowSelection } from "@/lib/hooks/useRowSelection";
import { useSession } from "next-auth/react";
import { useSpecimens } from "@/lib/hooks/research/useSpecimens";

type Props = Record<string, unknown>;

const columnHelper =
  createColumnHelper<GetSpecimenResponse["specimens"][number]>();

export const createSpecimenColumns = (
  fetchResult: (id: string) => Promise<string>
) => [
  columnHelper.accessor("kitId", {
    header: () => "Kit ID",
    cell: (info) => <strong>{info.renderValue()}</strong>,
  }),
  columnHelper.accessor("status", {
    header: () => "Status",
    cell: (info) =>
      info.row.original.status && (
        <SpecimenStatusBadge status={info.row.original.status} />
      ),
    enableSorting: true,
  }),
  columnHelper.accessor("serviceRequest.order.orderId", {
    header: () => "Order",
    cell: (info) => info.renderValue(),
    enableSorting: true,
  }),
  columnHelper.accessor("serviceRequest.project.name", {
    header: () => "Project",
    cell: (info) => info.renderValue(),
    enableSorting: true,
  }),
  columnHelper.accessor("createdAt", {
    header: () => "Created Date",
    cell: (info) => dayjs(info.renderValue()).format(MEDIUM_DATE_FORMAT),
  }),
  columnHelper.display({
    id: "result",
    header: "Result",
    cell: (props) =>
      props.row.original.status === "COMPLETED" ? (
        <a
          className="flex items-center gap-1 underline"
          onClick={async () => {
            const url = await fetchResult(props.row.original.id);
            if (url) {
              window.open(url, "_blank");
            } else {
              toast.error("Error retrieving result");
            }
          }}
        >
          View <ArrowUpRightIcon className="h-4 w-4" />
        </a>
      ) : (
        "--"
      ),
  }),
];

export default function SpecimenTable({}: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const { searchValue, setSearchValue, debouncedValue } =
    useDebouncedSearch("");
  const [openDownloadSpecimensModal, setOpenDownloadSpecimensModal] =
    useState(false);
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
    projectIds: router.query.projectIds as string[],
    page,
    pageSize,
  });
  const totalPages = Math.ceil(totalSpecimens / pageSize);

  const columns = createSpecimenColumns(fetchResult);

  const { rowSelection, setRowSelection, selectedIds } = useRowSelection<
    GetSpecimenResponse["specimens"][number]
  >({
    data: specimens,
  });

  const { data: projectFilterOptions = [] } = useProjects(
    session?.user.organizationId || ""
  );

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
        <div className="hidden sm:flex sm:items-baseline sm:space-x-4">
          <Filter
            name="Project"
            queryName="projectIds"
            options={projectFilterOptions.map((item) => {
              return { label: item.name, value: item.id };
            })}
            router={router} // router={router}
          />
          <div className="flex gap-8">
            <DropdownMenu>
              <DropdownMenuTrigger className="w-auto rounded-sm border border-secondary-600 pl-2 pr-2">
                <div className="group inline-flex text-sm font-medium text-gray-700 dark:text-white dark:hover:text-primary-600">
                  <span className="underline-across">Actions</span>
                  <ChevronDownIcon
                    className="-mr-1 ml-1 h-3 w-3 flex-shrink-0 self-center"
                    aria-hidden="true"
                  />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  id={"download"}
                  disabled={selectedIds.length === 0}
                  onClick={() => setOpenDownloadSpecimensModal(true)}
                >
                  Download Results
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      {specimens.length > 0 ? (
        <Table
          className="mt-6"
          data={specimens || []}
          columns={columns}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          rowLinkBase={"/research/specimen/"}
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
      {openDownloadSpecimensModal && (
        <DataDownloadModal
          open={openDownloadSpecimensModal}
          setOpen={setOpenDownloadSpecimensModal}
          selectedIds={selectedIds}
          reportsOnly={true}
        />
      )}
    </div>
  );
}
