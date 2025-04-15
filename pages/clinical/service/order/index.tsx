import SelectServiceTypeForm, {
  OrderSelectServiceTypeFormInputs,
} from "@/components/forms/ServiceRequestForms/SelectServiceTypeForm";

import Container from "@/components/layout/Container";
import { GetAccountResponse } from "@/pages/api/current/account/[id]";
import { GetServerSideProps } from "next";
import PageHeader from "@/components/layout/PageHeader";
import { ServiceType } from "@prisma/client";
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
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
}) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user.email) {
    return {
      redirect: {
        destination: "/404.tsx",
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
    },
  };
};

const ServiceRequestPage = ({ serviceTypes }: Props) => {
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
      setIsSubmitting(true);
      fetch(`/api/clinical/service/order/`, {
        method: "POST",
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
          router.push(`/clinical/service/order/${data.id}/patient/`);
          setIsSubmitting(false);
        })
        .catch((error) => {
          console.error("Error saving test order:", error);
          throw new Error("Error saving test order");
        })
        .finally(() => {
          setIsSubmitting(false); // Ensure this happens after the request completes
        });
    } else {
      toast.error("No account found to save order to");
    }
  };

  return (
    <div className=" flex min-h-screen flex-col">
      <PageHeader title={`Order Service`} />
      {!isLocked ? (
        <Container>
          <div className="flex flex-grow items-center justify-center">
            <SelectServiceTypeForm
              serviceTypes={serviceTypes}
              onSubmit={onSubmit}
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
