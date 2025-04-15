import {
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
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
import { GetResearchProjectsResponse } from "@/pages/api/research/project";
import { GetSpecimenResponse } from "@/pages/api/research/specimen";
import PageHeader from "@/components/layout/PageHeader";
import Pagination from "@/components/common/Pagination";
import ProjectStatusBadge from "@/components/misc/badges/ProjectStatusBadge";
import { Role } from "@prisma/client";
import { SHORT_DATE_FORMAT } from "@/lib/contants";
import { Section } from "@/components/common/Section";
import SpecimenStatusBadge from "@/components/misc/badges/SpecimenStatusBadge";
import { Table } from "@/components/common/Table";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { createColumnHelper } from "@tanstack/react-table";
import { createOrderColumns } from "@/components/tables/research/OrderTable";
import dayjs from "dayjs";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { useOrders } from "@/lib/hooks/research/useOrders";
import { useSpecimens } from "@/lib/hooks/research/useSpecimens";
import { useState } from "react";

const allowedRoles: Role[] = [Role.ADMIN, Role.RESEARCHER, Role.DATA_ANALYST];

interface Props {
  project: GetResearchProjectsResponse["projects"][number];
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
  query,
}) => {
  const session = await getServerSession(req, res, authOptions);
  const { id } = query;

  if (!id) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  if (!session?.user.currentAccountId) {
    return {
      redirect: {
        destination: "/404.tsx",
        permanent: false,
      },
    };
  }

  const currentAccount = await prisma.account.findUnique({
    where: {
      id: session.user.currentAccountId,
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

  const project = await prisma.project.findUnique({
    where: {
      id: id as string,
    },
    select: {
      id: true,
      name: true,
      leadName: true,
      active: true,
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
    props: { project: JSON.parse(JSON.stringify(project)) },
  };
};

const columnHelper =
  createColumnHelper<GetSpecimenResponse["specimens"][number]>();

const createSpecimenColumns = () => [
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

const ResearchProjectPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ project }) => {
  const [specimenPage, setSpecimenPage] = useState(0);
  const [specimenPageSize] = useState(10);
  const [orderPage, setOrderPage] = useState(0);
  const [orderPageSize] = useState(10);

  const { specimens, totalSpecimens } = useSpecimens({
    projectIds: [project.id],
    page: specimenPage,
    pageSize: specimenPageSize,
  });
  const totalSpecimensPages = Math.ceil(totalSpecimens / specimenPageSize);

  const specimenColumns = createSpecimenColumns();

  const { orders, totalOrders } = useOrders({
    projectIds: [project.id],
    page: specimenPage,
    pageSize: specimenPageSize,
  });
  const totalOrderPages = Math.ceil(totalOrders / specimenPageSize);

  const orderColumns = createOrderColumns();
  return (
    <div className=" flex w-full flex-col overflow-y-auto">
      <PageHeader title="Project" />
      <Container className="flex flex-col gap-8">
        <div className="rounded-sm border border-secondary-300 bg-primary-600 p-4">
          <div className="flex gap-4">
            <h2 className="mb-4 text-lg font-semibold dark:text-gray-200">
              Project Details
            </h2>
            <div>
              <ProjectStatusBadge status={"false"} />
            </div>
          </div>
          <BoxLabelWrapper>
            <BoxLabelDisplay label="Project Label" value={project.name} />
            <BoxLabelDisplay label="Lead Contact" value={project.leadName} />
            <BoxLabelDisplay
              label="Total Samples"
              value={specimens.length.toString()}
            />
            <BoxLabelDisplay
              label="Created Date & Time"
              value={dayjs(project.createdAt).format("MM/DD/YYYY hh:mm A")}
            />
          </BoxLabelWrapper>
        </div>

        <Section title="Specimens">
          {specimens.length > 0 ? (
            <Table data={specimens} columns={specimenColumns} />
          ) : (
            <div className="flex w-full flex-col items-center gap-4">
              <ClipboardDocumentListIcon className="h-8 w-8 fill-secondary-400" />
              <p>No specimens found</p>
            </div>
          )}
          {specimens.length > specimenPageSize && (
            <Pagination
              page={specimenPage}
              totalPages={totalSpecimensPages}
              onPageChange={(newPage) => setSpecimenPage(newPage)}
            />
          )}
        </Section>
        <Section title="Associated Orders">
          {orders.length > 0 ? (
            <Table data={orders} columns={orderColumns} />
          ) : (
            <div className="flex w-full flex-col items-center gap-4">
              <ClipboardDocumentCheckIcon className="h-8 w-8 fill-secondary-400" />
              <p>No orders found</p>
            </div>
          )}
          {orders.length > orderPageSize && (
            <Pagination
              page={orderPage}
              totalPages={totalOrderPages}
              onPageChange={(newPage) => setOrderPage(newPage)}
            />
          )}
        </Section>
      </Container>
    </div>
  );
};

export default ResearchProjectPage;
