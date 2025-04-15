import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import KitAssignmentForm, {
  ServiceRequestKitAssignmentFormInputs,
} from "@/components/forms/ServiceRequestForms/KitAssignmentForm";
import { ServiceRequest, ServiceType } from "@prisma/client";

import Container from "@/components/layout/Container";
import PageHeader from "@/components/layout/PageHeader";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useState } from "react";

interface Props {
  serviceRequest: ServiceRequest & {
    serviceType: ServiceType;
    specimen: { kitId: string };
  };
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
  query,
}) => {
  const session = await getServerSession(req, res, authOptions);

  const { id } = query;

  if (!session?.user.id || !id) {
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
    include: {
      serviceType: true,
      specimen: {
        select: {
          kitId: true,
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

  return {
    props: {
      serviceRequest: JSON.parse(JSON.stringify(serviceRequest)),
    },
  };
};

const ServiceRequestKitAssignmentPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ serviceRequest }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: ServiceRequestKitAssignmentFormInputs) => {
    setIsSubmitting(true);
    fetch(`/api/clinical/service/order/${serviceRequest.id}/kit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(async (response) => {
        if (response.ok) {
          toast.success("Kit ID saved successfully");
          return response.json();
        } else {
          const res = await response.json();
          toast.error(res.error ?? "An error occurred saving the kit ID");
        }
      })
      .then((data) => {
        if (data) {
          router.push(`/clinical/service/order/${data.id}/practitioner`);
        }
      })
      .catch((error) => {
        console.error("Error saving kit ID:", error);
        throw new Error("Error saving kit ID");
      })
      .finally(() => setIsSubmitting(false));
  };

  const continueWithoutChange = () => {
    router.push(`/clinical/service/order/${serviceRequest.id}/practitioner`);
  };

  return (
    <div className=" flex min-h-screen flex-col">
      <PageHeader title={`Kit Assignment`} />
      <Container>
        <div className="flex flex-grow items-center justify-center">
          <KitAssignmentForm
            onSubmit={onSubmit}
            continueWithoutChange={continueWithoutChange}
            serviceRequest={serviceRequest}
            isSubmitting={isSubmitting}
          />
        </div>
      </Container>
    </div>
  );
};

export default ServiceRequestKitAssignmentPage;
