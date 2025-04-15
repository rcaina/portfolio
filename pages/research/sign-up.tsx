import { GetServerSideProps } from "next";
import ResearchSignUpForm from "@/components/forms/auth/ResearchSignUpForm";
import { SubmitHandler } from "react-hook-form";
import { authOptions } from "../api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import router from "next/router";
import { signIn } from "next-auth/react";
import { toast } from "react-toastify";

export interface ResearchSignUpFormInputs {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}
type Props = {
  email?: string;
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
  query,
  req,
  res,
}) => {
  const session = await getServerSession(req, res, authOptions);
  const email = decodeURIComponent(query.email as string);

  if (session?.user.email) {
    const employee = await prisma.employee.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (employee) {
      return {
        redirect: {
          destination: "/researcher",
          permanent: false,
        },
      };
    }

    return {
      redirect: {
        destination: "/verify-details",
        permanent: false,
      },
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isValidEmail = emailRegex.test(email);

  return {
    props: { email: isValidEmail ? email : "" },
  };
};

export default function SignUpPage({ email }: Props) {
  const registerAccount: SubmitHandler<ResearchSignUpFormInputs> = async (
    data
  ) => {
    try {
      await fetch("/api/research/account/activate", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          firstName: data.firstName,
          lastName: data.lastName,
        }),
      })
        .then(async (response) => {
          if (response.ok) {
            return response.json();
          } else {
            const res = await response.json();
            toast.error(
              res.error ??
                "No user found with that email. Please contact support."
            );
          }
        })
        .then(async (response) => {
          return await signIn("credentials", {
            email: response.email,
            password: data.password,
            redirect: false,
          }).then((res) => {
            if (res?.ok) {
              toast.success("Logged in successfully");
              router.push("/clinic-sign-up");
            } else {
              toast.error(res?.error || "Failed to log in");
            }
          });
        })
        .catch((error) => console.error("Error updating profile:", error));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.errors[0]?.longMessage);
    }
  };

  return (
    <div className="flex w-full items-center justify-center overflow-y-auto">
      <ResearchSignUpForm onSubmit={registerAccount} email={email} />
    </div>
  );
}
