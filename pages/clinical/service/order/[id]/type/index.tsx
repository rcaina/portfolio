import SelectServiceTypeForm, {
  OrderSelectServiceTypeFormInputs,
} from "@/components/forms/ServiceRequestForms/SelectServiceTypeForm";
import { ServiceRequest, ServiceType } from "@prisma/client";

import Container from "@/components/layout/Container";
import { GetAccountResponse } from "@/pages/api/current/account/[id]";
import { GetServerSideProps } from "next";
import PageHeader from "@/components/layout/PageHeader";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface Props {
  serviceTypes: ServiceType[];
  serviceRequest: ServiceRequest;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  query,
  req,
  res,
}) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user.email) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  const { id } = query;

  if (!id) {
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

  const currentAccount = await prisma.account.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      organization: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!currentAccount?.organization.id) {
    return {
      redirect: {
        destination: "/404.tsx",
        permanent: false,
      },
    };
  }

  const serviceTypes = await prisma.serviceType.findMany({
    where: {
      deleted: false,
    },
  });

  return {
    props: {
      serviceTypes: JSON.parse(JSON.stringify(serviceTypes)),
      serviceRequest: JSON.parse(JSON.stringify(serviceRequest)),
    },
  };
};

const ServiceRequestPage = ({ serviceTypes, serviceRequest }: Props) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: currentAccount } = useSWR<GetAccountResponse>(
    session?.user.id
      ? `/api/current/account/${session.user.currentAccountId}`
      : null,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    }
  );
  const { data: isLocked = true } = useSWR<boolean>(
    `/api/current/license-status`
  );

  const onSubmit = (data: OrderSelectServiceTypeFormInputs) => {
    if (currentAccount) {
      fetch(`/api/clinical/service/order/${serviceRequest.id}/type`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then(async (response) => {
          if (response.ok) {
            toast.success("Test order saved successfully");
            return response.json();
          } else {
            const res = await response.json();
            toast.error(res.error ?? "An error occurred saving the test order");
          }
        })
        .then((data) => {
          if (data) router.push(`/clinical/service/order/${data.id}/patient/`);
        })
        .catch((error) => {
          console.error("Error saving test order:", error);
          throw new Error("Error saving test order");
        })
        .finally(() => setIsSubmitting(false));
    } else {
      toast.error("No account found to save order to");
    }
  };

  const continueWithoutChange = () => {
    router.push(`/clinical/service/order/${serviceRequest.id}/patient/`);
  };

  return (
    <div className=" flex min-h-screen flex-col">
      <PageHeader title={`Order Service`} />
      {!isLocked ? (
        <Container>
          <div className="flex flex-grow items-center justify-center">
            <SelectServiceTypeForm
              onSubmit={onSubmit}
              continueWithoutChange={continueWithoutChange}
              serviceTypes={serviceTypes}
              selectedServiceTypeId={serviceRequest.serviceTypeId}
              isSubmitting={isSubmitting}
            />
          </div>
        </Container>
      ) : (
        <div className="flex flex-grow items-center justify-center">
          <p className="font-bold ">
            No practitioners with approved credentials found.
          </p>
        </div>
      )}
    </div>
  );
};

export default ServiceRequestPage;
