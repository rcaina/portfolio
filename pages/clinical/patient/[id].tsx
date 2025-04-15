import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";

import Container from "@/components/layout/Container";
import LabelValueDisplay from "@/components/displays/LabelValueDisplay";
import PageHeader from "@/components/layout/PageHeader";
import { Patient } from "@prisma/client";
import ServiceTable from "@/components/tables/practitioner/patient/ServiceTable";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dayjs from "dayjs";
import { getServerSession } from "next-auth";
import { organizationAllowedRoles } from "@/lib/utils";
import prisma from "@/lib/prisma";

interface Props {
  patient: Patient;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
  query,
}) => {
  const session = await getServerSession(req, res, authOptions);
  const { id } = query;

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
      id: session.user.id,
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

  const patient = await prisma.patient.findUnique({
    where: {
      id: id as string,
    },
  });

  return {
    props: { patient: JSON.parse(JSON.stringify(patient)) },
  };
};

const PractitionerPatientPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ patient }) => {
  return (
    <div className=" flex min-h-screen flex-col">
      <PageHeader title={patient.fullName} />
      <Container className="flex flex-col gap-8">
        <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-lg font-semibold  dark:text-gray-200">
              Patient Information
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <LabelValueDisplay label="Sex" value={patient.sex} />
              <LabelValueDisplay
                label="DOB"
                value={dayjs(patient.dateOfBirth).format("MM/DD/YYYY")}
              />
            </div>
          </div>
        </div>
        <hr className="border border-primary-300" />
        <ServiceTable patientId={patient.id} />
      </Container>
    </div>
  );
};

export default PractitionerPatientPage;
