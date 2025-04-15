import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { InviteeVerificationFormInputs } from "@/pages/register-verify-information";
import { useForm } from "react-hook-form";

interface Props {
  onSubmit: (data: InviteeVerificationFormInputs) => void;
  employee: {
    name: string | undefined;
    phoneNumber?: string | null;
  };
}

export default function InviteeVerificationInformationForm({
  onSubmit,
  employee,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<InviteeVerificationFormInputs>({
    defaultValues: {
      firstName: employee.name?.split(" ")[0],
      lastName: employee.name?.split(" ")[1],
      phoneNumber: employee?.phoneNumber || undefined,
    },
  });

  return (
    <div className="m-auto flex flex-col gap-4 ">
      <h1 className="mb-5 text-4xl font-bold">Verify your information</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <hr className="mb-4" />
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-1">
              <Input
                {...register(`firstName`, {
                  required: true,
                })}
                placeholder="first name"
                name="firstName"
                label="First name"
                disabled={isSubmitting}
                error={errors.firstName?.message}
              />
            </div>
            <div className="col-span-1">
              <Input
                {...register(`lastName`, {
                  required: true,
                })}
                placeholder="last name"
                name="lastName"
                label="Last name"
                disabled={isSubmitting}
                error={errors.lastName?.message}
              />
            </div>

            <div className="col-span-1">
              <Input
                id="phoneNumber"
                label="Phone Number"
                {...register("phoneNumber", {
                  validate: (value) => {
                    if (!value) return true;
                    const sanitizedValue = value.replace(/-/g, "");
                    if (
                      /^\d+$/.test(sanitizedValue) &&
                      (sanitizedValue.length === 10 ||
                        sanitizedValue.length === 11)
                    ) {
                      return true;
                    }
                    return "Phone number must be 10 digits and can optionally include dashes (-).";
                  },
                })}
                error={errors.phoneNumber?.message}
              />
              {errors.phoneNumber?.message && (
                <p className="text-xs text-red-500">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button loading={isSubmitting} type="submit">
              Continue
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
