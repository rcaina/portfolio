import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";

import Button from "@/components/common/Button";
import PageHeader from "@/components/layout/PageHeader";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { useRouter } from "next/router";

type Props = {
  serviceRequestId: string;
};
export const getServerSideProps: GetServerSideProps<Props> = async ({
  query,
  req,
  res,
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

  const user = await prisma.employee.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    return {
      redirect: {
        destination: "/clinic-sign-up",
        permanent: false,
      },
    };
  }

  return {
    props: { serviceRequestId: id as string },
  };
};

const ServiceRequestCompletedPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ serviceRequestId }: Props) => {
  const router = useRouter();
  return (
    <div className=" flex min-h-screen flex-col ">
      <PageHeader title="Service Request Completed" />
      <div className="flex flex-col p-8">
        <div className="flex flex-col gap-12 rounded-md border border-primary-600 p-8">
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center gap-4 text-sm font-bold">
              Your service request has been placed successfully.
              <Button
                onClick={() => router.push(`/service/${serviceRequestId}`)}
              >
                View Order
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex flex-row items-center gap-2 text-sm font-semibold">
              Please view the following on how to package your specimen for
              shipment.
            </div>
            <div className="flex flex-row items-center gap-2 text-sm">
              [Video/Steps Here]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceRequestCompletedPage;
