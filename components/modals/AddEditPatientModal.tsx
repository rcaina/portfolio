import React from "react";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Modal, { ModalProps } from "@/components/common/Modal";
import Select from "../common/Select";
import { sexTypeOptions } from "@/lib/utils";
import { Patient } from "@prisma/client";

export type AddPatientInputs = {
  firstName: string;
  lastName: string;
  email: string;
  medicalRecordNumber: string;
  phoneNumber: string;
  sex: string;
  dateOfBirth: string;
};

interface Props extends Pick<ModalProps, "open" | "setOpen"> {
  onSubmit: (params: AddPatientInputs) => void;
  selectedPatient?: Patient;
}

export default function AddEditPatientModal({
  open,
  setOpen,
  selectedPatient,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<AddPatientInputs>({
    defaultValues: selectedPatient
      ? {
          email: selectedPatient.email,
          firstName: selectedPatient.firstName,
          lastName: selectedPatient.lastName,
          medicalRecordNumber: selectedPatient.medicalRecordNumber,
          phoneNumber: selectedPatient?.phoneNumber ?? "",
          dateOfBirth: dayjs(selectedPatient.dateOfBirth).format("YYYY-MM-DD"),
          sex: selectedPatient?.sex,
        }
      : {
          email: "",
          firstName: "",
          lastName: "",
          phoneNumber: "",
          medicalRecordNumber: "",
          dateOfBirth: "",
          sex: "",
        },
  });

  const onExitModal = () => {
    reset();
  };

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      afterLeave={onExitModal}
      title={selectedPatient ? "Edit Patient" : "Add Patient"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="First Name"
              {...register("firstName", { required: "required" })}
              error={errors.firstName?.message}
            />
            {errors.firstName?.message && (
              <p className="text-xs text-red-500">
                {errors.firstName?.message}
              </p>
            )}
          </div>
          <div>
            <Input
              label="Last Name"
              {...register("lastName", { required: "required" })}
              error={errors.lastName?.message}
            />
            {errors.lastName?.message && (
              <p className="text-xs text-red-500">{errors.lastName?.message}</p>
            )}
          </div>
          <div>
            <Input
              label="Email"
              {...register("email", { required: "required" })}
              type="email"
              error={errors.email?.message}
            />
            {errors.email?.message && (
              <p className="text-xs text-red-500">{errors.email?.message}</p>
            )}
          </div>
          <Input
            label="Phone Number"
            {...register("phoneNumber")}
            error={errors.phoneNumber?.message}
          />
          <div>
            <Input
              label="Patient MRN (Medical Record Number)"
              placeholder="Patient MRN"
              {...register("medicalRecordNumber")}
              error={errors.medicalRecordNumber?.message}
            />
            {errors.medicalRecordNumber?.message && (
              <p className="text-xs text-red-500">
                {errors.medicalRecordNumber?.message}
              </p>
            )}
          </div>
          <div>
            <Input
              label="DOB (Date of Birth)"
              type="date"
              {...register("dateOfBirth", { required: "required" })}
              error={errors.dateOfBirth?.message}
            />
            {errors.dateOfBirth?.message && (
              <p className="text-xs text-red-500">
                {errors.dateOfBirth?.message}
              </p>
            )}
          </div>
          <div>
            <Controller
              name={`sex`}
              control={control}
              rules={{ required: "required" }}
              render={({ field: { value, onChange } }) => (
                <Select
                  label="Sex"
                  required={true}
                  data={sexTypeOptions}
                  value={value}
                  onChange={onChange}
                  error={errors.sex?.message}
                />
              )}
            />
            {errors.sex?.message && (
              <p className="text-xs text-red-500">{errors.sex?.message}</p>
            )}
          </div>
        </div>
        <div className="flex flex-row justify-end gap-4">
          <Button
            variant="white"
            disabled={isSubmitting}
            onClick={() => setOpen(false)}
          >
            {selectedPatient ? "Discard changes" : "Cancel"}
          </Button>
          <Button
            onClick={() => true}
            type="submit"
            loading={isSubmitting}
            disabled={!isDirty}
          >
            {!selectedPatient ? "Add Patient" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
