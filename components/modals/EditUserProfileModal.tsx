import { SubmitHandler, useForm } from "react-hook-form";

import Input from "@/components/common/Input";
import Modal, { ModalProps } from "@/components/common/Modal";
import Button from "@/components/common/Button";

export type EditUserProfileFormInputs = {
  firstName: string;
  lastName?: string;
  phoneNumber?: string;
};

interface Props extends Pick<ModalProps, "open" | "setOpen"> {
  onSubmit: SubmitHandler<EditUserProfileFormInputs>;
  data: {
    firstName: string | undefined;
    lastName: string | undefined;
    phoneNumber?: string | undefined;
  };
}

const EditUserProfileModal = ({ onSubmit, open, setOpen, data }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<EditUserProfileFormInputs>({
    defaultValues: {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
    },
  });

  const handleCloseModal = () => {
    reset();
    setOpen(false);
  };

  const submitForm = async (data: EditUserProfileFormInputs) => {
    await onSubmit(data);
    handleCloseModal();
    reset(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      },
      { keepValues: false }
    );
  };

  return (
    <Modal
      title={`Edit Profile`}
      open={open}
      setOpen={setOpen}
      onClose={handleCloseModal}
      size="sm"
    >
      <form
        onSubmit={handleSubmit(submitForm)}
        className="flex flex-col gap-4 space-y-4"
      >
        <div className="grid w-full grid-cols-2 gap-5">
          <div className="col-span-1">
            <Input
              id="firstName"
              label="First Name"
              {...register("firstName", { required: "First name is required" })}
              error={errors.firstName?.message}
            />
            {errors.firstName?.message && (
              <p className="text-xs text-red-500">
                {errors.firstName?.message}
              </p>
            )}
          </div>
          <div className="col-span-1">
            <Input
              id="lastName"
              label="Last Name"
              {...register("lastName", { required: "Last name is required" })}
              error={errors.lastName?.message}
            />
            {errors.lastName?.message && (
              <p className="text-xs text-red-500">{errors.lastName?.message}</p>
            )}
          </div>
          <div className="col-span-1">
            <Input
              id="phoneNumber"
              placeholder="Enter phone number"
              label={
                data?.phoneNumber
                  ? "Phone Number"
                  : "Phone Number (Ex. 1234567890 or 123-456-7890)"
              }
              {...register("phoneNumber", {
                validate: (value) => {
                  if (!value) return true;
                  const sanitizedValue = value.replace(/-/g, "");
                  if (
                    /^\d+$/.test(sanitizedValue) &&
                    (sanitizedValue.length === 10 ||
                      sanitizedValue.length === 11)
                  ) {
                    return true;
                  }
                  return "Phone number must be 10 digits and can optionally include dashes (-).";
                },
              })}
              error={errors.phoneNumber?.message}
            />
            {errors.phoneNumber?.message && (
              <p className="text-xs text-red-500">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            className="btn-primary ml-2"
            type="submit"
            loading={isSubmitting}
            disabled={!isDirty}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditUserProfileModal;
