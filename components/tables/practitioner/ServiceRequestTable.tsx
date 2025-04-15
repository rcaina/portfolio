import useSWR, { KeyedMutator } from "swr";

import Button from "@/components/common/Button";
import { GetAccountResponse } from "@/pages/api/current/account/[id]";
import { GetServiceRequestResponse } from "@/pages/api/clinical/service/order";
import Input from "@/components/common/Input";
import MagnifyingGlassIcon from "@heroicons/react/20/solid/MagnifyingGlassIcon";
import Pagination from "@/components/common/Pagination";
import RequisitionFormStatusBadge from "../../misc/badges/RequisitionFormStatusBadge";
import ServiceRequestStatusBadge from "../../misc/badges/OrderStatusBadge";
import { ServiceRequestTableDropdownMenu } from "../../threeDotMenus/ServiceRequestTableDropdownMenu";
import { Table } from "@/components/common/Table";
import { createColumnHelper } from "@tanstack/react-table";
import { isEmpty } from "lodash-es";
import useDebouncedSearch from "@/lib/hooks/useDebounceSearch";
import { useRouter } from "next/router";
import { useServiceRequest } from "@/lib/hooks/employees/useServiceRequests";
import { useSession } from "next-auth/react";
import { useState } from "react";

type Props = Record<string, never>;

const columnHelper =
  createColumnHelper<GetServiceRequestResponse["services"][number]>();

const createColumns = (mutate: KeyedMutator<GetServiceRequestResponse>) => [
  columnHelper.accessor("id", {
    header: () => "Service Request ID",
    cell: (info) => <strong>{"ORD-" + info.renderValue()}</strong>,
  }),
  columnHelper.accessor("serviceType.name", {
    header: () => "Service Type",
  }),
  columnHelper.accessor("order.status", {
    header: () => "Status",
    cell: (info) =>
      info.row.original.order?.status && (
        <ServiceRequestStatusBadge status={info.row.original.order?.status} />
      ),
  }),
  columnHelper.accessor("order.reqFormStatus", {
    header: () => "Requisition Form",
    cell: (info) =>
      info.row.original.order?.reqFormStatus && (
        <RequisitionFormStatusBadge
          status={info.row.original.order?.reqFormStatus}
        />
      ),
  }),
  columnHelper.accessor("patient.fullName", {
    header: () => "Patient",
  }),
  columnHelper.accessor("practitioner.fullName", {
    header: () => "Practitioner",
  }),
  columnHelper.accessor("createdAt", {
    header: () => "Created Date",
    cell: (info) => new Date(info.row.original.createdAt).toLocaleDateString(),
  }),
  columnHelper.display({
    id: "actions",
    cell: (info) =>
      info.row.original && (
        <ServiceRequestTableDropdownMenu
          serviceRequest={info.row.original}
          mutate={async () => {
            await mutate();
          }}
        />
      ),
  }),
];

export default function ServiceRequestTable({}: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const { searchValue, setSearchValue, debouncedValue } =
    useDebouncedSearch("");
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  const { data: currentAccount } = useSWR<GetAccountResponse>(
    session?.user.id
      ? `/api/current/account/${session.user.currentAccountId}`
      : null,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    }
  );
  const { data: isLocked = true } = useSWR<boolean>(
    `/api/current/license-status`
  );

  const { serviceRequest, totalServiceRequest, mutate } = useServiceRequest({
    search: debouncedValue,
    organizationId: currentAccount?.organization.id,
    page,
    pageSize,
  });
  const totalPages = Math.ceil(totalServiceRequest / pageSize);

  const columns = createColumns(mutate);

  return (
    <div className="flex min-h-screen flex-col">
      {!isEmpty(serviceRequest) ? (
        <div className="flex flex-col">
          <div className="mb-4 self-end rounded-md">
            <Button
              onClick={() => router.push("/clinical/service/order")}
              disabled={isLocked}
            >
              Start New Service Request
            </Button>
          </div>
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
          </div>
          <Table className="mt-6" data={serviceRequest} columns={columns} />
          {totalServiceRequest > pageSize && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}
        </div>
      ) : (
        <div className="flex flex-grow items-center justify-center">
          <div className="rounded-md border border-primary-500 p-8">
            <Button onClick={() => router.push("/clinical/service/order")}>
              Start New Service Request
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
