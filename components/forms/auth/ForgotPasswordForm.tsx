import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

interface SignInFormInputs {
  email: string;
}

interface Props {
  onSubmit: ({ email }: { email: string }) => void;
}

export const ForgotPasswordForm = ({ onSubmit }: Props) => {
  const route = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<SignInFormInputs>({
    defaultValues: {
      email: "",
    },
  });

  const watchEmail = watch("email");
  return (
    <div className="m-auto flex flex-col items-center gap-4">
      <h1 className="text-4xl font-medium ">Reset Password</h1>
      <h3 className="text-lg text-secondary-500 ">
        Enter your email address to get instructions for resetting your
        password.
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-1">
        <div className="w-64">
          <div className="flex flex-col gap-4">
            <Input
              {...register(`email`, {
                required: true,
              })}
              placeholder="email"
              name="email"
              label="Email"
              type="email"
              disabled={isSubmitting}
              error={errors.email?.message}
            />
            <Button loading={isSubmitting} disabled={!watchEmail} type="submit">
              Reset&nbsp;password
            </Button>
          </div>
        </div>
      </form>
      <h3 className="text-md flex gap-2 text-secondary-500 ">
        <p>Back to</p>
        <p>
          <Link
            href={route && `/sign-in`}
            className="font-medium text-secondary-600 hover:text-highlight-600  "
          >
            Sign In
          </Link>
          .
        </p>
      </h3>
    </div>
  );
};
