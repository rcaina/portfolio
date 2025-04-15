import { SetStateAction, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import Button from "../../common/Button";
import { ServiceType } from "@prisma/client";
import Select from "../../common/Select";
import { isEmpty } from "lodash-es";

export const OrderSelectServiceTypeFormSchema = z.object({
  serviceTypeId: z.string().min(1),
});

export type OrderSelectServiceTypeFormInputs = z.infer<
  typeof OrderSelectServiceTypeFormSchema
>;

interface Props {
  onSubmit: (data: OrderSelectServiceTypeFormInputs) => void;
  continueWithoutChange?: () => void;
  isSubmitting: boolean;
  serviceTypes: ServiceType[];
  selectedServiceTypeId?: string;
}

const SelectServiceTypeForm: React.FC<Props> = ({
  onSubmit,
  continueWithoutChange,
  serviceTypes,
  selectedServiceTypeId,
}) => {
  const [serviceTypeId, setServiceTypeId] = useState<string | undefined>(
    !isEmpty(serviceTypes) ? serviceTypes[0]?.id : undefined
  );

  const {
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<OrderSelectServiceTypeFormInputs>({
    defaultValues: {
      serviceTypeId: selectedServiceTypeId ?? serviceTypeId ?? "",
    },
  });

  const serviceTypeOptions = serviceTypes.map((type) => ({
    label: type.name,
    value: type.id,
  }));

  const watchServiceType = watch("serviceTypeId");

  const handleFormSubmit = (data: OrderSelectServiceTypeFormInputs) => {
    if (selectedServiceTypeId) {
      if (selectedServiceTypeId !== watchServiceType) {
        return onSubmit(data);
      }
      return continueWithoutChange?.();
    } else {
      return onSubmit(data);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex w-full max-w-lg flex-col gap-8 rounded-md border border-highlight-600 bg-white p-8 shadow-lg shadow-highlight-600"
      >
        <Controller
          name="serviceTypeId"
          control={control}
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <Select
              label="Select Service Type"
              data={serviceTypeOptions}
              value={value}
              onChange={(e: SetStateAction<string | undefined>) => {
                onChange(e);
                setServiceTypeId(e);
              }}
              error={errors.serviceTypeId?.message}
              disabled={isSubmitting}
            />
          )}
        />
        <Button variant="primary" type="submit">
          Continue
        </Button>
      </form>
    </div>
  );
};

export default SelectServiceTypeForm;
