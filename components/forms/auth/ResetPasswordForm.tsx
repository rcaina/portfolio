import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { useForm } from "react-hook-form";
import { useState } from "react";

export interface ResetPasswordFormInputs {
  password: string;
  confirmPassword: string;
}

interface Props {
  onSubmit: (data: ResetPasswordFormInputs) => void;
}

export const ResetPasswordForm = ({ onSubmit }: Props) => {
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
  } = useForm<ResetPasswordFormInputs>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  return (
    <div className="m-auto flex flex-col items-center gap-4">
      <h1 className="text-4xl font-medium ">Reset Password</h1>
      <h3 className="text-lg text-secondary-500 ">
        Complete resetting your password
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-1">
        <div className="w-64">
          <div className="flex flex-col gap-4">
            <div>
              <Input
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters long",
                  },
                  pattern: {
                    value:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message:
                      "Password must contain at least one uppercase letter, one number, and one special character",
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
                className="text-xs hover:text-cyan-400 "
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
            <div>
              <Input
                {...register(`confirmPassword`, {
                  required: true,
                  validate: (value) =>
                    value === password || "The passwords do not match",
                })}
                placeholder="password"
                name="confirmPassword"
                label="Confirm password"
                type={confirmPasswordType}
                disabled={isSubmitting}
                error={errors.confirmPassword?.message}
              />
              <button
                className="text-xs hover:text-cyan-400 "
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
            <Button
              loading={isSubmitting}
              disabled={!confirmPassword}
              type="submit"
            >
              Reset&nbsp;password
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
