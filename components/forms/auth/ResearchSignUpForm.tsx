import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Link from "next/link";
import { ResearchSignUpFormInputs } from "@/pages/research/sign-up";
import { isEmpty } from "lodash-es";
import { useForm } from "react-hook-form";
import { useState } from "react";

interface Props {
  onSubmit: (data: ResearchSignUpFormInputs) => void;
  redirect?: string;
  email?: string;
}

export default function ResearchSignUpForm({
  onSubmit,
  redirect,
  email,
}: Props) {
  const [passwordType, setPasswordType] = useState("password");
  const [confirmPasswordType, setConfirmPasswordType] = useState("password");

  const togglePasswordVisibility = () => {
    setPasswordType(passwordType === "password" ? "text" : "password");
  };
  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordType(
      confirmPasswordType === "password" ? "text" : "password"
    );
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<ResearchSignUpFormInputs>({
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      email: email ? email : "",
    },
  });

  return (
    <div className="xs:max-w-xs m-auto flex flex-col items-center gap-4 rounded-md border-[1px] border-secondary-600 bg-primary-300 p-10 shadow-2xl shadow-highlight-600 sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
      <h1 className="text-center text-4xl font-bold">
        Activate Research Account
      </h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-1">
              <Input
                {...register(`firstName`, {
                  required: true,
                })}
                placeholder="first name"
                name="firstName"
                label="First name"
                disabled={isSubmitting}
                error={errors.firstName?.message}
              />
            </div>
            <div className="col-span-1">
              <Input
                {...register(`lastName`, {
                  required: true,
                })}
                placeholder="last name"
                name="lastName"
                label="Last name"
                disabled={isSubmitting}
                error={errors.lastName?.message}
              />
            </div>

            <div className="col-span-2">
              <Input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /@(renewbt|wasatchbiolabs|resonantdx)\.com$/,
                    message:
                      "Email must be from @renewbt.com, @wasatchbiolabs.com, or @resonantdx.com",
                  },
                })}
                placeholder="email"
                name="email"
                label="Email"
                disabled={isSubmitting || !isEmpty(email)}
                error={errors.email?.message}
              />
            </div>
            <div className="col-span-2">
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
              <button
                className="text-xs hover:text-highlight-600"
                type="button"
                onClick={togglePasswordVisibility}
              >
                {passwordType === "password"
                  ? "Show Password"
                  : "Hide Password"}
              </button>
            </div>
            <div className="col-span-2">
              <Input
                {...register(`confirmPassword`, {
                  required: true,
                })}
                placeholder="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type={confirmPasswordType}
                disabled={isSubmitting}
                error={errors.confirmPassword?.message}
              />
              <button
                className="text-xs hover:text-highlight-600"
                type="button"
                onClick={toggleConfirmPasswordVisibility}
              >
                {confirmPasswordType === "password"
                  ? "Show Password"
                  : "Hide Password"}
              </button>
            </div>
          </div>
          <div className="mt-5 flex justify-center">
            <Button
              className="w-48"
              loading={isSubmitting}
              disabled={
                !watch("confirmPassword") ||
                watch("password") !== watch("confirmPassword")
              }
              type="submit"
            >
              Continue
            </Button>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 justify-items-center gap-4">
        <h3 className="text-lg text-secondary-300">
          Already have an account?{" "}
          <Link
            href={
              redirect ? `/sign-in?redirect=${encodeURI(redirect)}` : "/sign-in"
            }
            className="font-medium text-secondary-600 hover:text-highlight-600"
          >
            Sign in
          </Link>
          .
        </h3>
      </div>
    </div>
  );
}
