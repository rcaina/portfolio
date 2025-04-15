import { Address, ChargeType } from "@prisma/client";
import { COST_PER_KIT, ChargeTypeEnum, StatesInAmerica } from "@/lib/utils";
import { Controller, useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import Button from "../common/Button";
import Container from "../layout/Container";
import Image from "next/image";
import Input from "../common/Input";
import Select from "../common/Select";
import logo from "@/public/images/logo.png";
import { z } from "zod";

export const OrderingAddressDetailsFormSchema = z.object({
  quantity: z.number().int().positive(),
  subtotal: z.number().positive(),
  additionalCharges: z.array(
    z.object({
      description: z.string().min(1),
      type: ChargeTypeEnum,
      amount: z.number().positive(),
    })
  ),
  total: z.number().positive(),
  shipToId: z.string().optional(),
  shipTo: z.object({
    label: z.string().min(1),
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    zip: z.string().min(1),
    country: z.string().min(1),
  }),
});

export type OrderingAddressDetailsFormInputs = z.infer<
  typeof OrderingAddressDetailsFormSchema
>;

interface Props {
  onSubmit: (data: OrderingAddressDetailsFormInputs) => void;
  setData: Dispatch<SetStateAction<OrderingAddressDetailsFormInputs | null>>;
  addresses: Address[];
}

const OrderKitsCartForm: React.FC<Props> = ({
  onSubmit,
  setData,
  addresses,
}) => {
  const [addressId, setAddressId] = useState<string | undefined>(
    addresses.find((a) => a.default)?.id ?? addresses[0]?.id
  );
  const [quantity, setQuantity] = useState(1);
  const [subtotal, setSubtotal] = useState(COST_PER_KIT);
  const [shippingFee, setShippingFee] = useState(10); // Example shipping fee
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(subtotal + shippingFee + tax);

  const {
    reset,
    register,
    handleSubmit,
    setValue,
    control,
    formState: { isSubmitting, errors },
  } = useForm<OrderingAddressDetailsFormInputs>({
    defaultValues: {
      quantity: 1,
      subtotal: COST_PER_KIT,
      additionalCharges: [
        {
          description: "Shipping Fee",
          type: ChargeType.SHIPPING,
          amount: 10,
        },
        {
          description: "Tax Fee",
          type: ChargeType.TAX,
          amount: 0,
        },
      ],
      total: COST_PER_KIT + 10,
      shipToId: addressId,
      shipTo: {
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zip: "",
        country: "",
      },
    },
  });

  useEffect(() => {
    const newSubtotal = quantity * COST_PER_KIT;
    const newTax = newSubtotal * 0.1; // Example tax calculation (10%)
    const newTotal = newSubtotal + shippingFee + newTax;
    setValue("quantity", quantity);
    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);
  }, [quantity, shippingFee, setValue]);

  useEffect(() => {
    const selectedAddress = addresses.find(
      (address) => address.id === addressId
    );
    if (selectedAddress) {
      setValue("shipTo", {
        label: selectedAddress.label,
        addressLine1: selectedAddress.addressLine1,
        addressLine2: selectedAddress.addressLine2 ?? "",
        city: selectedAddress.city,
        state: selectedAddress.state,
        zip: selectedAddress.zip,
        country: selectedAddress.country,
      });
    }
  }, [addressId, addresses, setValue]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };

  const handleReset = () => {
    const defaultAddress = addresses.find((a) => a.default) ?? addresses[0];
    setQuantity(1);
    setSubtotal(COST_PER_KIT);
    setShippingFee(10);
    setTax(0);
    setTotal(COST_PER_KIT + 10);
    setData(null);
    reset({
      quantity: 1,
      subtotal: COST_PER_KIT,
      additionalCharges: [
        {
          description: "Shipping Fee",
          type: ChargeType.SHIPPING,
          amount: 10,
        },
        {
          description: "Tax Fee",
          type: ChargeType.TAX,
          amount: 0,
        },
      ],
      total: COST_PER_KIT + 10,
      shipToId: defaultAddress.id,
      shipTo: {
        label: defaultAddress.label,
        addressLine1: defaultAddress.addressLine1,
        addressLine2: defaultAddress?.addressLine2 ?? "",
        city: defaultAddress.city,
        state: defaultAddress.state,
        zip: defaultAddress.zip,
        country: defaultAddress.country,
      },
    });
    setAddressId(defaultAddress.id);
  };

  const addressOptions = addresses.map((address) => ({
    label: address.label,
    value: address.id,
  }));

  const submitOrderReview = (data: OrderingAddressDetailsFormInputs) => {
    onSubmit({
      ...data,
      subtotal,
      additionalCharges: [
        {
          description: "Shipping Fee",
          type: ChargeType.SHIPPING,
          amount: shippingFee,
        },
        {
          description: "Tax Fee",
          type: ChargeType.TAX,
          amount: tax,
        },
      ],
      total,
    });
  };

  return (
    <Container className="shadow-b flex w-full rounded-sm border-[1px] border-highlight-600 shadow-lg shadow-highlight-300">
      <form
        onSubmit={handleSubmit(submitOrderReview)}
        className="flex w-full flex-row"
      >
        <div className="flex w-full flex-col gap-4">
          <div className="flex justify-end">
            <Button variant="secondary" onClick={handleReset}>
              Reset Order
            </Button>
          </div>
          <div className="flex flex-col rounded-sm ">
            <div className="flex flex-col gap-2 font-bold">Test Kits</div>
            <div className="flex w-full flex-row gap-12">
              <div className="items-center justify-center overflow-hidden rounded-sm bg-white">
                <Image
                  priority
                  src={logo}
                  alt="Resonant Logo"
                  placeholder="blur"
                  width={95}
                  height={36}
                  className="object-cover"
                />
              </div>
              <div className="flex w-full flex-col items-center">
                <div className="flex w-full items-start justify-between">
                  <div className="flex flex-col items-start">
                    <div>Generic Kits</div>
                    <div className="mt-2 flex items-center rounded-sm">
                      <button
                        className="rounded-sm bg-highlight-600 px-2 py-1.5 text-primary-500"
                        onClick={(e) => {
                          e.preventDefault();
                          handleQuantityChange(quantity - 1);
                        }}
                      >
                        -
                      </button>
                      <Input
                        className="w-10 border border-primary-300 px-2 py-1 text-center"
                        value={quantity.toString()}
                        onChange={(e) =>
                          handleQuantityChange(parseInt(e.target.value, 10))
                        }
                        min="1"
                      />
                      <button
                        className="rounded-sm bg-highlight-600 px-2 py-1.5 text-primary-500"
                        onClick={(e) => {
                          e.preventDefault();
                          handleQuantityChange(quantity + 1);
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className={`justify-start font-semibold`}>
                    ${subtotal.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-4 flex flex-col gap-4">
            <hr className="mt-4" />
            <label className="font-semibold ">Shipping</label>
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <Controller
                  name="shipToId"
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      data={addressOptions}
                      value={value}
                      onChange={(e) => {
                        onChange(e);
                        setAddressId(e);
                      }}
                      error={errors.shipToId?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </div>
              <div className="col-span-2">
                <Input
                  {...register("shipTo.addressLine1", { required: true })}
                  name="shipTo.addressLine1"
                  label="Address"
                  disabled={true}
                  error={errors.shipTo?.addressLine1?.message}
                />
              </div>
              <div className="col-span-2">
                <Input
                  {...register("shipTo.addressLine2")}
                  name="shipTo.addressLine2"
                  label="Address 2"
                  placeholder="Apartment, suite, etc. (optional)"
                  disabled={true}
                  error={errors.shipTo?.addressLine2?.message}
                />
              </div>
              <div className="col-span-1">
                <Input
                  {...register("shipTo.city", { required: true })}
                  name="shipTo.city"
                  label="City"
                  placeholder="City"
                  disabled={true}
                  error={errors.shipTo?.city?.message}
                />
              </div>
              <div className="col-span-1">
                <Controller
                  name="shipTo.state"
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
                      error={errors.shipTo?.state?.message}
                      disabled={true}
                    />
                  )}
                />
                {errors.shipTo?.state?.message && (
                  <p className="text-xs text-red-500">
                    {errors.shipTo?.state?.message}
                  </p>
                )}
              </div>
              <div className="col-span-1">
                <Input
                  {...register("shipTo.zip", { required: true })}
                  name="shipTo.zip"
                  label="Zip code"
                  placeholder="Zip code"
                  disabled={true}
                  error={errors.shipTo?.zip?.message}
                />
              </div>
              <div className="col-span-1">
                <Input
                  {...register("shipTo.country", { required: true })}
                  name="shipTo.country"
                  label="Country"
                  placeholder="US"
                  disabled={true}
                  error={errors.shipTo?.country?.message}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="primary" type="submit">
                Review Order
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Container>
  );
};

export default OrderKitsCartForm;
