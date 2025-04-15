import { SortingState, createColumnHelper } from "@tanstack/react-table";
import { useEffect, useState } from "react";

import { FolderIcon } from "@heroicons/react/24/outline";
import { GetResearchProjectsResponse } from "@/pages/api/research/project";
import Input from "@/components/common/Input";
import { MEDIUM_DATE_FORMAT } from "@/lib/contants";
import MagnifyingGlassIcon from "@heroicons/react/20/solid/MagnifyingGlassIcon";
import Pagination from "@/components/common/Pagination";
import { Section } from "@/components/common/Section";
import { Table } from "@/components/common/Table";
import dayjs from "dayjs";
import useDebouncedSearch from "@/lib/hooks/useDebounceSearch";
import { useProjects } from "@/lib/hooks/research/useProjects";

type Props = Record<string, unknown>;

const columnHelper =
  createColumnHelper<GetResearchProjectsResponse["projects"][number]>();

export const createProjectColumns = () => [
  columnHelper.accessor("name", {
    header: () => "Label",
    cell: (info) => <strong>{info.renderValue()}</strong>,
  }),
  columnHelper.accessor("leadName", {
    header: () => "Lead Contact",
    cell: (info) => info.renderValue(),
    enableSorting: true,
  }),
  columnHelper.accessor((project) => project._count.serviceRequests, {
    header: "Total Specimen",
    cell: (info) => info.renderValue(),
    enableSorting: true,
  }),
  columnHelper.accessor("createdAt", {
    header: () => "Created Date",
    cell: (info) => dayjs(info.renderValue()).format(MEDIUM_DATE_FORMAT),
  }),
];

export default function ProjectTable({}: Props) {
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

  const { projects, totalProjects } = useProjects({
    search: debouncedValue,
    page,
    pageSize,
  });
  const totalPages = Math.ceil(totalProjects / pageSize);

  const columns = createProjectColumns();

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
      {projects.length > 0 ? (
        <Table
          className="mt-6"
          data={projects || []}
          columns={columns}
          rowLinkBase={"/research/projects/"}
          sorting={sorting}
          setSorting={setSorting}
        />
      ) : (
        <Section>
          <div className="flex w-full flex-col items-center gap-4">
            <FolderIcon className="h-8 w-8 fill-secondary-400" />
            <p>No projects found</p>
          </div>
        </Section>
      )}
      {projects.length > pageSize && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </div>
  );
}
