import {
  InvoiceStatus,
  OrganizationType,
  Prisma,
  PrismaClient,
  Role,
} from "@prisma/client";
import prisma, { forUser } from "@/lib/prisma";

import BillingSubMenu from "@/components/displays/BillingSubMenu";
import { GetServerSideProps } from "next";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import { SHORT_DATE_FORMAT } from "@/lib/contants";
import { Table } from "@/components/common/Table";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { createColumnHelper } from "@tanstack/react-table";
import dayjs from "dayjs";
import { getServerSession } from "next-auth";

const allowedRoles: Role[] = [Role.BILLING_MANAGER, Role.ADMIN];

const getUnpaidInvoices = async (
  invoicePrisma: PrismaClient,
  organizationId: string
) =>
  await invoicePrisma.invoice.findMany({
    where: {
      order: {
        some: {
          organizationId,
        },
      },
      status: InvoiceStatus.BILLED,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

const getPaidInvoices = async (
  invoicePrisma: PrismaClient,
  organizationId: string
) =>
  await invoicePrisma.invoice.findMany({
    where: {
      order: {
        some: {
          organizationId,
        },
      },
      status: InvoiceStatus.PAID_IN_FULL,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

interface Props {
  unpaidInvoices: Prisma.PromiseReturnType<typeof getUnpaidInvoices>;
  paidInvoices: Prisma.PromiseReturnType<typeof getPaidInvoices>;
  organizationType: OrganizationType;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
}) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  const currentAccount = await prisma.account.findUnique({
    where: {
      id: session.user.currentAccountId ?? "",
    },
    select: {
      employeeId: true,
      role: true,
      organization: {
        select: {
          id: true,
          type: true,
        },
      },
    },
  });

  if (!currentAccount?.organization.id) {
    return {
      redirect: {
        destination: "/404.tsx",
        permanent: false,
      },
    };
  }

  if (!currentAccount?.role || !allowedRoles.includes(currentAccount.role)) {
    return {
      redirect: {
        destination: "/404.tsx",
        permanent: false,
      },
    };
  }

  const organizationId = currentAccount.organization.id;

  const invoicePrisma = prisma.$extends(
    forUser(currentAccount.employeeId)
  ) as PrismaClient;

  const unpaidInvoices = await getUnpaidInvoices(invoicePrisma, organizationId);
  const paidInvoices = await getPaidInvoices(invoicePrisma, organizationId);

  return {
    props: {
      unpaidInvoices: JSON.parse(JSON.stringify(unpaidInvoices)),
      paidInvoices: JSON.parse(JSON.stringify(paidInvoices)),
      organizationType: currentAccount.organization.type,
    },
  };
};

const unpaidInvoicesColumnHelper =
  createColumnHelper<Props["unpaidInvoices"][number]>();

const unpaidInvoicesColumns = [
  unpaidInvoicesColumnHelper.accessor("invoiceNumber", {
    header: () => "Invoice Number",
  }),
  unpaidInvoicesColumnHelper.accessor("amount", {
    header: () => "Total Amount",
    cell: (props) => <p>${props.renderValue()?.toFixed(2) ?? "$0.00"}</p>,
  }),
  unpaidInvoicesColumnHelper.accessor("dueAt", {
    header: () => "Due Date",
    cell: (props) => (
      <p>{dayjs(props.renderValue()).format(SHORT_DATE_FORMAT)}</p>
    ),
  }),
  unpaidInvoicesColumnHelper.accessor("createdAt", {
    header: () => "Created Date",
    cell: (props) => (
      <p>{dayjs(props.renderValue()).format(SHORT_DATE_FORMAT)}</p>
    ),
    enableSorting: true,
  }),
  unpaidInvoicesColumnHelper.accessor("stripeUrl", {
    header: () => "PDF",
    cell: (props) =>
      props.row.original.stripeUrl ? (
        <Link href={props.row.original.stripeUrl}>
          {" "}
          <strong>View Invoice</strong>
        </Link>
      ) : (
        <strong>Not Available</strong>
      ),
  }),
  unpaidInvoicesColumnHelper.accessor("paymentLink", {
    header: () => "Payment Link",
    cell: (props) =>
      props.row.original.paymentLink ? (
        <Link href={props.row.original.paymentLink}>
          <strong>Pay Now</strong>
        </Link>
      ) : (
        <strong>Not Available</strong>
      ),
  }),
];

const paidInvoicesColumnHelper =
  createColumnHelper<Props["paidInvoices"][number]>();

const paidInvoicesColumns = [
  paidInvoicesColumnHelper.accessor("invoiceNumber", {
    header: () => "Invoice Number",
  }),
  paidInvoicesColumnHelper.accessor("amount", {
    header: () => "Total Amount",
    cell: (props) => <p>${props.renderValue()?.toFixed(2) ?? "$0.00"}</p>,
  }),
  paidInvoicesColumnHelper.accessor("dueAt", {
    header: () => "Due Date",
    cell: (props) => (
      <p>{dayjs(props.renderValue()).format(SHORT_DATE_FORMAT)}</p>
    ),
  }),
  paidInvoicesColumnHelper.accessor("createdAt", {
    header: () => "Created Date",
    cell: (props) => (
      <p>{dayjs(props.renderValue()).format(SHORT_DATE_FORMAT)}</p>
    ),
    enableSorting: true,
  }),
];

const ServiceInvoicesPage = ({
  unpaidInvoices,
  paidInvoices,
  organizationType,
}: Props) => {
  return (
    <BillingSubMenu
      activeSection={"services"}
      organizationType={organizationType}
    >
      <div className="flex max-h-screen">
        <div className="flex w-full flex-col overflow-y-auto">
          <div className="sticky top-0 z-20">
            <PageHeader title="Service Request Invoices" />
          </div>
          <div className="flex flex-col items-start pb-10">
            <div className="flex w-full flex-col gap-4 p-8">
              <h1 className="mb-4 text-lg font-semibold dark:text-gray-200">
                Unpaid invoices
              </h1>
              <Table data={unpaidInvoices} columns={unpaidInvoicesColumns} />

              <hr className="border-1 mt-10 w-full border-highlight-600" />
              <h1 className="mb-4 text-lg font-semibold dark:text-gray-200">
                Paid invoices
              </h1>
              <Table data={paidInvoices} columns={paidInvoicesColumns} />
            </div>
          </div>
        </div>
      </div>
    </BillingSubMenu>
  );
};

export default ServiceInvoicesPage;
