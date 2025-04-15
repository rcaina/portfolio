import Modal, { ModalProps } from "@/components/common/Modal";
import { SubmitHandler, useForm } from "react-hook-form";

import Button from "@/components/common/Button";
import Image from "next/image";
import Input from "@/components/common/Input";

export type EditUserProfileImageFormInputs = {
  imageUrl?: string;
};

interface Props extends Pick<ModalProps, "open" | "setOpen"> {
  onSubmit: SubmitHandler<EditUserProfileImageFormInputs>;
  onRemove: () => void;
  data: {
    imageUrl?: string | undefined | null;
  };
}

const EditUserProfileImageModal = ({
  onSubmit,
  onRemove,
  open,
  setOpen,
  data,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<EditUserProfileImageFormInputs>({
    defaultValues: {
      imageUrl: data?.imageUrl || "",
    },
  });

  const handleCloseModal = () => {
    reset();
    setOpen(false);
  };

  const submitForm = async (data: EditUserProfileImageFormInputs) => {
    await onSubmit(data);
    handleCloseModal();
    reset(
      {
        imageUrl: data.imageUrl,
      },
      { keepValues: false }
    );
  };

  return (
    <Modal
      title={`Edit Profile Image`}
      open={open}
      setOpen={setOpen}
      onClose={handleCloseModal}
      size="sm"
    >
      <form
        onSubmit={handleSubmit(submitForm)}
        className="flex flex-col gap-4 space-y-4"
      >
        <div className="flex w-full flex-col items-center gap-5">
          {data.imageUrl && (
            <div className="relative flex-shrink-0">
              <Image
                src={data?.imageUrl || ""}
                alt="Description"
                width={200}
                height={200}
                className="mr-2 rounded-full"
              />
              <div className="absolute inset-0 rounded-full bg-gray-200 opacity-0 transition duration-300 ease-in-out hover:opacity-50"></div>
            </div>
          )}
          <div className="col-span-1">
            <Input
              label="Profile Image (.jpeg, .png)"
              className="w-full self-center rounded-md border border-gray-400"
              type="file"
              id="imageUrl"
              {...register("imageUrl")}
              accept="image/jpeg,image/png"
            />
            {errors?.imageUrl && <p>{errors?.imageUrl.message}</p>}
          </div>
        </div>
        <div className="flex flex-row justify-between">
          <div className="flex justify-start">
            {data?.imageUrl && (
              <div className="flex w-full justify-end">
                <Button variant="danger" onClick={onRemove}>
                  Remove current profile image
                </Button>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditUserProfileImageModal;
