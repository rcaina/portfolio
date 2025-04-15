import React from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

import Modal, { ModalProps } from "@/components/common/Modal";
import Button from "@/components/common/Button";
import { Employee, Role } from "@prisma/client";
import Select from "../common/Select";

export type EditEmployeeFormInputs = {
  role: Role;
  accountOwner: boolean;
};

interface Props extends Pick<ModalProps, "open" | "setOpen"> {
  onSubmit: SubmitHandler<EditEmployeeFormInputs>;
  employee: Employee & {
    employeeClinicMembership: {
      id: string;
      accountOwner: boolean;
      role: Role;
    };
  };
}

const EditEmployeeModal = ({ onSubmit, open, setOpen, employee }: Props) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<EditEmployeeFormInputs>({
    defaultValues: {
      role: employee.employeeClinicMembership.role,
      accountOwner: employee.employeeClinicMembership.accountOwner,
    },
  });

  const handleCloseModal = () => {
    reset();
    setOpen(false);
  };

  const submitForm = async (data: EditEmployeeFormInputs) => {
    await onSubmit(data);
    handleCloseModal();
    reset({
      role: data.role,
      accountOwner: data.accountOwner,
    });
  };

  return (
    <Modal
      title={`Edit Employee`}
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
          <div className="col-span-2">
            <Controller
              name={`role`}
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { value, onChange } }) => (
                <Select
                  label="Role"
                  data={Object.values(Role)}
                  value={value}
                  onChange={onChange}
                  error={errors.role?.message}
                />
              )}
            />
            {errors.role?.message && (
              <p className="text-xs text-red-500">{errors.role?.message}</p>
            )}
          </div>
          <div className="col-span-2">
            <Controller
              name={`accountOwner`}
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { value, onChange } }) => (
                <Select
                  label="Membership"
                  data={[
                    { label: "Account Owner", value: "true" },
                    { label: "Member", value: "false" },
                  ]}
                  value={value.toString()}
                  onChange={onChange}
                  error={errors.accountOwner?.message}
                />
              )}
            />
            {errors.accountOwner?.message && (
              <p className="text-xs text-red-500">
                {errors.accountOwner?.message}
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

export default EditEmployeeModal;
