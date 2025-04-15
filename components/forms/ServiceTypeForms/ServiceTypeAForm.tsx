import { useForm } from "react-hook-form";
import { z } from "zod";

import Button from "../../common/Button";
import { isEqual } from "lodash-es";

export const ServiceTypeAFormSchema = z.object({
  smoke: z.string().min(1),
  drink: z.string().min(1),
  exercise: z.string().min(1),
});

export type ServiceTypeAFormInputs = z.infer<typeof ServiceTypeAFormSchema>;

interface Props {
  onSubmit: (data: ServiceTypeAFormInputs) => void;
  continueWithoutChange: () => void;
  answers?: {
    [key: string]: string;
  } | null;
  isSubmitting: boolean;
}

const ServiceTypeAForm: React.FC<Props> = ({
  onSubmit,
  continueWithoutChange,
  answers,
  isSubmitting,
}) => {
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<ServiceTypeAFormInputs>({
    defaultValues: {
      smoke: answers?.smoke ?? "",
      drink: answers?.drink ?? "",
      exercise: answers?.exercise ?? "",
    },
  });

  const watchAllFields = watch();
  const initialValues = {
    smoke: answers?.smoke ?? "",
    drink: answers?.drink ?? "",
    exercise: answers?.exercise ?? "",
  };

  const handleFormSubmit = (data: ServiceTypeAFormInputs) => {
    if (!isEqual(initialValues, watchAllFields)) {
      onSubmit(data);
    } else {
      continueWithoutChange();
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex w-full max-w-lg flex-col gap-8 rounded-md bg-white p-8 shadow-lg"
    >
      <h1 className="text-2xl font-semibold ">Service Type A</h1>
      <div className="flex flex-col gap-4">
        <label className="" htmlFor="smoke">
          Do you smoke?
        </label>
        <input
          id="smoke"
          type="text"
          className="rounded-md border border-primary-300 p-2"
          {...register("smoke", { required: true })}
        />
        {errors.smoke && (
          <span className="text-red-500">This field is required</span>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <label className="" htmlFor="drink">
          Do you drink?
        </label>
        <input
          id="drink"
          type="text"
          className="rounded-md border border-primary-300 p-2"
          {...register("drink", { required: true })}
        />
        {errors.drink && (
          <span className="text-red-500">This field is required</span>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <label className="" htmlFor="exercise">
          Do you exercise?
        </label>
        <input
          id="exercise"
          type="text"
          className="rounded-md border border-primary-300 p-2"
          {...register("exercise", { required: true })}
        />
        {errors.exercise && (
          <span className="text-red-500">This field is required</span>
        )}
      </div>
      <Button variant="primary" type="submit" loading={isSubmitting}>
        Continue
      </Button>
    </form>
  );
};

export default ServiceTypeAForm;
