import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";

import MainPageLayout from "@/components/layout/MainPageLayout";
import { Role } from "@prisma/client";
import SpecimenTable from "@/components/tables/research/SpecimenTable";
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

  return {
    redirect: {
      destination: "/404.tsx",
      permanent: false,
    },
  };
};

const TestPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({}) => {
  return (
    <MainPageLayout title="Specimen">
      <SpecimenTable />
    </MainPageLayout>
  );
};

export default TestPage;
