import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";

import MainPageLayout from "@/components/layout/MainPageLayout";
import { Role } from "@prisma/client";
import SpecimenTable from "@/components/tables/practitioner/SpecimenTable";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import useSWR from "swr";

interface Props {
  practitionerId: string;
}

const allowedRoles: Role[] = [Role.PRACTITIONER];

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
    props: {
      practitionerId: currentAccount.employeeId,
    },
  };
};

const TestPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ practitionerId }) => {
  const { data: isLocked = true } = useSWR<boolean>(
    `/api/current/license-status`
  );

  return (
    <MainPageLayout title="Specimen" showLock={isLocked}>
      <SpecimenTable practitionerId={practitionerId} />
    </MainPageLayout>
  );
};

export default TestPage;
