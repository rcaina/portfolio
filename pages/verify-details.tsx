import Cookies from "js-cookie";
import { GetServerSideProps } from "next";
import InviteeVerificationInformationForm from "@/components/forms/auth/InviteeVerificationInformationForm";
import { PostCreateEmployeeAccountResponse } from "./api/research/account/activate";
import { SubmitHandler } from "react-hook-form";
import { authOptions } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { toast } from "react-toastify";

export interface InviteeVerificationFormInputs {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

interface Props {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
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
      select: {
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
      },
    });

    if (user) {
      return {
        props: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
        },
      };
    } else {
      return {
        redirect: {
          destination: "/researcher",
          permanent: false,
        },
      };
    }
  } else {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }
};

export default function RegisterVerifyInformationPage({
  email,
  firstName,
  lastName,
  phoneNumber,
}: Props) {
  const verifyInviteeInformation: SubmitHandler<
    InviteeVerificationFormInputs
  > = async (data) => {
    await fetch(`/api/research/account/activate`, {
      method: "POST",
      body: JSON.stringify({
        phoneNumber: data?.phoneNumber ? data?.phoneNumber : undefined,
        firstName: firstName,
        lastName: lastName,
        email: email,
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
      .then((data: PostCreateEmployeeAccountResponse) => {
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
        window.location.replace("/research/dashboard");
      })
      .catch((err) => toast.error(err?.errors[0]?.longMessage));
  };

  return (
    <div className="m-auto flex flex-col items-center gap-4 rounded-md p-10 shadow-2xl">
      <InviteeVerificationInformationForm
        onSubmit={verifyInviteeInformation}
        employee={{
          name: `${firstName} ${lastName}`,
          phoneNumber,
        }}
      />
    </div>
  );
}
