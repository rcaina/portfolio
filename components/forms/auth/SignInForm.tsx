import { SubmitHandler, useForm } from "react-hook-form";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useState } from "react";

interface Props {
  redirect?: string;
}

interface SignInFormInputs {
  email: string;
  password?: string;
}

export default function SignInForm({ redirect }: Props) {
  const router = useRouter();
  const [passwordType, setPasswordType] = useState("password");
  const [isSubmittingCredentials, setIsSubmittingCredentials] = useState(false);
  // const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordType(passwordType === "password" ? "text" : "password");
  };

  const credentialsSignIn: SubmitHandler<SignInFormInputs> = async (data) => {
    setIsSubmittingCredentials(true);

    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })
      .then(async (result) => {
        if (result?.ok) {
          if (redirect) {
            await router.push(`/${redirect}`);
          } else {
            await router.push("/");
          }
        } else {
          console.error("Invalid credentials:", result);
          toast.error("Invalid credentials.");
        }
      })
      .finally(() => setIsSubmittingCredentials(false));
  };

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<SignInFormInputs>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <div className="m-auto flex flex-col items-center gap-4 rounded-md border-[1px] border-secondary-600 bg-primary-300 p-10 shadow-2xl shadow-highlight-600">
      <h1 className="text-4xl font-bold">Sign in</h1>
      <h3 className="text-lg text-secondary-300">
        Enter your email and password.
      </h3>
      <form
        onSubmit={handleSubmit(credentialsSignIn)}
        className="flex flex-col gap-1"
      >
        <div className="w-64 gap-4">
          <div className="flex flex-col gap-4">
            <Input
              {...register(`email`, {
                required: true,
              })}
              placeholder="email"
              name="email"
              label="Email"
              disabled={isSubmitting}
              error={errors.email?.message}
            />
            {errors.email?.message && <p>{errors.email?.message}</p>}
            <Input
              {...register(`password`, {
                required: true,
              })}
              placeholder="password"
              name="password"
              label="Password"
              type={passwordType}
              disabled={isSubmitting}
              error={errors.password?.message}
            />
            <div className="flex items-center justify-between">
              <button
                className="text-xs  hover:text-highlight-600"
                type="button"
                onClick={togglePasswordVisibility}
              >
                {passwordType === "password"
                  ? "Show Password"
                  : "Hide Password"}
              </button>
              <button
                className="text-xs  hover:text-highlight-600"
                type="button"
                onClick={() => router.push("/reset/password")}
              >
                Forgot Password
              </button>
            </div>
            <Button
              loading={isSubmitting || isSubmittingCredentials}
              type="submit"
            >
              Sign&nbsp;in
            </Button>
          </div>
        </div>
      </form>
      <h3 className="text-lg text-secondary-300">
        Don&apos;t have an account? Create account{" "}
        <Link
          href={
            redirect !== "" && redirect !== undefined
              ? `/sign-up?redirect_url=${encodeURIComponent(redirect)}`
              : "/sign-up"
          }
          className="font-medium text-secondary-500  hover:text-highlight-600"
        >
          here
        </Link>
        .
      </h3>
    </div>
  );
}
