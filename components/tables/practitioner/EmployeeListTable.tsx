import { LicenseStatus, Role } from "@prisma/client";
import {
  organizationAllowedRoles,
  organizationRolesFilterOptions,
  researchRolesFilterOptions,
} from "@/lib/utils";
import { useEffect, useState } from "react";
import useSWR, { KeyedMutator } from "swr";

import { EmployeeTableMenu } from "@/components/threeDotMenus/EmployeeTableMenu";
import Filter from "@/components/common/Filter";
import { GetAccountResponse } from "@/pages/api/current/account/[id]";
import { GetEmployeesResponse } from "@/pages/api/employee";
import Input from "@/components/common/Input";
import LicenseStatusBadge from "@/components/misc/badges/LicenseStatusBadge";
import MagnifyingGlassIcon from "@heroicons/react/20/solid/MagnifyingGlassIcon";
import Pagination from "@/components/common/Pagination";
import RoleBadge from "@/components/misc/badges/RoleBadge";
import { Table } from "@/components/common/Table";
import { createColumnHelper } from "@tanstack/react-table";
import { isEmpty } from "lodash-es";
import useDebouncedSearch from "@/lib/hooks/useDebounceSearch";
import { useEmployees } from "@/lib/hooks/employees/useEmployees";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

type Props = {
  organizationId: string;
  isClinic: boolean;
};

const getEmployeeLicenceStatus = (
  licenses: { status: string; createdAt: Date }[] | null
) => {
  if (isEmpty(licenses) || !licenses) return null;

  const activeLicense = licenses.find(
    (license) => license.status === LicenseStatus.ACTIVE
  );

  if (activeLicense) return LicenseStatus.ACTIVE;

  const pendingLicense = licenses.find(
    (license) => license.status === LicenseStatus.PENDING_APPROVAL
  );

  if (pendingLicense) return LicenseStatus.PENDING_APPROVAL;

  //find the latest created license
  const latestLicense = licenses.reduce((acc, curr) => {
    return acc.createdAt > curr.createdAt ? acc : curr;
  });

  return latestLicense.status as LicenseStatus;
};

const columnHelper =
  createColumnHelper<GetEmployeesResponse["employees"][number]>();

const createColumns = (
  role: Role | undefined,
  mutate: KeyedMutator<GetEmployeesResponse>
) => [
  columnHelper.accessor("fullName", {
    header: () => "Name",
    cell: (info) => <strong>{info.renderValue()}</strong>,
  }),
  columnHelper.accessor((employee) => employee.accounts[0].role, {
    header: "Role",
    cell: (info) => info.getValue() && <RoleBadge status={info.getValue()} />,
    enableSorting: true,
  }),
  columnHelper.accessor((employee) => employee.licenses, {
    header: "Credential Status",
    cell: (info) =>
      info.row.original.accounts[0].role === Role.PRACTITIONER ? (
        <LicenseStatusBadge
          status={getEmployeeLicenceStatus(info.renderValue())}
        />
      ) : (
        "N/A"
      ),
    enableSorting: true,
  }),
  columnHelper.accessor((employee) => employee.accounts[0].accountOwner, {
    header: "Membership",
    cell: (info) => (
      <div>
        {info.row.original.accounts[0].accountOwner ? "Owner" : "Member"}
      </div>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    cell: (info) =>
      info.row.original &&
      role &&
      (organizationAllowedRoles.includes(role) || role === Role.ADMIN) && (
        <EmployeeTableMenu employee={info.row.original} mutate={mutate} />
      ),
  }),
];

export default function EmployeeListTable({ organizationId, isClinic }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const { searchValue, setSearchValue, debouncedValue } =
    useDebouncedSearch("");
  const { data: currentAccount } = useSWR<GetAccountResponse>(
    session?.user.id
      ? `/api/current/account/${session.user.currentAccountId}`
      : null,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    }
  );

  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  useEffect(() => {
    setPage(0);
  }, [debouncedValue]);

  const { employees, totalEmployees, mutate } = useEmployees({
    organizationId,
    roles: router.query.roles as string[],
    search: debouncedValue,
    page,
    pageSize,
  });
  const totalPages = Math.ceil(totalEmployees / pageSize);
  const columns = createColumns(currentAccount?.role, mutate);

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
        <div className="hidden sm:flex sm:items-baseline sm:space-x-8">
          <Filter
            name="Roles"
            options={
              isClinic
                ? organizationRolesFilterOptions
                : researchRolesFilterOptions
            }
            router={router}
            queryName={"roles"}
          />
        </div>
        <div className="hidden sm:flex sm:items-baseline sm:space-x-8"></div>
      </div>
      <Table
        className="mt-6"
        data={employees || []}
        columns={columns}
        rowLinkBase={"/settings/organization/team"}
      />
      {employees.length > 10 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </div>
  );
}
