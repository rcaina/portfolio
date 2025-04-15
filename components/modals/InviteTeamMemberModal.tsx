import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Modal, { ModalProps } from "@/components/common/Modal";
import { OrganizationType, Role } from "@prisma/client";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "../common/Select";

export type InviteTeamMemberFormInputs = {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
};

const clinicalRoleOptions = [
  {
    label: "Staff",
    value: Role.STAFF,
  },
  {
    label: "Practiontioner",
    value: Role.PRACTITIONER,
  },
  {
    label: "Billing Manager",
    value: Role.BILLING_MANAGER,
  },
];

const reasearchRoleOptions = [
  {
    label: "Researcher",
    value: Role.RESEARCHER,
  },
  {
    label: "Admin",
    value: Role.ADMIN,
  },
  {
    label: "Data Analyst",
    value: Role.DATA_ANALYST,
  },
  {
    label: "Project Manager",
    value: Role.PROJECT_MANAGER,
  },
  {
    label: "Billing Manager",
    value: Role.BILLING_MANAGER,
  },
];

interface Props extends Pick<ModalProps, "open" | "setOpen"> {
  onSubmit: SubmitHandler<InviteTeamMemberFormInputs>;
  type: OrganizationType | undefined;
}

const InviteTeamMemberModal = ({ onSubmit, open, setOpen, type }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<InviteTeamMemberFormInputs>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: type === OrganizationType.CLINICAL ? Role.STAFF : Role.RESEARCHER,
    },
  });

  const handleCloseModal = () => {
    reset();
    setOpen(false);
  };

  const submitForm = async (data: InviteTeamMemberFormInputs) => {
    await onSubmit(data);
    handleCloseModal();
    reset(
      {
        role: data.role,
      },
      { keepValues: false }
    );
  };

  return (
    <Modal
      title={`Invite Team Member`}
      open={open}
      setOpen={setOpen}
      onClose={handleCloseModal}
      afterLeave={handleCloseModal}
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
            />
          </div>
          <div className="col-span-1">
            <Input
              id="lastName"
              label="Last Name"
              {...register("lastName", { required: "Last name is required" })}
            />
          </div>
          <div className="col-span-2">
            <Input
              id="email"
              label="Email"
              {...register("email", { required: "Email is required" })}
            />
          </div>
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
                  data={
                    type === OrganizationType.CLINICAL
                      ? clinicalRoleOptions
                      : reasearchRoleOptions
                  }
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
        </div>

        <div className="flex justify-end">
          <Button
            variant="white"
            onClick={handleCloseModal}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="btn-primary ml-2"
            type="submit"
            loading={isSubmitting}
            disabled={!isDirty}
          >
            Invite Team Member
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InviteTeamMemberModal;
