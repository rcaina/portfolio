import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../common/Accordion";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import { StatesInAmerica } from "@/lib/utils";
import { Address } from "@prisma/client";

export const OrderingAddressDetailsFormSchema = z.object({
  shipping: z.object({
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    zip: z.string().min(1),
    country: z.string().min(1),
  }),
  billing: z.object({
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    zip: z.string().min(1),
    country: z.string().min(1),
  }),
});

export type OrderingAddressDetailsFormInputs = {
  shipping: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  billing: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
};

interface Props {
  onSubmit: (data: OrderingAddressDetailsFormInputs) => void;
  addresses: {
    shipping: Address;
    billing: Address;
  };
  isSubmitting: boolean;
}

export default function OrderingAddressDetailsForm({
  onSubmit,
  addresses,
  isSubmitting,
}: Props) {
  const [accordionView, setAccordionView] = useState("shipping");
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<OrderingAddressDetailsFormInputs>({
    defaultValues: {
      shipping: {
        addressLine1: addresses.shipping.addressLine1,
        addressLine2: addresses.shipping?.addressLine2 ?? "",
        city: addresses.shipping.city,
        state: addresses.shipping.state,
        zip: addresses.shipping.zip,
        country: addresses.shipping.country,
      },
      billing: {
        addressLine1: addresses.billing.addressLine1,
        addressLine2: addresses.billing?.addressLine2 ?? "",
        city: addresses.billing.city,
        state: addresses.billing.state,
        zip: addresses.billing.zip,
        country: addresses.billing.country,
      },
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Accordion
          type="single"
          collapsible
          className="flex w-full min-w-96 flex-col gap-2"
          value="shipping"
          onClick={() =>
            accordionView === "shipping"
              ? setAccordionView("billing")
              : setAccordionView("shipping")
          }
        >
          <AccordionItem value={accordionView}>
            <AccordionTrigger>
              <div className="flex flex-col items-start">
                <h2 className="text-xl font-bold ">Shipping Address</h2>
              </div>
            </AccordionTrigger>
            <AccordionContent className="overflow-visible">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <Input
                    {...register(`shipping.addressLine1`, {
                      required: true,
                    })}
                    name="shipping.addressLine1"
                    label="Address"
                    disabled={isSubmitting}
                    error={errors.shipping?.addressLine1?.message}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    {...register(`shipping.addressLine2`)}
                    name="shipping.addressLine2"
                    label="Address 2"
                    placeholder="Apartment, suite, etc. (optional)"
                    disabled={isSubmitting}
                    error={errors.shipping?.addressLine2?.message}
                  />
                </div>
                <div className="col-span-1">
                  <Input
                    {...register(`shipping.city`, {
                      required: true,
                    })}
                    name="shipping.city"
                    label="City"
                    placeholder="City"
                    disabled={isSubmitting}
                    error={errors.shipping?.city?.message}
                  />
                </div>
                <div className="col-span-1">
                  <Controller
                    name="shipping.state"
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
                        error={errors.shipping?.state?.message}
                      />
                    )}
                  />
                  {errors.shipping?.state?.message && (
                    <p className="text-xs text-red-500">
                      {errors.shipping?.state?.message}
                    </p>
                  )}
                </div>
                <div className="col-span-1">
                  <Input
                    {...register(`shipping.zip`, {
                      required: true,
                    })}
                    name="shipping.zip"
                    label="Zip code"
                    placeholder="Zip code"
                    disabled={isSubmitting}
                    error={errors.shipping?.zip?.message}
                  />
                </div>
                <div className="col-span-1">
                  <Input
                    {...register(`shipping.country`, {
                      required: true,
                    })}
                    name="shipping.country"
                    label="Country"
                    placeholder="US"
                    disabled={isSubmitting}
                    error={errors.shipping?.country?.message}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Accordion
          type="single"
          collapsible
          className="flex min-w-96 flex-col gap-2"
          value="billing"
          onClick={() =>
            accordionView === "billing"
              ? setAccordionView("shipping")
              : setAccordionView("billing")
          }
        >
          <AccordionItem value={accordionView}>
            <AccordionTrigger>
              <h2 className="text-xl font-bold ">Billing Address</h2>
            </AccordionTrigger>
            <AccordionContent className="overflow-visible">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <Input
                    {...register(`billing.addressLine1`, {
                      required: true,
                    })}
                    name="billing.addressLine1"
                    label="Address"
                    disabled={isSubmitting}
                    error={errors.billing?.addressLine1?.message}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    {...register(`billing.addressLine2`)}
                    name="billing.addressLine2"
                    label="Address 2"
                    placeholder="Apartment, suite, etc. (optional)"
                    disabled={isSubmitting}
                    error={errors.billing?.addressLine2?.message}
                  />
                </div>
                <div className="col-span-1">
                  <Input
                    {...register(`billing.city`, {
                      required: true,
                    })}
                    name="billing.city"
                    label="City"
                    placeholder="City"
                    disabled={isSubmitting}
                    error={errors.billing?.city?.message}
                  />
                </div>
                <div className="col-span-1">
                  <Controller
                    name="billing.state"
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
                        error={errors.billing?.state?.message}
                      />
                    )}
                  />
                  {errors.billing?.state?.message && (
                    <p className="text-xs text-red-500">
                      {errors.billing?.state?.message}
                    </p>
                  )}
                </div>
                <div className="col-span-1">
                  <Input
                    {...register(`billing.zip`, {
                      required: true,
                    })}
                    name="billing.zip"
                    label="Zip code"
                    placeholder="Zip code"
                    disabled={isSubmitting}
                    error={errors.billing?.zip?.message}
                  />
                </div>
                <div className="col-span-1">
                  <Input
                    {...register(`billing.country`, {
                      required: true,
                    })}
                    name="billing.country"
                    label="Country"
                    placeholder="US"
                    disabled={isSubmitting}
                    error={errors.billing?.country?.message}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="mt-5 flex justify-end">
          <Button className="w-48" loading={isSubmitting} type="submit">
            Start Order
          </Button>
        </div>
      </form>
    </div>
  );
}
