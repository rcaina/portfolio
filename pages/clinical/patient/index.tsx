import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";

import MainPageLayout from "@/components/layout/MainPageLayout";
import PatientTable from "@/components/tables/practitioner/PatientTable";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { organizationAllowedRoles } from "@/lib/utils";
import prisma from "@/lib/prisma";
import useSWR from "swr";

type Props = Record<string, never>;

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
    props: {},
  };
};

const PatientsPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({}) => {
  const { data: isLocked = true } = useSWR<boolean>(
    `/api/current/license-status`
  );

  return (
    <MainPageLayout title="Patients" showLock={isLocked}>
      <PatientTable />
    </MainPageLayout>
  );
};

export default PatientsPage;
