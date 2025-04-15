import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import RequisitionFileUploadForm, {
  ServiceRequestRequisitionFileUploadFormInputs,
} from "@/components/forms/ServiceRequestForms/RequisitionFileUploadForm";
import { S3Bucket, upload } from "@/lib/utils";

import Container from "@/components/layout/Container";
import PageHeader from "@/components/layout/PageHeader";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useState } from "react";

interface Props {
  serviceRequest: { id: string } & {
    order: {
      reqFormS3Key: string;
    };
  };
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
  query,
}) => {
  const session = await getServerSession(req, res, authOptions);

  const { id } = query;

  if (!session?.user.email || !id) {
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

const ServiceRequestRequisitionFormFilePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ serviceRequest }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async ({
    requisitionForm,
  }: ServiceRequestRequisitionFileUploadFormInputs) => {
    setIsSubmitting(true);
    const { s3FileId: requisitionFormS3Key } = await upload(
      requisitionForm[0],
      S3Bucket.REQUISITION_FORMS
    );

    fetch(`/api/clinical/service/order/${serviceRequest.id}/upload`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requisitionFormS3Key }),
    })
      .then(async (response) => {
        if (response.ok) {
          toast.success("Requisition form saved successfully");
          return response.json();
        } else {
          const res = await response.json();
          toast.error(
            res.error ?? "An error occurred saving the requisition form"
          );
        }
      })
      .then((data) => {
        router.push(`/clinical/service/order/${data.id}`);
      })
      .catch((error) => {
        console.error("Error saving requisition form:", error);
        throw new Error("Error saving requisition form");
      })
      .finally(() => setIsSubmitting(false));
  };

  const continueWithoutUpload = async () => {
    router.push(`/clinical/service/order/${serviceRequest.id}`);
  };

  return (
    <div className=" flex min-h-screen flex-col">
      <PageHeader title={`Requisition Form Upload`} />
      <Container>
        <div className="flex flex-grow items-center justify-center">
          <RequisitionFileUploadForm
            onSubmit={onSubmit}
            continueWithoutUpload={continueWithoutUpload}
            serviceRequest={serviceRequest}
            isSubmitting={isSubmitting}
          />
        </div>
      </Container>
    </div>
  );
};

export default ServiceRequestRequisitionFormFilePage;
