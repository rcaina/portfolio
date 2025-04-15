import { Employee, LicenseStatus, Role, ServiceRequest } from "@prisma/client";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import SelectPractitionerForm, {
  ServiceRequestSelectPractitionerFormInputs,
} from "@/components/forms/ServiceRequestForms/SelectPractitionerForm";

import Container from "@/components/layout/Container";
import PageHeader from "@/components/layout/PageHeader";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dayjs from "dayjs";
import { getServerSession } from "next-auth";
import { parseAndConvertToUTC } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useState } from "react";

interface Props {
  serviceRequest: ServiceRequest & { project: { organizationId: string } };
  practitioners: Employee[];
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
  query,
}) => {
  const session = await getServerSession(req, res, authOptions);
  const { id } = query;

  if (!session?.user.id) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  const serviceRequest = await prisma.serviceRequest.findUnique({
    where: {
      id: id as string,
    },
    select: {
      serviceType: true,
      project: {
        select: {
          organizationId: true,
        },
      },
    },
  });

  if (!serviceRequest) {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }

  const practitioners = await prisma.employee.findMany({
    where: {
      accounts: {
        some: {
          organizationId: serviceRequest.project?.organizationId,
          role: Role.PRACTITIONER,
        },
      },
      licenses: {
        some: {
          expirationDate: {
            gte: parseAndConvertToUTC(dayjs().toISOString()),
          },
          status: LicenseStatus.ACTIVE,
        },
      },
    },
  });

  return {
    props: {
      serviceRequest: JSON.parse(JSON.stringify(serviceRequest)),
      practitioners: JSON.parse(JSON.stringify(practitioners)),
    },
  };
};

const ServiceRequestSelectPractitionerPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ serviceRequest, practitioners }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: ServiceRequestSelectPractitionerFormInputs) => {
    setIsSubmitting(true);
    fetch(`/api/clinical/service/order/${serviceRequest.id}/practitioner`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(async (response) => {
        if (response.ok) {
          toast.success("Practitioner saved successfully");
          return response.json();
        } else {
          const res = await response.json();
          toast.error(res.error ?? "An error occurred saving the practitioner");
        }
      })
      .then((data) => {
        router.push(`/clinical/service/order/${data.id}/upload`);
      })
      .catch((error) => {
        console.error("Error saving practitioner:", error);
        throw new Error("Error saving practitioner");
      })
      .finally(() => setIsSubmitting(false));
  };

  const continueWithoutChange = () => {
    router.push(`/clinical/service/order/${serviceRequest.id}/upload`);
  };

  return (
    <div className=" flex min-h-screen flex-col">
      <PageHeader title={`Practitioner`} />
      <Container>
        <div className="flex flex-grow items-center justify-center">
          <SelectPractitionerForm
            practitioners={practitioners}
            onSubmit={onSubmit}
            continueWithoutChange={continueWithoutChange}
            selectedPractitionerId={serviceRequest.practitionerId ?? ""}
            isSubmitting={isSubmitting}
          />
        </div>
      </Container>
    </div>
  );
};

export default ServiceRequestSelectPractitionerPage;
