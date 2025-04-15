import Modal, { ModalProps } from "@/components/common/Modal";
import { SubmitHandler, useForm } from "react-hook-form";

import Button from "@/components/common/Button";
import { GetAccountResponse } from "@/pages/api/current/account/[id]";
import Input from "@/components/common/Input";
import React from "react";

export type EditClinicFormInputs = {
  name: string;
};

interface Props extends Pick<ModalProps, "open" | "setOpen"> {
  onSubmit: SubmitHandler<EditClinicFormInputs>;
  clinic: GetAccountResponse["organization"];
}

const EditClinicModal = ({ onSubmit, open, setOpen, clinic }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<EditClinicFormInputs>({
    defaultValues: {
      name: clinic.name,
    },
  });

  const handleCloseModal = () => {
    reset();
    setOpen(false);
  };

  const submitForm = async (data: EditClinicFormInputs) => {
    await onSubmit(data);
    handleCloseModal();
    reset({
      name: data.name,
    });
  };

  return (
    <Modal
      title={`Edit Clinic`}
      open={open}
      setOpen={setOpen}
      onClose={handleCloseModal}
      size="sm"
    >
      <form
        onSubmit={handleSubmit(submitForm)}
        className="flex flex-col gap-4 space-y-4"
      >
        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-1">
            <Input
              id="name"
              {...register("name", {
                required: "Clinic name is required",
              })}
              label="Clinic Name"
              error={errors.name?.message}
            />
            {errors.name?.message && (
              <p className="text-xs text-red-500">{errors.name?.message}</p>
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

export default EditClinicModal;
