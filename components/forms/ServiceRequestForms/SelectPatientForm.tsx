import { SetStateAction, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import Button from "../../common/Button";
import { Patient } from "@prisma/client";
import Select from "../../common/Select";
import dayjs from "dayjs";

export const ServiceRequestSelectPatientFormSchema = z.object({
  patientId: z.string().min(1),
});

export type ServiceRequestSelectPatientFormInputs = z.infer<
  typeof ServiceRequestSelectPatientFormSchema
>;

interface Props {
  onSubmit: (data: ServiceRequestSelectPatientFormInputs) => void;
  continueWithoutChange: () => void;
  isSubmitting: boolean;
  patients: Patient[];
  selectedPatientId?: string;
}

const SelectPatientForm: React.FC<Props> = ({
  onSubmit,
  continueWithoutChange,
  isSubmitting,
  patients,
  selectedPatientId,
}) => {
  const [patient, setPatient] = useState<Patient | undefined>(patients[0]);
  const [patientId, setPatientId] = useState<string | undefined>(
    patients[0]?.id
  );

  useEffect(() => {
    const updatePatient = async () => {
      const patient = patients.find((patient) => patient.id === patientId);
      setPatient(patient);
    };
    updatePatient();
  }, [patientId, patients]);
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ServiceRequestSelectPatientFormInputs>({
    defaultValues: {
      patientId: selectedPatientId || patientId || "",
    },
  });

  const patientOptions = patients.map((patient) => ({
    label: patient.fullName,
    value: patient.id,
  }));

  const watchPatientId = watch("patientId");

  const handleFormSubmit = (data: ServiceRequestSelectPatientFormInputs) => {
    if (selectedPatientId) {
      if (selectedPatientId !== watchPatientId) {
        return onSubmit(data);
      }
      return continueWithoutChange();
    } else {
      return onSubmit(data);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex w-full max-w-2xl flex-col gap-8 rounded-md border border-highlight-600 bg-white p-8 shadow-lg shadow-highlight-600"
      >
        <Controller
          name="patientId"
          control={control}
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <Select
              label="Select Patient"
              data={patientOptions}
              value={value}
              onChange={(e: SetStateAction<string | undefined>) => {
                onChange(e);
                setPatientId(e);
              }}
              error={errors.patientId?.message}
              disabled={isSubmitting}
            />
          )}
        />
        {patient && patientId && (
          <div className="flex flex-wrap gap-5">
            <div className="text-sm  sm:w-[calc(50%-10px)]">
              Email:
              <div className="flex flex-col rounded-md border border-highlight-600 p-2">
                {patient?.email}
              </div>
            </div>
            {patient?.phoneNumber && (
              <div className="text-sm  sm:w-[calc(50%-10px)]">
                Phone Number:
                <div className="flex flex-col rounded-md border border-highlight-600 p-2">
                  {patient?.phoneNumber}
                </div>
              </div>
            )}
            <div className="text-sm  sm:w-[calc(50%-10px)]">
              DOB:
              <div className="flex flex-col rounded-md border border-highlight-600 p-2">
                {dayjs(patient?.dateOfBirth).format("MM/DD/YYYY")}
              </div>
            </div>
            <div className="text-sm  sm:w-[calc(50%-10px)]">
              Sex:
              <div className="flex flex-col rounded-md border border-highlight-600 p-2">
                {patient?.sex}
              </div>
            </div>
          </div>
        )}
        <Button variant="primary" type="submit" loading={isSubmitting}>
          Continue
        </Button>
      </form>
    </div>
  );
};

export default SelectPatientForm;
