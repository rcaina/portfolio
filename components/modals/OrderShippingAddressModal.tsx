import { Address, Employee } from "@prisma/client";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Modal, { ModalProps } from "@/components/common/Modal";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "../common/Select";
import { StatesInAmerica } from "@/lib/utils";

export type OrderShippingAddressFormInputs = {
  addressLine1: string;
  addressLine2?: string | null;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
};

interface Props extends Pick<ModalProps, "open" | "setOpen"> {
  onSubmit: SubmitHandler<OrderShippingAddressFormInputs>;
  employee: Employee & {
    accounts: {
      organization: { addresses: Address[] };
    }[];
  };
}

const OrderShippingAddressModal = ({
  onSubmit,
  open,
  setOpen,
  employee,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, isValid, errors },
  } = useForm<OrderShippingAddressFormInputs>({
    defaultValues: {
      addressLine1: employee.accounts[0].organization.addresses[0].addressLine1,
      addressLine2:
        employee.accounts[0].organization.addresses[0]?.addressLine2,
      city: employee.accounts[0].organization.addresses[0].city,
      state: employee.accounts[0].organization.addresses[0].state,
      zip: employee.accounts[0].organization.addresses[0].zip,
      country: employee.accounts[0].organization.addresses[0].country,
    },
  });

  const handleCloseModal = () => {
    reset();
    setOpen(false);
  };

  // const submitForm = async (data: OrderShippingAddressFormInputs) => {
  //   await onSubmit(data);
  //   handleCloseModal();
  // };

  return (
    <Modal
      title={`Shipping Address`}
      open={open}
      setOpen={setOpen}
      onClose={handleCloseModal}
      size="sm"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 space-y-4"
      >
        <div className="grid-col ml-20 mr-20 grid gap-4">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <Input
                {...register(`addressLine1`, {
                  required: true,
                })}
                name="addressLine1"
                label="Address"
                disabled={isSubmitting}
                error={errors.addressLine1?.message}
              />
            </div>
            <div className="col-span-2">
              <Input
                {...register(`addressLine2`)}
                name="addressLine2"
                label="Address 2"
                placeholder="Apartment, suite, etc. (optional)"
                disabled={isSubmitting}
                error={errors.addressLine2?.message}
              />
            </div>
            <div className="col-span-1">
              <Input
                {...register(`city`, {
                  required: true,
                })}
                name="city"
                label="City"
                placeholder="City"
                disabled={isSubmitting}
                error={errors.city?.message}
              />
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
                {...register(`zip`, {
                  required: true,
                })}
                name="zip"
                label="Zip code"
                placeholder="Zip code"
                disabled={isSubmitting}
                error={errors.zip?.message}
              />
            </div>
            <div className="col-span-1">
              <Input
                {...register(`country`, {
                  required: true,
                })}
                name="country"
                label="Country"
                placeholder="US"
                disabled={isSubmitting}
                error={errors.country?.message}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            className="btn-primary ml-2"
            type="submit"
            loading={isSubmitting}
            disabled={!isValid}
          >
            Continue to Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default OrderShippingAddressModal;
