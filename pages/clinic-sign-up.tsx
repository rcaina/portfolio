import { OrganizationType, Role } from "@prisma/client";
import { S3Bucket, upload } from "@/lib/utils";
import { useEffect, useState } from "react";

import Cookies from "js-cookie";
import FinishPractitionerSignUpForm from "@/components/forms/auth/FinishPractitionerSignUpForm";
import { GetAccountResponse } from "./api/current/account/[id]";
import { GetServerSideProps } from "next";
import ProgressSteps from "@/components/displays/ProgressDisplay";
import { SubmitHandler } from "react-hook-form";
import { authOptions } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { z } from "zod";

export const FinishPractitionerSignUpFormSchema = z.object({
  name: z.string().min(1),
  practiceType: z.string().min(1),
  nationalProviderId: z.string().min(1),
  licenseNumber: z.string().min(1),
  licenseEffectiveDate: z.string().min(1),
  licenseExpirationDate: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
  medicalLicense: z.custom<File[]>(),
  governermentId: z.custom<File[]>(),
});

export const FinishStaffSignUpFormSchema = z.object({
  name: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
});

export type FinishPractitionerSignUpFormInputs = z.infer<
  typeof FinishPractitionerSignUpFormSchema
>;

export type FinishStaffSignUpFormInputs = z.infer<
  typeof FinishStaffSignUpFormSchema
>;

interface Props {
  redirect?: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
  query,
}) => {
  const session = await getServerSession(req, res, authOptions);
  const { redirect_url } = query;

  if (!session) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  if (session.user.email) {
    const invitee = await prisma.employee.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        accounts: {
          select: {
            role: true,
            organization: {
              select: {
                id: true,
                type: true,
              },
            },
          },
        },
      },
    });

    if (
      invitee &&
      invitee.accounts[0].organization.type === OrganizationType.CLINICAL
    ) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    } else if (
      invitee &&
      invitee.accounts[0].organization.type === OrganizationType.RESEARCH
    ) {
      return {
        redirect: {
          destination: "/research/dashboard",
          permanent: false,
        },
      };
    } else {
      return {
        props: {
          redirect: redirect_url?.toString() ?? "",
        },
      };
    }
  }

  return {
    props: {
      redirect: redirect_url?.toString() ?? "",
    },
  };
};

export default function PractitionerSignUpPage({ redirect }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentAccount, setCurrentAccount] = useState<GetAccountResponse>();

  useEffect(() => {
    const fetchCurrentAccount = async () => {
      await fetch(`/api/current/account/${session?.user.organizationId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Error retrieving clinic.");
          }
          return res.json();
        })
        .then((data) => {
          setCurrentAccount(data);
        })
        .catch((error) => console.error("Error fetching clinic:", error));
    };

    if (!currentAccount) {
      fetchCurrentAccount();
    }
  }, [currentAccount, session?.user.organizationId]);

  const signUpPractitioner: SubmitHandler<
    FinishPractitionerSignUpFormInputs
  > = async ({ medicalLicense, governermentId, ...data }) => {
    if (!medicalLicense || !governermentId) {
      toast.error("Please upload both medical license and government ID");
      return;
    }
    const { s3FileId: medicalLicenseS3Key } = await upload(
      medicalLicense[0],
      S3Bucket.MEDICAL_LICENSES
    );
    const { s3FileId: governmentIdS3Key } = await upload(
      governermentId[0],
      S3Bucket.GOVERNMENT_IDS
    );

    await fetch("/api/user/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        firstName: session?.user.name,
        lastName: session?.user.name,
        email: session?.user.email,
        role: session?.user.role,
        medicalLicenseS3Key,
        governmentIdS3Key,
      }),
    })
      .then(async (response) => {
        if (response.ok) {
          return response.json();
        } else {
          const res = await response.json();
          toast.error(res?.error ?? "Error creating clinic account");
        }
      })
      .then((data) => {
        if (data) {
          Cookies.set(
            "currentAccount",
            JSON.stringify({
              id: data.accounts[0].id,
            }),
            {
              expires: 7,
              secure: true,
              sameSite: "strict",
            }
          );
          toast.success("Account created successfully");
          router.push(
            redirect
              ? `/billing-info?redirect_url=${redirect}`
              : "/billing-info"
          );
        }
      })
      .catch((err) =>
        toast.error(err?.errors?.[0]?.longMessage ?? "Error creating account")
      );
  };

  const signUpStaff: SubmitHandler<FinishStaffSignUpFormInputs> = async (
    data
  ) => {
    await fetch("/api/user/staff/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        firstName: session?.user.name,
        lastName: session?.user.name,
        email: session?.user.email,
        role: session?.user.role,
      }),
    })
      .then(async (response) => {
        if (response.ok) {
          return response.json();
        } else {
          const res = await response.json();
          toast.error(res?.error ?? "Error creating clinic account");
        }
      })
      .then((data) => {
        if (data) {
          Cookies.set(
            "currentAccount",
            JSON.stringify({
              id: data.accounts[0].id,
            }),
            {
              expires: 7,
              secure: true,
              sameSite: "strict",
            }
          );
          toast.success("Account created successfully");
          router.push(
            redirect
              ? `/billing-info?redirect_url=${redirect}`
              : "/billing-info"
          );
        }
      })
      .catch((err) =>
        toast.error(err?.errors?.[0]?.longMessage ?? "Error creating account")
      );
  };

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div>
        <ProgressSteps currentStep={2} />
      </div>
      <div className="m-auto flex flex-col items-center gap-4 rounded-md p-10 shadow-2xl">
        {currentAccount?.role ? (
          <FinishPractitionerSignUpForm
            onSubmit={
              currentAccount?.role === Role.PRACTITIONER
                ? signUpPractitioner
                : signUpStaff
            }
            role={currentAccount?.role}
          />
        ) : session?.user.role === Role.PRACTITIONER ||
          session?.user.role === Role.STAFF ? (
          <FinishPractitionerSignUpForm
            onSubmit={
              session?.user.role === Role.PRACTITIONER
                ? signUpPractitioner
                : signUpStaff
            }
            role={session?.user.role}
          />
        ) : (
          <div className="rounded-md border border-primary-700 p-8 ">
            Please Contact Support
          </div>
        )}
      </div>
    </div>
  );
}
