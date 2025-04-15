import Container from "@/components/layout/Container";
import { GetServerSideProps } from "next";
import PageHeader from "@/components/layout/PageHeader";
import { ServiceRequest } from "@prisma/client";
import ServiceTypeQuestionnaireADisplay from "@/components/displays/ServiceTypeQuestionaires/ServiceTypeQuestionaireAModal";
import ServiceTypeQuestionnaireBDisplay from "@/components/displays/ServiceTypeQuestionaires/ServiceTypeQuestionaireBModal";
import assert from "assert";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { parseJsonValue } from "@/lib/utils";
import prisma from "@/lib/prisma";
import useSWR from "swr";

interface Props {
  serviceRequest: ServiceRequest;
  serviceTypeId: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  query,
  req,
  res,
}) => {
  const session = await getServerSession(req, res, authOptions);
  const { id } = query;
  assert(typeof id === "string");

  if (!session?.user.id || !id) {
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
  const serviceRequest = await prisma.serviceRequest.findUnique({
    where: {
      id: id as string,
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

  if (!currentAccount?.role) {
    return {
      redirect: {
        destination: "/404.tsx",
        permanent: false,
      },
    };
  }

  return {
    props: {
      serviceRequest: JSON.parse(JSON.stringify(serviceRequest)),
      serviceTypeId: serviceRequest.serviceTypeId,
    },
  };
};

const ServiceRequestQuestionnairePage = ({
  serviceRequest,
  serviceTypeId,
}: Props) => {
  const { data: isLocked = true } = useSWR<boolean>(
    `/api/current/license-status`
  );
  const readableObject = parseJsonValue(serviceRequest.questionnaire);

  return (
    <div className=" flex min-h-screen flex-col">
      <PageHeader title={`Questionnaire Form(s)`} />
      {!isLocked ? (
        <Container>
          {serviceTypeId === `cm1ux66ys0006uurgl5kjmp66` ? (
            <div className="flex flex-grow items-center justify-center">
              <ServiceTypeQuestionnaireADisplay
                serviceRequestId={serviceRequest.id}
                answers={readableObject}
              />
            </div>
          ) : serviceTypeId === `cm0zqktx20008r2gkk5mtgbhk` ? (
            <div className="flex flex-grow items-center justify-center">
              <ServiceTypeQuestionnaireBDisplay
                serviceRequestId={serviceRequest.id}
              />
            </div>
          ) : (
            <div className="flex flex-grow items-center justify-center  ">
              <strong className="flex min-h-screen w-full items-center justify-center">
                No questionnaire found for this service.
              </strong>
            </div>
          )}
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

export default ServiceRequestQuestionnairePage;
