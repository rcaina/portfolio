import { GetServerSideProps } from "next";
import SignUpForm from "@/components/forms/auth/SignUpForm";
import { SubmitHandler } from "react-hook-form";
import { authOptions } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

export type SignUpFormInputs = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
};

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

  if (session?.user.id) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const redirect = redirect_url?.toString() ?? "";

  return {
    props: { redirect },
  };
};

export default function SignUpPage({ redirect }: Props) {
  const router = useRouter();
  const registerAccount: SubmitHandler<SignUpFormInputs> = async (data) => {
    try {
      await fetch("/api/create-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then(async (res) => {
          if (res.ok) {
            toast.success("Account created successfully");
            return res.json();
          } else {
            const error = await res.json();
            toast.error(
              error.error || "Error creating account. Please try again."
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
              router.push("/");
            } else {
              toast.error(res?.error || "Failed to log in");
            }
          });
        });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.errors[0]?.longMessage);
    }
  };

  return (
    <div className="flex w-full items-center justify-center overflow-y-auto">
      <SignUpForm onSubmit={registerAccount} redirect={redirect} />
    </div>
  );
}
