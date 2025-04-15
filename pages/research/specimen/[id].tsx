import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { Role, Specimen } from "@prisma/client";

import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import BoxLabelDisplay from "@/components/displays/BoxLabelDisplay";
import { BoxLabelWrapper } from "@/components/displays/BoxLabelWrapper";
import Container from "@/components/layout/Container";
import LabelValueDisplay from "@/components/displays/LabelValueDisplay";
import { LabelValueWrapper } from "@/components/displays/LabelValueWrapper";
import PageHeader from "@/components/layout/PageHeader";
import { Section } from "@/components/common/Section";
import SpecimenStatusBadge from "@/components/misc/badges/SpecimenStatusBadge";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dayjs from "dayjs";
import { fetchResult } from "@/lib/utils";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { toast } from "react-toastify";

const allowedRoles: Role[] = [Role.ADMIN, Role.RESEARCHER, Role.DATA_ANALYST];

interface Props {
  specimen: Specimen & {
    serviceRequest: { project: { name: string }; order: { orderId: string } };
  };
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
  query,
}) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user.id) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  const { id } = query;

  const currentAccount = await prisma.account.findUnique({
    where: {
      id: session.user.currentAccountId ?? "",
    },
    select: {
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

  const specimen = await prisma.specimen.findUnique({
    where: {
      id: id as string,
    },
    select: {
      id: true,
      kitId: true,
      tissueType: true,
      createdAt: true,
      status: true,
      volume: true,
      resultS3Key: true,
      serviceRequest: {
        select: {
          project: {
            select: {
              name: true,
            },
          },
          order: {
            select: {
              orderId: true,
            },
          },
        },
      },
    },
  });

  return {
    props: { specimen: JSON.parse(JSON.stringify(specimen)) },
  };
};

const SpecimenPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ specimen }) => {
  return (
    <div className=" flex w-full flex-col">
      <PageHeader title="Specimen" />
      <Container className="flex flex-col gap-8">
        <div className="rounded-sm border border-secondary-300 bg-primary-600 p-4">
          <div className="flex gap-4">
            <h2 className="mb-4 text-lg font-semibold dark:text-gray-200">
              Specimen Details
            </h2>
            <div>
              <SpecimenStatusBadge status={specimen.status} />
            </div>
          </div>
          <BoxLabelWrapper>
            <BoxLabelDisplay label="Kit ID" value={specimen.kitId} />
            <BoxLabelDisplay
              label="Associated Project"
              value={specimen.serviceRequest.project.name}
            />
            <BoxLabelDisplay
              label="Associated Order"
              value={specimen.serviceRequest.order.orderId}
            />
            <BoxLabelDisplay
              label="Created Date & Time"
              value={dayjs(specimen.createdAt).format("MM/DD/YYYY hh:mm A")}
            />
          </BoxLabelWrapper>
        </div>
        <Section title="Specimen Details">
          <LabelValueWrapper>
            <LabelValueDisplay
              label="Created Date & Time"
              value={dayjs(specimen.createdAt).format("MM/DD/YYYY hh:mm A")}
            />
            <LabelValueDisplay
              label="Tissue Type"
              value={specimen.tissueType}
            />
            <LabelValueDisplay label="Volume" value={specimen.volume} />
            <LabelValueDisplay
              label="Result"
              value={
                specimen.status === "COMPLETED" ? (
                  <a
                    className="flex items-center gap-1 underline"
                    onClick={async () => {
                      const url = await fetchResult(specimen.id);
                      if (url) {
                        window.open(url, "_blank");
                      } else {
                        toast.error("Error retrieving result");
                      }
                    }}
                  >
                    View <ArrowUpRightIcon className="h-4 w-4" />
                  </a>
                ) : (
                  "--"
                )
              }
            />
          </LabelValueWrapper>
        </Section>
      </Container>
    </div>
  );
};

export default SpecimenPage;
