import { Address, Employee } from "@prisma/client";

import BillingInformationForm from "@/components/forms/auth/BillingInformationForm";
import { GetServerSideProps } from "next";
import ProgressSteps from "@/components/displays/ProgressDisplay";
import { SubmitHandler } from "react-hook-form";
import { authOptions } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { isEmpty } from "lodash-es";
import prisma from "@/lib/prisma";
import { toast } from "react-toastify";
import { z } from "zod";

export const FinishEmployeeSignUpFormSchema = z.object({
  label: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
  billingEmails: z.array(z.string().email()),
});

export type BillingInformationFormInputs = z.infer<
  typeof FinishEmployeeSignUpFormSchema
>;

interface Props {
  redirect?: string;
  loggedInUser: Employee & {
    accounts: {
      organization: { id: string; addresses: Address[] };
    }[];
  };
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
  query,
}) => {
  const { redirect_url } = query;
  const redirect = redirect_url?.toString() ?? "/";
  const session = await getServerSession(req, res, authOptions);

  const user = await prisma.employee.findUnique({
    where: {
      id: session?.user.id as string,
    },
    include: {
      accounts: {
        select: {
          organization: {
            select: {
              id: true,
              addresses: true,
              billingAddresses: true,
            },
          },
        },
      },
    },
  });

  if (!isEmpty(user?.accounts[0].organization.billingAddresses)) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  if (!user) {
    return {
      redirect: {
        destination: "/clinic-sign-up",
        permanent: false,
      },
    };
  }

  return {
    props: { redirect, loggedInUser: JSON.parse(JSON.stringify(user)) },
  };
};

export default function BillingInfoSignUpPage({
  redirect,
  loggedInUser,
}: Props) {
  const signUpAccount: SubmitHandler<
    BillingInformationFormInputs & {
      billingEmails: string[];
    }
  > = async (data) => {
    await fetch(
      `/api/account/set-billing/${loggedInUser.accounts[0].organization.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
        }),
      }
    )
      .then(async (response) => {
        if (response.ok) {
          toast.success("Billing details updated successfully");
          window.location.href = redirect ?? "/";
        } else {
          const res = await response.json();
          toast.error(res.error ?? "An error occurred");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error updating billing details");
      });
  };

  return (
    <div className="mb-8 mt-8 flex w-full flex-col items-center gap-8 overflow-y-auto">
      <div>
        <ProgressSteps currentStep={3} />
      </div>
      <div className="m-auto flex flex-col items-center gap-4 rounded-md p-10 shadow-2xl">
        <BillingInformationForm onSubmit={signUpAccount} user={loggedInUser} />
      </div>
    </div>
  );
}
