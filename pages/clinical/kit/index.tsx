import {
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

import Button from "@/components/common/Button";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { GetAccountResponse } from "@/pages/api/current/account/[id]";
import { GetKitOrdersResponse } from "@/pages/api/clinical/kits/order";
import { GetServerSideProps } from "next";
import Input from "@/components/common/Input";
import KitOrderStatusBadge from "@/components/misc/badges/KitOrderStatusBadge";
import Link from "next/link";
import MainPageLayout from "@/components/layout/MainPageLayout";
import Pagination from "@/components/common/Pagination";
import { Table } from "@/components/common/Table";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { createColumnHelper } from "@tanstack/react-table";
import { getServerSession } from "next-auth";
import { isEmpty } from "lodash-es";
import { organizationAllowedRoles } from "@/lib/utils";
import prisma from "@/lib/prisma";
import useDebouncedSearch from "@/lib/hooks/useDebounceSearch";
import { useKitOrders } from "@/lib/hooks/employees/useKitOrders";
import { useRouter } from "next/router";
import useSWR from "swr";
import { useSession } from "next-auth/react";

interface Props {
  success: boolean;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  query,
  req,
  res,
}) => {
  const session = await getServerSession(req, res, authOptions);
  const { success } = query;

  if (!session) {
    return {
      redirect: {
        destination: "/404.tsx",
        permanent: false,
      },
    };
  }

  const currentAccount = await prisma.account.findUnique({
    where: {
      id: session.user.currentAccountId ?? "",
    },
    select: {
      role: true,
    },
  });

  if (
    !currentAccount?.role ||
    !organizationAllowedRoles.includes(currentAccount.role)
  ) {
    return {
      redirect: {
        destination: "/404.tsx",
        permanent: false,
      },
    };
  }

  return {
    props: {
      success: success === "true" ? true : false,
    },
  };
};

const columnHelper =
  createColumnHelper<GetKitOrdersResponse["kitOrders"][number]>();

const createColumns = () => [
  columnHelper.accessor("id", {
    header: () => "Order ID",
    cell: (info) => <strong>{"ORD-" + info.renderValue()}</strong>,
  }),
  columnHelper.accessor("quantity", {
    header: () => "Qty",
  }),
  columnHelper.accessor("status", {
    header: () => "Status",
    cell: (info) => <KitOrderStatusBadge status={info.row.original.status} />,
  }),
  columnHelper.accessor("invoice.status", {
    header: () => "Invoice Status",
    cell: (info) => <strong>{info.renderValue()}</strong>,
  }),
  columnHelper.accessor("invoice.stripeUrl", {
    header: () => "Invoice",
    cell: (info) => (
      <div className="flex flex-row">
        <Link href={info.row.original.invoice?.stripeUrl ?? "No Invoice"}>
          {info.row.original.invoice?.stripeUrl ? "Download" : "No Invoice"}
        </Link>
        {info.row.original.invoice?.stripeUrl && (
          <ArrowTopRightOnSquareIcon className="ml-1 inline-block w-3" />
        )}
      </div>
    ),
  }),
];

const OrderKitsPage = ({ success }: Props) => {
  const router = useRouter();
  const { searchValue, setSearchValue, debouncedValue } =
    useDebouncedSearch("");
  const [successMessage, setSuccessMessage] = useState(success ?? false);
  const { data: session } = useSession();
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  const { data: isLocked = true } = useSWR<boolean>(
    `/api/current/license-status`
  );

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const { data: currentAccount } = useSWR<GetAccountResponse>(
    session?.user.id
      ? `/api/current/account/${session.user.currentAccountId}`
      : null,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    }
  );

  const { kitOrders, totalKitOrders } = useKitOrders({
    search: debouncedValue,
    organizationId: currentAccount?.organization.id,
    page,
    pageSize,
  });
  const totalPages = Math.ceil(totalKitOrders / pageSize);

  const columns = createColumns();

  return (
    <MainPageLayout title="Kit Orders" showLock={isLocked}>
      {!isEmpty(kitOrders) ? (
        <div className="flex min-h-screen flex-col">
          {successMessage && (
            <div className="mb-4 rounded-md border border-green-800 bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon
                    className="h-5 w-5 text-green-800"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Order completed
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Your order has been submitted successfully. An email with
                      your invoice will be sent shortly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="mb-4 self-end rounded-md">
            <Button
              onClick={() => router.push("/clinical/kit/order")}
              disabled={isLocked}
            >
              Start New Order
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
          <Table className="mt-6" data={kitOrders || []} columns={columns} />
          {totalKitOrders > pageSize && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}
        </div>
      ) : !isLocked ? (
        <div className="flex flex-grow items-center justify-center">
          <div className="rounded-md border border-primary-500 p-8">
            <Button onClick={() => router.push("/clinical/kit/order")}>
              Start New Order
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-grow items-center justify-center">
          <p className="font-bold ">
            No practitioners with approved credentials found.
          </p>
        </div>
      )}
    </MainPageLayout>
  );
};

export default OrderKitsPage;
