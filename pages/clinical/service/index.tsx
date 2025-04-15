import { useEffect, useState } from "react";

import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { GetServerSideProps } from "next";
import MainPageLayout from "@/components/layout/MainPageLayout";
import ServiceRequestTable from "@/components/tables/practitioner/ServiceRequestTable";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { organizationAllowedRoles } from "@/lib/utils";
import prisma from "@/lib/prisma";
import useSWR from "swr";

interface Props {
  success: boolean;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  query,
  req,
  res,
}) => {
  const { success } = query;
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
      organization: {
        select: {
          id: true,
          addresses: true,
          billingAddresses: true,
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

  if (
    !currentAccount.organization.addresses ||
    !currentAccount.organization.billingAddresses ||
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
    props: {
      success: success === "true" ? true : false,
    },
  };
};

const ServiceRequestPage = ({ success }: Props) => {
  const [successMessage, setSuccessMessage] = useState(success ?? false);

  const { data: isLocked = true } = useSWR<boolean>(
    `/api/current/license-status`
  );

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <MainPageLayout title="Service Requests" showLock={isLocked}>
      <div>
        {isLocked ? (
          <div className="flex flex-grow items-center justify-center">
            <p className="font-bold ">
              No practitioners with approved credentials found.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {successMessage && (
              <div className="mb-4 rounded-md border border-green-800 bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon
                      className="h-5 w-5 text-green-800"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Service Request Completed
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Your service request has been placed successfully. An
                        email with your invoice will be sent shortly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <ServiceRequestTable />
          </div>
        )}
      </div>
    </MainPageLayout>
  );
};

export default ServiceRequestPage;
