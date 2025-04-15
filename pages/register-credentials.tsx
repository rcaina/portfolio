import { S3Bucket, upload } from "@/lib/utils";

import AddCredentialsForm from "@/components/forms/auth/AddCredentialsForm";
import { GetServerSideProps } from "next";
import { SubmitHandler } from "react-hook-form";
import { authOptions } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { z } from "zod";

export const AddCredentialsFormSchema = z.object({
  practiceType: z.string().min(1),
  nationalProviderId: z.string().min(1),
  licenseNumber: z.string().min(1),
  licenseEffectiveDate: z.string().min(1),
  licenseExpirationDate: z.string().min(1),
  medicalLicense: z.custom<File[]>(),
  governermentId: z.custom<File[]>(),
});

export type AddCredentialsFormInputs = z.infer<typeof AddCredentialsFormSchema>;

interface Props {
  userId: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
}) => {
  const session = await getServerSession(req, res, authOptions);

  if (session?.user.email) {
    const user = await prisma.employee.findUnique({
      where: {
        email: session.user.email,
      },
    });
    if (user) {
      if (user?.nationalProviderId) {
        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      }
      return {
        props: { userId: user.id },
      };
    } else {
      return {
        redirect: {
          destination: "/404",
          permanent: false,
        },
      };
    }
  }

  return {
    redirect: {
      destination: "/sign-in",
      permanent: false,
    },
  };
};

export default function RegisterVerifyInformationPage({ userId }: Props) {
  const router = useRouter();
  const updateCredentials: SubmitHandler<AddCredentialsFormInputs> = async ({
    medicalLicense,
    governermentId,
    ...data
  }) => {
    const { s3FileId: medicalLicenseS3Key } = await upload(
      medicalLicense[0],
      S3Bucket.MEDICAL_LICENSES
    );
    const { s3FileId: governmentIdS3Key } = await upload(
      governermentId[0],
      S3Bucket.GOVERNMENT_IDS
    );

    await fetch(`/api/user/employee-invite/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...data,
        medicalLicenseS3Key,
        governmentIdS3Key,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        if (response.ok) {
          toast.success("You have successfully added your credentials.");
          router.push("/");
        } else {
          const res = await response.json();
          toast.error(res.error ?? "Failed to add your credentials.");
        }
      })
      .catch((err) => toast.error(err?.errors[0]?.longMessage));
  };

  return (
    <div className="m-auto flex flex-col items-center gap-4 rounded-md p-10 shadow-2xl">
      <AddCredentialsForm onSubmit={updateCredentials} />
    </div>
  );
}
