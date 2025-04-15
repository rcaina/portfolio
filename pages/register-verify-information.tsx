import Cookies from "js-cookie";
import { GetServerSideProps } from "next";
import InviteeVerificationInformationForm from "@/components/forms/auth/InviteeVerificationInformationForm";
import { SubmitHandler } from "react-hook-form";
import { authOptions } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export interface InviteeVerificationFormInputs {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

type Props = Record<string, never>;

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
}) => {
  const session = await getServerSession(req, res, authOptions);

  if (session?.user.email) {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default function RegisterVerifyInformationPage({}: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const verifyInviteeInformation: SubmitHandler<
    InviteeVerificationFormInputs
  > = async (data) => {
    await fetch(`/api/user/employee-invite/${session?.user.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        phoneNumber: data?.phoneNumber ? data?.phoneNumber : undefined,
        firstName: data.firstName,
        lastName: data.lastName,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        if (response.ok) {
          return response.json();
        } else {
          const res = await response.json();
          toast.error(res.error ?? "Failed to verify your information.");
        }
      })
      .then((data) => {
        Cookies.set(
          "currentAccount",
          JSON.stringify({ id: data.accounts[0].id }),
          {
            expires: 7,
            secure: true,
            sameSite: "strict",
          }
        );
        toast.success("You have successfully verified your information.");
        router.push("/register-credentials");
      })
      .catch((err) => toast.error(err?.errors[0]?.longMessage));
  };

  return (
    <div className="m-auto flex flex-col items-center gap-4 rounded-md p-10 shadow-2xl">
      <InviteeVerificationInformationForm
        onSubmit={verifyInviteeInformation}
        employee={{
          name: session?.user.name ?? undefined,
        }}
      />
    </div>
  );
}
