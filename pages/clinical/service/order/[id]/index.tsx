import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { S3Link, S3ResourceType } from "@/components/misc/S3Link";

import Button from "@/components/common/Button";
import Container from "@/components/layout/Container";
import PageHeader from "@/components/layout/PageHeader";
import { ServiceRequest } from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useState } from "react";

interface Props {
  serviceRequest: ServiceRequest & {
    order: {
      status: string;
      reqFormS3Key: string;
    };
    patient: {
      fullName: true;
    };
    practitioner: {
      fullName: true;
    };
    serviceType: {
      name: string;
    };
    specimen: {
      id: string;
      kitId: string;
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
    include: {
      order: {
        select: {
          status: true,
          reqFormS3Key: true,
        },
      },
      patient: {
        select: {
          fullName: true,
        },
      },
      practitioner: {
        select: {
          fullName: true,
        },
      },
      serviceType: {
        select: {
          name: true,
        },
      },
      specimen: {
        select: {
          id: true,
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

const ServiceRequestSelectPatientPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ serviceRequest }) => {
  const router = useRouter();
  const [verify, setVerify] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    setIsSubmitting(true);
    fetch(`/api/clinical/service/order/${serviceRequest.id}/complete-order`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        if (response.ok) {
          toast.success("Service Request placed successfully");
          return response.json();
        } else {
          const res = await response.json();
          toast.error(res.error ?? "An error occurred placing service request");
        }
      })
      .then(() => {
        router.push(`/clinical/service/order/${serviceRequest.id}/completed`);
      })
      .catch((error) => {
        console.error("Error placing service request:", error);
        throw new Error("Error placing service request");
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className=" flex min-h-screen flex-col ">
      <PageHeader title={`Review`} />
      <Container>
        <div className="flex flex-grow items-center justify-center">
          {serviceRequest && (
            <div className="flex w-full max-w-2xl flex-col gap-4 rounded-md bg-white pb-8 pl-8 pr-8 pt-2 shadow-lg">
              <PageHeader title={`Service Details`} />
              <div className="grid grid-cols-2 gap-4 p-4">
                <div className="text-md col-span-2 flex items-center justify-between">
                  <div className="flex gap-4">
                    <strong>Test:</strong>
                    <div className="flex flex-col rounded-md">
                      {serviceRequest.serviceType.name}
                    </div>
                  </div>
                  <div>
                    <Button
                      size="sm"
                      variant="underline"
                      onClick={() =>
                        router.push(
                          `/clinical/service/order/${serviceRequest.id}/type`
                        )
                      }
                    >
                      Edit
                    </Button>
                  </div>
                </div>
                <div className="text-md col-span-2 flex items-center justify-between">
                  <div className="flex gap-4">
                    <strong>Patient:</strong>
                    <div className="flex flex-col rounded-md">
                      {serviceRequest.patient?.fullName}
                    </div>
                  </div>
                  <div>
                    <Button
                      size="sm"
                      variant="underline"
                      onClick={() =>
                        router.push(
                          `/clinical/service/order/${serviceRequest.id}/patient`
                        )
                      }
                    >
                      Edit
                    </Button>
                  </div>
                </div>
                <div className="col-span-2 flex justify-between gap-4">
                  <strong>Specimen Kit:</strong>
                  <div>
                    <Button
                      size="sm"
                      variant="underline"
                      onClick={() =>
                        router.push(
                          `/clinical/service/order/${serviceRequest.id}/kit`
                        )
                      }
                    >
                      Edit
                    </Button>
                  </div>
                </div>
                <div
                  key={serviceRequest.specimen.id}
                  className="text-md col-span-2 flex items-center justify-between pl-8"
                >
                  <div className="flex gap-4 text-sm">
                    <strong>ID:</strong>
                    <div className="flex flex-col rounded-md">
                      {serviceRequest.specimen.kitId}
                    </div>
                  </div>
                </div>
                <div className="text-md col-span-2 flex items-center justify-between">
                  <div className="flex gap-4">
                    <strong>Ordering Practitioner:</strong>
                    <div className="flex flex-col rounded-md">
                      {serviceRequest.practitioner?.fullName}
                    </div>
                  </div>
                  <div>
                    <Button
                      size="sm"
                      variant="underline"
                      onClick={() =>
                        router.push(
                          `/clinical/service/order/${serviceRequest.id}/practitioner`
                        )
                      }
                    >
                      Edit
                    </Button>
                  </div>
                </div>
                <div className="text-md col-span-2 flex items-center justify-between">
                  <div className="flex gap-4">
                    <strong>Requisition Form:</strong>
                    <div className="flex flex-col justify-end rounded-md">
                      <div className="flex flex-col rounded-md">
                        {serviceRequest.order.reqFormS3Key && (
                          <div className="col-span-2 flex text-sm">
                            <S3Link
                              text="View Requisition Form"
                              resourceType={S3ResourceType.REQUISITION_FORM}
                              resourceIdentifier={
                                serviceRequest.order.reqFormS3Key
                              }
                              allowedToView={true}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Button
                      size="sm"
                      variant="underline"
                      onClick={() =>
                        router.push(
                          `/clinical/service/order/${serviceRequest.id}/upload`
                        )
                      }
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-8">
                <div className="flex flex-row items-center gap-2 pl-4">
                  <input
                    id="verify"
                    checked={verify}
                    type="checkbox"
                    className="rounded border-gray-300 text-highlight-600 focus:ring-highlight-600"
                    onChange={() => setVerify(!verify)}
                  />
                  <label
                    className="text-sm text-secondary-500"
                    htmlFor="verify"
                  >
                    <strong>I verify that this information is correct</strong>
                  </label>
                </div>
                <Button
                  variant="primary"
                  onClick={onSubmit}
                  disabled={!verify}
                  loading={isSubmitting}
                >
                  Place Order
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default ServiceRequestSelectPatientPage;
