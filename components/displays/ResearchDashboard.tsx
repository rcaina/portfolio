import {
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";

import { InvoiceStatus } from "@prisma/client";
import { MEDIUM_DATE_FORMAT } from "@/lib/contants";
import { ResearchDashboardPageProps } from "@/pages/research/dashboard";
import { Section } from "../common/Section";
import SpecimenStatusBadge from "../misc/badges/SpecimenStatusBadge";
import { Table } from "../common/Table";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { createColumnHelper } from "@tanstack/react-table";
import dayjs from "dayjs";

const projectsColumnHelper = createColumnHelper<{
  id: string;
  name: string;
  leadName: string;
  active: boolean;
  createdAt: Date;
}>();

export const createProjectColumns = () => [
  projectsColumnHelper.accessor("name", {
    header: () => "Label",
    cell: (info) => <strong>{info.renderValue()}</strong>,
  }),
  projectsColumnHelper.accessor("leadName", {
    header: () => "Lead Contact",
    cell: (info) => info.renderValue(),
    enableSorting: true,
  }),
  projectsColumnHelper.accessor("active", {
    header: "Active",
    cell: (info) => info.renderValue(),
    enableSorting: true,
  }),
  projectsColumnHelper.accessor("createdAt", {
    header: () => "Created Date",
    cell: (info) => dayjs(info.renderValue()).format(MEDIUM_DATE_FORMAT),
  }),
];

const ordersColumnHelper = createColumnHelper<{
  id: string;
  orderId: string;
  status: string;
  submittedToLab: boolean;
  createdAt: Date;
}>();

export const createOrderColumns = () => [
  ordersColumnHelper.accessor("orderId", {
    header: () => "Order ID",
    cell: (info) => <strong>{info.renderValue()}</strong>,
  }),
  ordersColumnHelper.accessor("status", {
    header: () => "Status",
    cell: (info) => info.renderValue(),
    enableSorting: true,
  }),
  ordersColumnHelper.accessor("submittedToLab", {
    header: () => "Submitted to Lab",
    cell: (info) =>
      info.renderValue() === true ? (
        <CheckCircleIcon className="h-5 w-5" />
      ) : (
        <XCircleIcon className="h-5 w-5" />
      ),
    enableSorting: true,
  }),
  ordersColumnHelper.accessor("createdAt", {
    header: () => "Created Date",
    cell: (info) => dayjs(info.renderValue()).format(MEDIUM_DATE_FORMAT),
  }),
];

const specimensColumnHelper = createColumnHelper<{
  id: string;
  kitId: string;
  status: string;
  createdAt: Date;
}>();

export const createSpecimenColumns = () => [
  specimensColumnHelper.accessor("kitId", {
    header: () => "Specimen ID",
    cell: (info) => <strong>{info.renderValue()}</strong>,
  }),
  specimensColumnHelper.accessor("status", {
    header: () => "Status",
    cell: (info) =>
      info.row.original.status && (
        <SpecimenStatusBadge status={info.row.original.status} />
      ),
    enableSorting: true,
  }),
  specimensColumnHelper.accessor("createdAt", {
    header: () => "Created Date",
    cell: (info) => dayjs(info.renderValue()).format(MEDIUM_DATE_FORMAT),
  }),
];

const invoicesColumnHelper = createColumnHelper<{
  id: string;
  invoiceNumber: string | null;
  status: InvoiceStatus;
  amount: number;
  dueAt: Date | null;
}>();

export const createInvoiceColumns = () => [
  invoicesColumnHelper.accessor("invoiceNumber", {
    header: () => "Invoice Number",
    cell: (info) => <strong>{info.renderValue()}</strong>,
  }),
  invoicesColumnHelper.accessor("status", {
    header: () => "Status",
    cell: (info) =>
      info.row.original.status && (
        <SpecimenStatusBadge status={info.row.original.status} />
      ),
    enableSorting: true,
  }),
  invoicesColumnHelper.accessor("amount", {
    header: () => "Amount",
    cell: (info) => info.renderValue(),
  }),
  invoicesColumnHelper.accessor("dueAt", {
    header: () => "Due Date",
    cell: (info) => dayjs(info.renderValue()).format(MEDIUM_DATE_FORMAT),
  }),
];

export default function ResearchDashboard({
  projects,
  orders,
  specimens,
  invoices,
}: Pick<
  ResearchDashboardPageProps,
  "projects" | "orders" | "specimens" | "invoices"
>) {
  const projectsColumns = createProjectColumns();
  const ordersColumns = createOrderColumns();
  const specimensColumns = createSpecimenColumns();
  const invoicesColumns = createInvoiceColumns();

  return (
    <div className="grid grid-cols-2 gap-4 p-8">
      <Section title="Current Projects">
        {projects.length > 0 ? (
          <Table columns={projectsColumns} data={projects} />
        ) : (
          <div className="flex w-full flex-col items-center gap-4">
            <FolderIcon className="h-8 w-8" />
            <p>No projects 🎉</p>
          </div>
        )}
      </Section>
      <Section title="Recent Orders">
        {orders.length > 0 ? (
          <Table columns={ordersColumns} data={orders} />
        ) : (
          <div className="flex w-full flex-col items-center gap-4">
            <ClipboardDocumentCheckIcon className="h-8 w-8" />
            <p>No orders 🎉</p>
          </div>
        )}
      </Section>
      <Section title="Recent Specimens">
        {specimens.length > 0 ? (
          <Table columns={specimensColumns} data={specimens} />
        ) : (
          <div className="flex w-full flex-col items-center gap-4">
            <ClipboardDocumentListIcon className="h-8 w-8" />
            <p>No specimens 🎉</p>
          </div>
        )}
      </Section>
      <Section title="Recent Invoices">
        {invoices.length > 0 ? (
          <Table columns={invoicesColumns} data={invoices} />
        ) : (
          <div className="flex w-full flex-col items-center gap-4">
            <CurrencyDollarIcon className="h-8 w-8" />
            <p>No invoices 🎉</p>
          </div>
        )}
      </Section>
    </div>
  );
}
