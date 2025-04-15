import { useForm } from "react-hook-form";
import { z } from "zod";

import Button from "../../common/Button";
import Input from "@/components/common/Input";

export const ServiceTypeBFormSchema = z.object({
  drive: z.string().min(1),
  playNintendo: z.string().min(1),
  favoriteGame: z.string().min(1),
});

export type ServiceTypeBFormInputs = z.infer<typeof ServiceTypeBFormSchema>;

interface Props {
  onSubmit: (data: ServiceTypeBFormInputs) => void;
  isSubmitting: boolean;
}

const ServiceTypeBForm: React.FC<Props> = ({ onSubmit, isSubmitting }) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ServiceTypeBFormInputs>({});

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-lg flex-col gap-8 rounded-md bg-white p-8 shadow-lg"
    >
      <h1 className="text-2xl font-semibold ">Service Type B</h1>
      <div className="flex flex-col gap-4">
        <label className="" htmlFor="drive">
          Do you drive?
        </label>
        <Input
          id="drive"
          type="text"
          {...register("drive", { required: "required" })}
        />
        {errors.drive && (
          <span className="text-red-500">This field is required</span>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <label className="" htmlFor="playNintendo">
          Do you play Nintendo?
        </label>
        <Input
          id="playNintendo"
          type="text"
          {...register("playNintendo", { required: "required" })}
        />
        {errors.playNintendo && (
          <span className="text-red-500">This field is required</span>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <label className="" htmlFor="favoriteGame">
          What is your favorite game?
        </label>
        <Input
          id="favoriteGame"
          type="text"
          {...register("favoriteGame", { required: "required" })}
        />
        {errors.favoriteGame && (
          <span className="text-red-500">This field is required</span>
        )}
      </div>
      <Button variant="primary" type="submit" loading={isSubmitting}>
        Continue
      </Button>
    </form>
  );
};

export default ServiceTypeBForm;
