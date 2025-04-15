import React from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

import Modal, { ModalProps } from "@/components/common/Modal";
import Button from "@/components/common/Button";
import { Employee } from "@prisma/client";
import { capitalize, isEmpty } from "lodash-es";
import Select from "../common/Select";

export type SelectPractitionerForOrderingFormInputs = {
  practitioner: string;
};

interface Props extends Pick<ModalProps, "open" | "setOpen"> {
  onSubmit: SubmitHandler<SelectPractitionerForOrderingFormInputs>;
  practitioners: Employee[];
}

const SelectPractitionerForOrderingModal = ({
  onSubmit,
  open,
  setOpen,
  practitioners,
}: Props) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<SelectPractitionerForOrderingFormInputs>({
    defaultValues: {
      practitioner: "",
    },
  });

  const handleCloseModal = () => {
    reset();
    setOpen(false);
  };

  const submitForm = async (data: SelectPractitionerForOrderingFormInputs) => {
    await onSubmit(data);
    handleCloseModal();
    reset({
      practitioner: data.practitioner,
    });
  };

  return (
    <Modal
      title={`Select Practitioner`}
      open={open}
      setOpen={setOpen}
      onClose={() => true}
      afterLeave={handleCloseModal}
      size="sm"
    >
      {!isEmpty(practitioners) ? (
        <form
          onSubmit={handleSubmit(submitForm)}
          className="flex flex-col gap-4 space-y-4"
        >
          <div className="grid gap-5">
            <div className="col-span-1">
              <Controller
                name={`practitioner`}
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <Select
                    label="Practitioner"
                    data={practitioners.map(
                      (practitioner) =>
                        practitioner.fullName +
                        " - " +
                        capitalize(practitioner.practiceType?.replace("_", " "))
                    )}
                    value={value}
                    onChange={onChange}
                    error={errors.practitioner?.message}
                  />
                )}
              />
              {errors.practitioner?.message && (
                <p className="text-xs text-red-500">
                  {errors.practitioner?.message}
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
              Continue
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex w-full flex-col items-center justify-center">
          <p className="">No Practitioners found with approved credentials</p>
        </div>
      )}
    </Modal>
  );
};

export default SelectPractitionerForOrderingModal;
