import React, { Dispatch, SetStateAction } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import Input from "@/components/common/Input";
import Modal, { ModalProps } from "@/components/common/Modal";
import Button from "@/components/common/Button";
import Select from "../common/Select";
import { StatesInAmerica } from "@/lib/utils";
import { License } from "@prisma/client";
import { FormField } from "../common/Form";
import { FileDropzone } from "../common/FileDropzone";

export const AddLicenseFormSchema = z.object({
  number: z.string().min(1),
  effectiveDate: z.string().min(1),
  expirationDate: z.string().min(1),
  state: z.string().min(1),
  medicalLicense: z.custom<File[]>(),
});

export const EditLicenseFormSchema = z.object({
  number: z.string().optional(),
  effectiveDate: z.string().optional(),
  expirationDate: z.string().optional(),
  state: z.string().optional(),
  medicalLicense: z.custom<File[]>().default([]),
});

export type AddLicenseFormInputs = z.infer<typeof AddLicenseFormSchema>;
export type EditLicenseFormInputs = z.infer<typeof EditLicenseFormSchema>;

interface Props extends Pick<ModalProps, "open" | "setOpen"> {
  onSubmit: SubmitHandler<AddLicenseFormInputs | EditLicenseFormInputs>;
  setEditingLicense?: Dispatch<SetStateAction<License | undefined>>;
  editingLicense?: License;
}

const AddEditLicenseModal = ({
  onSubmit,
  setOpen,
  setEditingLicense,
  open,
  editingLicense,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<AddLicenseFormInputs | EditLicenseFormInputs>({
    defaultValues: {
      number: editingLicense?.number || "",
      effectiveDate:
        editingLicense?.effectiveDate.toString().split("T")[0] || undefined,
      expirationDate:
        editingLicense?.expirationDate.toString().split("T")[0] || undefined,
      state: editingLicense?.state || "",
    },
  });

  const handleCloseModal = () => {
    reset();
    setEditingLicense?.(undefined);
    setOpen(false);
  };

  const submitForm = async (
    data: AddLicenseFormInputs | EditLicenseFormInputs
  ) => {
    await onSubmit(data);
    handleCloseModal();
    reset();
  };

  return (
    <Modal
      title={editingLicense ? "Edit License" : "Add New License"}
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
        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-1">
            <Input
              id="number"
              {...register("number", {
                required: "number is required",
              })}
              label="Number"
              error={errors.number?.message}
            />
            {errors.number?.message && (
              <p className="text-xs text-red-500">{errors.number?.message}</p>
            )}
          </div>
          <div className="col-span-1">
            <Controller
              name="state"
              control={control}
              rules={{
                required: "A state must be selected.",
                validate: (value) =>
                  value !== "Select a state" || "Select a valid state.",
              }}
              render={({ field: { value, onChange } }) => (
                <Select
                  label="State"
                  data={StatesInAmerica.map((state) => state.label)}
                  value={value}
                  onChange={onChange}
                  error={errors.state?.message}
                />
              )}
            />
            {errors.state?.message && (
              <p className="text-xs text-red-500">{errors.state?.message}</p>
            )}
          </div>
          <div className="col-span-1">
            <Input
              id="effectiveDate"
              {...register("effectiveDate", {
                required: "Effective date is required",
              })}
              type="date"
              label="Effective Date"
              error={errors.effectiveDate?.message}
            />
            {errors.effectiveDate?.message && (
              <p className="text-xs text-red-500">
                {errors.effectiveDate?.message}
              </p>
            )}
          </div>
          <div className="col-span-1">
            <Input
              id="expirationDate"
              {...register("expirationDate", {
                required: "Effective date is required",
              })}
              label="Expiration Date"
              type="date"
              error={errors.expirationDate?.message}
            />
            {errors.expirationDate?.message && (
              <p className="text-xs text-red-500">
                {errors.expirationDate?.message}
              </p>
            )}
          </div>
          <div className="col-span-2">
            <FormField
              name="medicalLicense"
              control={control}
              rules={{ required: editingLicense ? false : "File is required" }}
              render={({ field, fieldState: { error } }) => (
                <FileDropzone
                  label="Copy of Medical License"
                  error={error?.message}
                  instructionText="Drag and drop here, or click to select file"
                  accept={{
                    "application/": ["pdf, png, jpeg"],
                  }}
                  name={field.name}
                  maxFiles={1}
                  files={field.value}
                  onDrop={(acceptedFiles) => {
                    field.onChange(acceptedFiles);
                  }}
                />
              )}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <div className="flex flex-row gap-4">
            <Button
              variant="outline"
              loading={isSubmitting}
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
              {editingLicense ? "Submit for Approval" : "Add License"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditLicenseModal;
