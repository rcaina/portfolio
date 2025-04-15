import React, { Dispatch, SetStateAction } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

import Input from "@/components/common/Input";
import Modal, { ModalProps } from "@/components/common/Modal";
import Button from "@/components/common/Button";
import Select from "../common/Select";
import { StatesInAmerica } from "@/lib/utils";
import { Address } from "@prisma/client";

export type AddEditAddressFormInputs = {
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
};

interface Props extends Pick<ModalProps, "open" | "setOpen"> {
  onSubmit: SubmitHandler<AddEditAddressFormInputs>;
  setEditingAddress?: Dispatch<SetStateAction<Address | undefined>>;
  editingAddress?: Address;
  isBilling: boolean;
}

const AddEditAddressModal = ({
  onSubmit,
  setOpen,
  setEditingAddress,
  open,
  editingAddress,
  isBilling,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<AddEditAddressFormInputs>({
    defaultValues: {
      label: editingAddress?.label || "",
      addressLine1: editingAddress?.addressLine1 || "",
      addressLine2: editingAddress?.addressLine2 || "",
      city: editingAddress?.city || "",
      state: editingAddress?.state || "",
      zip: editingAddress?.zip || "",
      country: editingAddress?.country || "US",
      isDefault: editingAddress?.default || false,
    },
  });

  const handleCloseModal = () => {
    reset({
      country: "US",
      isDefault: false,
    });
    setEditingAddress?.(undefined);
    setOpen(false);
  };

  const submitForm = async (data: AddEditAddressFormInputs) => {
    await onSubmit(data);
    handleCloseModal();
    reset({
      state: editingAddress?.state,
      country: editingAddress?.country,
      isDefault: editingAddress?.default,
    });
  };

  return (
    <Modal
      title={
        isBilling
          ? editingAddress
            ? "Edit Shipping Address"
            : "Add Shipping Address"
          : editingAddress
          ? "Edit Billing Address"
          : "Add Billing Address"
      }
      open={open}
      setOpen={setOpen}
      onClose={handleCloseModal}
      afterLeave={handleCloseModal}
      size="sm"
    >
      <form
        onSubmit={handleSubmit(submitForm)}
        className="flex flex-col gap-4 space-y-4"
      >
        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-2">
            <Input
              id="label"
              {...register("label", {
                required: "Label is required",
              })}
              label="Label"
              error={errors.label?.message}
            />
            {errors.label?.message && (
              <p className="text-xs text-red-500">{errors.label?.message}</p>
            )}
          </div>
          <div className="col-span-1">
            <Input
              id="addressLine1"
              {...register("addressLine1", {
                required: "Address is required",
              })}
              label="Address"
              error={errors.addressLine1?.message}
            />
            {errors.addressLine1?.message && (
              <p className="text-xs text-red-500">
                {errors.addressLine1?.message}
              </p>
            )}
          </div>
          <div className="col-span-1">
            <Input
              id="addressLine2"
              {...register("addressLine2")}
              label="Address 2"
            />
          </div>
          <div className="col-span-1">
            <Input
              id="city"
              {...register("city", {
                required: "City is required",
              })}
              label="City"
              error={errors.city?.message}
            />
            {errors.city?.message && (
              <p className="text-xs text-red-500">{errors.city.message}</p>
            )}
          </div>
          <div className="col-span-1">
            <Controller
              name="state"
              control={control}
              rules={{
                required: "A state must be selected.",
                validate: (value) =>
                  value !== "Select a state" || "Select a valid state.",
              }}
              render={({ field: { value, onChange } }) => (
                <Select
                  label="State"
                  data={StatesInAmerica.map((state) => state.label)}
                  value={value}
                  onChange={onChange}
                  error={errors.state?.message}
                />
              )}
            />
            {errors.state?.message && (
              <p className="text-xs text-red-500">{errors.state?.message}</p>
            )}
          </div>
          <div className="col-span-1">
            <Input
              id="zip"
              {...register("zip", {
                required: "Zip code is required",
              })}
              label="Zip"
              error={errors.zip?.message}
            />
            {errors.zip?.message && (
              <p className="text-xs text-red-500">{errors.zip.message}</p>
            )}
          </div>
          <div className="col-span-1">
            <Input
              id="country"
              {...register("country", {
                required: "Country is required",
              })}
              label="Country"
              error={errors.country?.message}
            />
            {errors.country?.message && (
              <p className="text-xs text-red-500">{errors.country.message}</p>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row items-center gap-2">
            <input
              id="isDefault"
              type="checkbox"
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              {...register("isDefault")}
            />
            <label
              className="text-sm text-gray-700 dark:text-gray-200"
              htmlFor="verifiedAddSampleData"
            >
              Mark as default
            </label>
          </div>
          <div className="flex flex-row gap-4">
            <Button
              variant="outline"
              loading={isSubmitting}
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
              {editingAddress ? "Save" : "Add Address"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditAddressModal;
