import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../common/Accordion";
import { Address, Employee } from "@prisma/client";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { BillingInformationFormInputs } from "@/pages/billing-info";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import Select from "@/components/common/Select";
import { StatesInAmerica } from "@/lib/utils";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface Props {
  onSubmit: (data: BillingInformationFormInputs) => void;
  user: Employee & {
    accounts: {
      organization: { addresses: Address[] };
    }[];
  };
}

export default function BillingInformationForm({ onSubmit, user }: Props) {
  const [accordionView, setAccordionView] = useState("generalInfo");
  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<BillingInformationFormInputs>({
    defaultValues: {
      billingEmails: [user.email],
      label: user.accounts[0].organization.addresses[0]?.label,
      addressLine1: user.accounts[0].organization.addresses[0]?.addressLine1,
      addressLine2:
        user.accounts[0].organization.addresses[0]?.addressLine2 ?? "",
      city: user.accounts[0].organization.addresses[0]?.city,
      state: user.accounts[0].organization.addresses[0]?.state,
      zip: user.accounts[0].organization.addresses[0]?.zip,
      country: user.accounts[0].organization.addresses[0]?.country,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    name: "billingEmails",
  });

  return (
    <div className="m-auto flex flex-col gap-4">
      <h1 className="mb-5 text-4xl font-bold ">Billing Information</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Accordion
          type="single"
          collapsible
          className="flex w-full min-w-96 flex-col gap-2"
          value="generalInfo"
          onClick={() => setAccordionView("generalInfo")}
        >
          <AccordionItem value={accordionView}>
            <AccordionTrigger>
              <div className="flex flex-col items-start">
                <h2 className="text-xl font-bold ">Billing Emails</h2>
              </div>
            </AccordionTrigger>
            <h2 className="mb-4 text-sm  no-underline">
              Emails for invoices and receipts to be sent to.
            </h2>
            <AccordionContent className="overflow-visible">
              <div className="mb-5 flex flex-col gap-5">
                {fields.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex-grow">
                      <Input
                        {...register(`billingEmails.${index}`)}
                        placeholder="Enter email"
                        label="Email"
                        type="email"
                        disabled={isSubmitting}
                        error={errors.billingEmails?.[index]?.message}
                      />
                    </div>
                    <div className="self-end">
                      <Button
                        Icon={<TrashIcon className="hover:text-red-500" />}
                        variant="white"
                        type="button"
                        onClick={() => remove(index)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-start">
                <Button
                  Icon={<PlusCircleIcon />}
                  className="hover:bg-white hover:text-primary-600"
                  variant="white"
                  type="button"
                  onClick={() => append("")}
                >
                  Add Email
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Accordion
          type="single"
          collapsible
          className="flex min-w-96 flex-col gap-2"
          value="billingAddress"
          onClick={() => setAccordionView("billingAddress")}
        >
          <AccordionItem value={accordionView}>
            <AccordionTrigger>
              <h2 className="text-xl font-bold ">Billing Address</h2>
            </AccordionTrigger>
            <AccordionContent className="overflow-visible">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <Input
                    {...register(`label`, {
                      required: true,
                    })}
                    name="label"
                    label="Label"
                    disabled={isSubmitting}
                    error={errors.label?.message}
                  />
                </div>
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
                    <p className="text-xs text-red-500">
                      {errors.state?.message}
                    </p>
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="mt-5 flex justify-end">
          <Button className="w-48" loading={isSubmitting} type="submit">
            Complete
          </Button>
        </div>
      </form>
    </div>
  );
}
