import { useForm } from "react-hook-form";
import { z } from "zod";

import Button from "../../common/Button";
import Input from "@/components/common/Input";

export const ServiceRequestKitAssignmentFormSchema = z.object({
  kitId: z.string().min(1),
  verifyValidKit: z.boolean().refine((val) => val === true, {
    message: "You must verify that this kit is not expired.",
  }),
});

export type ServiceRequestKitAssignmentFormInputs = z.infer<
  typeof ServiceRequestKitAssignmentFormSchema
>;

interface Props {
  onSubmit: (data: ServiceRequestKitAssignmentFormInputs) => void;
  isSubmitting: boolean;
}

const KitAssignmentForm: React.FC<Props> = ({ onSubmit, isSubmitting }) => {
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<ServiceRequestKitAssignmentFormInputs>({
    defaultValues: {
      kitId: "",
      verifyValidKit: false,
    },
  });

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full max-w-lg flex-col gap-8 rounded-md bg-white p-8 shadow-lg"
      >
        <Input
          {...register(`kitId`, {
            required: true,
          })}
          name="kitId"
          label="Kit ID"
          placeholder="Enter Kit ID"
          disabled={isSubmitting}
          error={errors.kitId?.message}
        />
        <div className="flex justify-between gap-4">
          <div className="flex flex-row items-end gap-2">
            <input
              id="verifyValidKit"
              type="checkbox"
              className="rounded border-gray-300 text-highlight-600 focus:ring-highlight-600"
              {...register("verifyValidKit")}
            />
            <label
              className="text-sm text-secondary-500"
              htmlFor="verifyValidKit"
            >
              I verify that this kit is not expired
            </label>
          </div>
          <Button
            variant="primary"
            type="submit"
            disabled={!watch("verifyValidKit") || isSubmitting}
            loading={isSubmitting}
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
};

export default KitAssignmentForm;
