import {
  ClipboardDocumentListIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { S3Link, S3ResourceType } from "@/components/misc/S3Link";

import BoxLabelDisplay from "@/components/displays/BoxLabelDisplay";
import { BoxLabelWrapper } from "@/components/displays/BoxLabelWrapper";
import Container from "@/components/layout/Container";
import { GetResearchOrdersResponse } from "@/pages/api/research/order";
import { GetSpecimenResponse } from "@/pages/api/research/specimen";
import PageHeader from "@/components/layout/PageHeader";
import Pagination from "@/components/common/Pagination";
import { Role } from "@prisma/client";
import { SHORT_DATE_FORMAT } from "@/lib/contants";
import { Section } from "@/components/common/Section";
import SpecimenStatusBadge from "@/components/misc/badges/SpecimenStatusBadge";
import { Table } from "@/components/common/Table";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { createColumnHelper } from "@tanstack/react-table";
import { createProjectColumns } from "@/components/tables/research/ProjectTable";
import dayjs from "dayjs";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { useProjects } from "@/lib/hooks/research/useProjects";
import { useSpecimens } from "@/lib/hooks/research/useSpecimens";
import { useState } from "react";

const allowedRoles: Role[] = [Role.ADMIN, Role.RESEARCHER, Role.DATA_ANALYST];

interface Props {
  order: GetResearchOrdersResponse["orders"][number];
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
  query,
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

  const { id } = query;

  const currentAccount = await prisma.account.findUnique({
    where: {
      id: session.user.currentAccountId ?? "",
    },
    select: {
      role: true,
    },
  });

  if (!currentAccount?.role || !allowedRoles.includes(currentAccount.role)) {
    return {
      redirect: {
        destination: "/404.tsx",
        permanent: false,
      },
    };
  }

  const order = await prisma.order.findUnique({
    where: {
      id: id as string,
    },
    select: {
      id: true,
      orderId: true,
      status: true,
      createdAt: true,
      serviceRequests: {
        select: {
          specimen: {
            select: {
              id: true,
              kitId: true,
            },
          },
        },
      },
    },
  });

  return {
    props: { order: JSON.parse(JSON.stringify(order)) },
  };
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
        <SpecimenStatusBadge status={info.row.original.status} />
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

const ResearchOrderPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ order }) => {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [projectPage, setProjectPage] = useState(0);
  const [projectPageSize] = useState(10);

  const { specimens, totalSpecimens } = useSpecimens({
    orderId: order.id,
    page,
    pageSize,
  });
  const totalPages = Math.ceil(totalSpecimens / pageSize);

  const columns = createColumns();

  const { projects, totalProjects } = useProjects({
    // orderId: order.id,
    page,
    pageSize,
  });
  const totalProjectPages = Math.ceil(totalProjects / pageSize);

  const projectColumns = createProjectColumns();

  return (
    <div className=" flex w-full flex-col">
      <PageHeader title="Order" />
      <Container className="flex flex-col gap-8">
        <div className="rounded-sm border border-secondary-300 bg-primary-600 p-4">
          <div className="flex gap-4">
            <h2 className="mb-4 text-lg font-semibold dark:text-gray-200">
              Order Details
            </h2>
            <div>
              <SpecimenStatusBadge status={order.status} />
            </div>
          </div>
          <BoxLabelWrapper>
            <BoxLabelDisplay label="Order ID" value={order.orderId} />
            <BoxLabelDisplay
              label="Total Samples"
              value={specimens.length.toString()}
            />
            <BoxLabelDisplay
              label="Created Date & Time"
              value={dayjs(order.createdAt).format("MM/DD/YYYY hh:mm A")}
            />
          </BoxLabelWrapper>
        </div>
        <Section title="Specimens">
          {specimens.length > 0 ? (
            <Table data={specimens} columns={columns} />
          ) : (
            <div className="flex w-full flex-col items-center gap-4">
              <ClipboardDocumentListIcon className="h-8 w-8 fill-secondary-400" />
              <p>No specimens found</p>
            </div>
          )}
          {specimens.length > pageSize && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setProjectPage(newPage)}
            />
          )}
        </Section>
        <Section title="Associated Projects">
          {projects.length > 0 ? (
            <Table data={projects} columns={projectColumns} />
          ) : (
            <div className="flex w-full flex-col items-center gap-4">
              <FolderIcon className="h-8 w-8 fill-secondary-400" />
              <p>No projects found</p>
            </div>
          )}
          {projects.length > projectPageSize && (
            <Pagination
              page={projectPage}
              totalPages={totalProjectPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}
        </Section>
      </Container>
    </div>
  );
};

export default ResearchOrderPage;
