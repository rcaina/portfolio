import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import Input from "@/components/common/Input";
import Modal, { ModalProps } from "@/components/common/Modal";
import Button from "@/components/common/Button";

export type UpdateUserPasswordFormInputs = {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
  signOutOfOtherSessions: boolean;
};

interface Props extends Pick<ModalProps, "open" | "setOpen"> {
  onSubmit: SubmitHandler<UpdateUserPasswordFormInputs>;
}

const passwordValidationRules = {
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
};

const UpdateUserPasswordModal = ({ onSubmit, open, setOpen }: Props) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateUserPasswordFormInputs>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      signOutOfOtherSessions: false,
    },
  });

  const handleCloseModal = () => {
    reset();
    setOpen(false);
  };

  const togglePasswordVisibility = (field: string) => {
    if (field === "currentPassword")
      setShowCurrentPassword(!showCurrentPassword);
    else if (field === "newPassword") setShowNewPassword(!showNewPassword);
    else if (field === "confirmPassword")
      setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Modal
      title={`Reset Password`}
      open={open}
      setOpen={setOpen}
      afterLeave={handleCloseModal}
      size="sm"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 space-y-4"
      >
        <div className="grid-col ml-20 mr-20 grid gap-4">
          <div className="flex items-center justify-between gap-10">
            <label htmlFor="currentPassword">Current password:</label>
            <div className="flex flex-col items-end">
              <Input
                className="min-w-56 rounded-md border border-gray-400"
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                {...register("currentPassword")}
              />
              <span
                className="ml-2 cursor-pointer select-none text-sm hover:text-primary-500"
                onClick={() => togglePasswordVisibility("currentPassword")}
              >
                {showCurrentPassword ? "Hide" : "Show"} password
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-10">
            <label htmlFor="newPassword">New password:</label>
            <div className="flex flex-col items-end">
              <Input
                className="min-w-56 rounded-md border border-gray-400"
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                {...register("newPassword", passwordValidationRules)}
              />
              <span
                className="ml-2 cursor-pointer select-none text-sm hover:text-primary-500"
                onClick={() => togglePasswordVisibility("newPassword")}
              >
                {showNewPassword ? "Hide" : "Show"} password
              </span>
              {errors.newPassword && (
                <p className="max-w-56 text-xs text-red-600">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between gap-10">
            <label htmlFor="confirmPassword">Confirm password:</label>
            <div className="flex flex-col items-end">
              <Input
                className="min-w-56 rounded-md border border-gray-400"
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword", {
                  validate: (value) =>
                    value === watch("newPassword") ||
                    "The passwords do not match",
                })}
              />
              <span
                className="ml-2 cursor-pointer select-none text-sm hover:text-primary-500"
                onClick={() => togglePasswordVisibility("confirmPassword")}
              >
                {showConfirmPassword ? "Hide" : "Show"} password
              </span>
              {errors.confirmPassword && (
                <p className="max-w-56 text-xs text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between gap-10">
            <label htmlFor="signOutOfOtherSessions">
              Sign out of all other devices?
            </label>
            <input
              type="checkbox"
              id="signOutOfOtherSessions"
              {...register("signOutOfOtherSessions")}
              className="h-5 w-5 rounded-md"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            className="btn-primary ml-2"
            type="submit"
            disabled={!isDirty}
          >
            Reset Password
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateUserPasswordModal;
