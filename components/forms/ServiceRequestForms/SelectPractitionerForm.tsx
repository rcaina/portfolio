import { SetStateAction, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import Button from "../../common/Button";
import { Employee } from "@prisma/client";
import Select from "../../common/Select";

export const ServiceRequestSelectPractitionerFormSchema = z.object({
  practitionerId: z.string().min(1),
});

export type ServiceRequestSelectPractitionerFormInputs = z.infer<
  typeof ServiceRequestSelectPractitionerFormSchema
>;

interface Props {
  onSubmit: (data: ServiceRequestSelectPractitionerFormInputs) => void;
  continueWithoutChange: () => void;
  practitioners: Employee[];
  selectedPractitionerId?: string;
  isSubmitting: boolean;
}

const SelectPractitionerForm: React.FC<Props> = ({
  onSubmit,
  continueWithoutChange,
  practitioners,
  selectedPractitionerId,
  isSubmitting,
}) => {
  const [practitionerId, setPractitionerId] = useState<string | undefined>(
    practitioners[0]?.id
  );

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ServiceRequestSelectPractitionerFormInputs>({
    defaultValues: {
      practitionerId: practitionerId ?? "",
    },
  });

  const practitionerOptions = practitioners.map((patient) => ({
    label: patient.fullName,
    value: patient.id,
  }));

  const watchPractitionerId = watch("practitionerId");

  const handleFormSubmit = (
    data: ServiceRequestSelectPractitionerFormInputs
  ) => {
    if (selectedPractitionerId) {
      if (selectedPractitionerId !== watchPractitionerId) {
        return onSubmit(data);
      }
      return continueWithoutChange();
    } else {
      return onSubmit(data);
    }
  };
  //TODO:Add practitioner Type as part of the name selection bar
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex w-full max-w-lg flex-col gap-8 rounded-md bg-white p-8 shadow-lg shadow-highlight-600"
      >
        <Controller
          name="practitionerId"
          control={control}
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <Select
              label="Select Practitioner"
              data={practitionerOptions}
              value={value}
              onChange={(e: SetStateAction<string | undefined>) => {
                onChange(e);
                setPractitionerId(e);
              }}
              error={errors.practitionerId?.message}
              disabled={isSubmitting}
            />
          )}
        />
        <p className="text-xs">
          Cant find a practitioner? Make sure they have an account and an active
          license.
        </p>
        <Button variant="primary" type="submit" loading={isSubmitting}>
          Continue
        </Button>
      </form>
    </div>
  );
};

export default SelectPractitionerForm;
