import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { OrganizationType, Prisma, Role } from "@prisma/client";

import Button from "@/components/common/Button";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import ResearchDashboard from "@/components/displays/ResearchDashboard";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { isEmpty } from "lodash-es";
import prisma from "@/lib/prisma";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const allowedRoles: Role[] = [
  Role.ADMIN,
  Role.RESEARCHER,
  Role.DATA_ANALYST,
  Role.PROJECT_MANAGER,
];

const getResearchDashboardPageData = async (organizationId?: string) => {
  if (!organizationId) {
    return {
      projects: [],
      orders: [],
      specimens: [],
      invoices: [],
    };
  }

  const projectsPromise = prisma.project.findMany({
    where: {
      organizationId,
      deleted: false,
    },
    select: {
      id: true,
      name: true,
      leadName: true,
      active: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const ordersPromise = prisma.order.findMany({
    where: {
      organizationId,
      deleted: false,
    },
    select: {
      id: true,
      orderId: true,
      status: true,
      submittedToLab: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const specimensPromise = prisma.specimen.findMany({
    where: {
      serviceRequest: {
        project: {
          organizationId,
        },
      },
      deleted: false,
    },
    select: {
      id: true,
      kitId: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const invoicesPromise = prisma.invoice.findMany({
    where: {
      order: {
        some: {
          organizationId,
        },
      },
      deleted: false,
    },
    select: {
      id: true,
      invoiceNumber: true,
      status: true,
      amount: true,
      dueAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const [projects, orders, specimens, invoices] = await Promise.all([
    projectsPromise,
    ordersPromise,
    specimensPromise,
    invoicesPromise,
  ]);
  return {
    projects,
    orders,
    specimens,
    invoices,
  };
};

type GetResearchDashboardPageData = Prisma.PromiseReturnType<
  typeof getResearchDashboardPageData
>;

export type ResearchDashboardPageProps = GetResearchDashboardPageData;

export const getServerSideProps: GetServerSideProps<
  ResearchDashboardPageProps
> = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  const user = await prisma.employee.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      accounts: {
        select: {
          role: true,
          organization: {
            select: {
              id: true,
              billingAddresses: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return {
      redirect: {
        destination: "/clinic-sign-up",
        permanent: false,
      },
    };
  }

  if (
    user.accounts.length === 1 &&
    isEmpty(user.accounts[0].organization.billingAddresses)
  ) {
    return {
      redirect: {
        destination: `/billing-info`,
        permanent: false,
      },
    };
  }

  if (!allowedRoles.includes(user.accounts[0].role)) {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }

  const pageData = await getResearchDashboardPageData(
    user.accounts[0].organization.id
  );

  return {
    props: JSON.parse(JSON.stringify(pageData)),
  };
};

const ResearchViewDashboardPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ projects, orders, specimens, invoices }) => {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="flex w-full flex-col">
      <PageHeader title={`Welcome, ${session?.user.name}`} />
      <div className="flex flex-col overflow-y-auto">
        <ResearchDashboard
          projects={projects}
          orders={orders}
          specimens={specimens}
          invoices={invoices}
        />

        <div className="h-1/3 rounded-md p-8">
          <h2 className="ml-4 mt-4 flex text-xl ">Quick Links</h2>
          <div className="flex w-full flex-col items-center justify-center gap-12 pt-4">
            <div className="grid min-h-32 w-full grid-cols-1 gap-4 md:grid-cols-3">
              {session?.user?.accountType === OrganizationType.CLINICAL && (
                <div className="shadow-b flex flex-col items-center justify-center rounded-md border border-highlight-600 p-4 shadow-lg shadow-highlight-600">
                  <h3 className="text-xl ">Submit New Order</h3>
                  <Link
                    className=" text-highlight-600"
                    href="https://www.resonantdx.com/"
                    target="_blank"
                  >
                    Download Template
                  </Link>
                </div>
              )}

              <div className="shadow-b flex flex-col items-center justify-center rounded-md border border-highlight-600 p-4 shadow-lg shadow-highlight-600">
                <h3 className="text-xl ">Profile Details</h3>
                <Button
                  className=" text-highlight-600"
                  variant={"ghost"}
                  onClick={() => router.push("/settings/personal")}
                >
                  View Profile
                </Button>
              </div>

              <div className="shadow-b flex flex-col items-center justify-center rounded-md border border-highlight-600 p-4 shadow-lg shadow-highlight-600">
                <h3 className="text-xl ">Pay Invoice</h3>
                <Button
                  className=" text-highlight-600"
                  variant={"ghost"}
                  onClick={() => router.push("/billing/invoices/services")}
                >
                  View Invoices
                </Button>
              </div>
              {session?.user?.accountType === OrganizationType.RESEARCH && (
                <div className="shadow-b flex flex-col items-center justify-center rounded-md border border-highlight-600 p-4 shadow-lg shadow-highlight-600">
                  <h3 className="text-xl ">Contact Support</h3>
                  <Button
                    className=" text-highlight-600"
                    variant={"ghost"}
                    onClick={() => router.push("/support")}
                  >
                    Go to Support
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchViewDashboardPage;
