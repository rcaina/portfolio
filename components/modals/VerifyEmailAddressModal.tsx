import { SubmitHandler, useForm } from "react-hook-form";

import Input from "@/components/common/Input";
import Modal, { ModalProps } from "@/components/common/Modal";
import Button from "@/components/common/Button";

export type EditUserProfileFormInputs = {
  code: string;
};

interface Props extends Pick<ModalProps, "open" | "setOpen"> {
  onSubmit: SubmitHandler<EditUserProfileFormInputs>;
}

const VerifyEmailAddressModal = ({ onSubmit, open, setOpen }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<EditUserProfileFormInputs>({
    defaultValues: {
      code: "",
    },
  });

  const handleCloseModal = () => {
    reset();
    setOpen(false);
  };

  const submitForm = async (data: EditUserProfileFormInputs) => {
    await onSubmit(data);
    handleCloseModal();
  };

  return (
    <Modal
      title={`Complete Email Verification`}
      open={open}
      setOpen={setOpen}
      onClose={handleCloseModal}
      size="sm"
    >
      <form
        onSubmit={handleSubmit(submitForm)}
        className="flex flex-col gap-4 space-y-4"
      >
        <div className="grid-col ml-20 mr-20 grid gap-4">
          <div className="flex items-center justify-between gap-10">
            <label>Enter code:</label>
            <Input
              className="min-w-56 rounded-md border border-gray-400"
              id="code"
              {...register("code")}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            className="btn-primary ml-2"
            type="submit"
            loading={isSubmitting}
            disabled={!isDirty}
          >
            Verify
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default VerifyEmailAddressModal;
