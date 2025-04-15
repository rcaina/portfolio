import { useEffect, useState } from "react";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Link from "next/link";
import { Role } from "@prisma/client";
import { SignUpFormInputs } from "@/pages/sign-up";
import { useForm } from "react-hook-form";

interface Props {
  onSubmit: (data: SignUpFormInputs) => void;
  redirect?: string;
}

export default function SignUpForm({ onSubmit, redirect }: Props) {
  const [role, setRole] = useState<Role | null>();
  const [accountType, setAccountType] = useState<"new" | "join" | null>();
  const [receivedInvite, setReceivedInvite] = useState(false);
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
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<SignUpFormInputs>({
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
      email: "",
      organization: "",
      role: Role.STAFF,
    },
  });

  const password = watch("password");

  useEffect(() => {
    setValue("role", role || Role.STAFF);
  }, [role, setValue]);

  return (
    <div className="flex max-h-screen flex-col items-center gap-4 rounded-md border-[1px] border-secondary-600 bg-primary-300 p-8 shadow-2xl shadow-highlight-600">
      <h1 className="text-4xl font-bold">Create Account</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-grow overflow-x-auto overflow-y-auto"
      >
        <p className="mb-1">I am a...</p>
        <div className="mb-5 grid grid-cols-2 gap-5">
          <button
            type="button"
            className={`${
              role === Role.PRACTITIONER
                ? "rounded-md border-[1px] border-secondary-600 p-4 font-bold"
                : "rounded-md border-[1px] p-4 hover:border-highlight-600 hover:text-highlight-600"
            }`}
            onClick={() => setRole(Role.PRACTITIONER)}
          >
            Practitioner
          </button>
          <button
            type="button"
            className={`${
              role === Role.STAFF
                ? "rounded-md border-[1px] border-secondary-600 p-4 font-bold"
                : "rounded-md border-[1px] p-4 hover:border-highlight-600 hover:text-highlight-600"
            }`}
            onClick={() => setRole(Role.STAFF)}
          >
            Clinic Staff
          </button>
        </div>
        <hr className="mb-2" />
        <p className="mb-1">I want to...</p>
        <div className="mb-5 grid grid-cols-2 gap-5">
          <button
            type="button"
            className={`${
              accountType === "new"
                ? "rounded-md border-[1px] border-secondary-600 p-4 font-bold"
                : "rounded-md border-[1px] p-4 hover:border-highlight-600 hover:text-highlight-600"
            }`}
            onClick={() => setAccountType("new")}
          >
            Create New Account
          </button>
          <button
            type="button"
            className={`${
              accountType === "join"
                ? "rounded-md border-[1px] border-secondary-600 p-4 font-bold"
                : "rounded-md border-[1px] p-4 hover:border-highlight-600 hover:text-highlight-600"
            }`}
            onClick={() => setAccountType("join")}
          >
            Join A Team
          </button>
        </div>
        {accountType === "join" && (
          <div>
            <hr className="mb-2" />
            <p className="mb-1">
              Have you received a email invite from a team member?
            </p>
            <div className="mb-5 grid grid-cols-2 gap-5">
              <button
                type="button"
                className={`${
                  receivedInvite === true
                    ? "rounded-md border-[1px] border-secondary-600 p-4 font-bold"
                    : "rounded-md border-[1px] p-4 hover:border-highlight-600 hover:text-highlight-600"
                }`}
                onClick={() => setReceivedInvite(true)}
              >
                Yes
              </button>
              <button
                type="button"
                className={`${
                  receivedInvite === false
                    ? "rounded-md border-[1px] border-secondary-600 p-4 font-bold"
                    : "rounded-md border-[1px] p-4 hover:border-highlight-600 hover:text-highlight-600"
                }`}
                onClick={() => setReceivedInvite(false)}
              >
                No
              </button>
            </div>
          </div>
        )}
        {accountType === "new" && (
          <div>
            <div className="col-span-2">
              <Input
                {...register("organization", {
                  required: "Organization name is required",
                })}
                placeholder="organization name"
                name="organization"
                label="Organization name"
                disabled={isSubmitting}
                error={errors.organization?.message}
              />
            </div>
          </div>
        )}

        {(role && accountType === "new") ||
        (role && accountType === "join" && receivedInvite) ? (
          <div>
            <hr className="mb-4" />
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
                  })}
                  placeholder="email"
                  name="email"
                  label="Email"
                  disabled={isSubmitting}
                  error={errors.email?.message}
                />
              </div>
              <div className="col-span-2">
                <Input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters long",
                    },
                    pattern: {
                      value:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*.?&#^])[A-Za-z\d@$!%*.?&#^]{8,}$/,
                      message:
                        "Password must contain at least one uppercase letter, one number, and one special character. Special characters are restricted to the following characters: @$!%*.?&#^",
                    },
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
                {errors.password && (
                  <p className="break-words text-xs italic text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <Input
                  {...register(`confirmPassword`, {
                    required: "Confirm Password is required",
                    validate: (value) =>
                      value === password || "The passwords do not match",
                  })}
                  placeholder="confirm password"
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
                {errors.confirmPassword && (
                  <p className="break-words text-xs italic text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <input
                type="hidden"
                {...register("role")}
                value={role || Role.STAFF}
              />
            </div>
            <div className="mt-5 flex justify-center">
              <Button className="w-48" loading={isSubmitting} type="submit">
                Continue
              </Button>
            </div>
          </div>
        ) : (
          role &&
          accountType === "join" && (
            <div>
              <hr className="mb-4" />
              <div className="flex flex-col rounded-md border">
                <div className="text-md w-full  p-4">
                  Ask a team member to invite you from the team settings page.
                </div>
                <div className="flex bg-gray-100 p-4">
                  A team member in your clinic with an account can sign in and
                  invite you as shown in this video.
                </div>
              </div>
            </div>
          )
        )}
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
