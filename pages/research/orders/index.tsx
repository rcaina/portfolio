import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";

import MainPageLayout from "@/components/layout/MainPageLayout";
import OrderTable from "@/components/tables/research/OrderTable";
import { Role } from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

type Props = Record<string, unknown>;

const allowedRoles: Role[] = [
  Role.RESEARCHER,
  Role.ADMIN,
  Role.DATA_ANALYST,
  Role.PROJECT_MANAGER,
];

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

  return {
    props: {},
  };
};

const ResearchOrdersPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({}) => {
  return (
    <MainPageLayout title="Orders">
      <OrderTable />
    </MainPageLayout>
  );
};

export default ResearchOrdersPage;
