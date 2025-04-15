import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import { FormField } from "@/components/common/Form";
import { FileDropzone } from "@/components/common/FileDropzone";
import { mapPracticeTypeToText } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/common/Accordion";
import { AddCredentialsFormInputs } from "@/pages/register-credentials";

const practiceTypeOptions = Object.entries(mapPracticeTypeToText).map(
  ([key, value]) => ({
    label: value,
    value: key,
  })
);

interface Props {
  onSubmit: (data: AddCredentialsFormInputs) => void;
}

export default function AddCredentialsForm({ onSubmit }: Props) {
  const [accordionView, setAccordionView] = useState<string>("practionerInfo");
  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<AddCredentialsFormInputs>({
    defaultValues: {
      practiceType: "Select practitioner type",
      nationalProviderId: "",
      licenseNumber: "",
      licenseEffectiveDate: "",
      licenseExpirationDate: "",
    },
  });

  return (
    <div className="m-auto flex flex-col gap-4">
      <h1 className="mb-5 text-3xl font-bold">Complete onboarding</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Accordion
          type="single"
          collapsible
          className="flex w-full min-w-96 flex-col gap-2"
          value="practionerInfo"
        >
          <AccordionItem value={accordionView}>
            <AccordionTrigger
              onClick={() =>
                setAccordionView(
                  accordionView === "practionerInfo"
                    ? "fileUploads"
                    : "practionerInfo"
                )
              }
            >
              <h2 className="text-xl font-bold text-gray-900">
                Practitioner Information
              </h2>
            </AccordionTrigger>
            <AccordionContent className="overflow-visible">
              <div className="mb-5 grid grid-cols-2 gap-5">
                <div className="col-span-1">
                  <Controller
                    name={`practiceType`}
                    control={control}
                    rules={{
                      required: "Practitioner type must be selected.",
                      validate: (value) =>
                        value !== "Select practitioner type" ||
                        "Select a valid practitioner type.",
                    }}
                    render={({ field: { value, onChange } }) => (
                      <Select
                        label="Practitioner type"
                        data={practiceTypeOptions}
                        value={value}
                        onChange={onChange}
                        error={errors.practiceType?.message}
                      />
                    )}
                  />
                  {errors.practiceType?.message && (
                    <p className="text-xs text-red-500">
                      {errors.practiceType?.message}
                    </p>
                  )}
                </div>
                <div className="col-span-1">
                  <Input
                    {...register("nationalProviderId", {
                      required: "National Provider Identifier is required",
                      validate: (value) =>
                        value.length === 10 ||
                        "NPI must be exactly 10 digits long",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "NPI must be a numeric value of 10 digits",
                      },
                    })}
                    name="nationalProviderId"
                    label="National Provider Identifier (NPI)"
                    placeholder="NPI"
                    type="text"
                    disabled={isSubmitting}
                    error={errors.nationalProviderId?.message}
                  />
                  {errors.nationalProviderId?.message && (
                    <p className="text-xs text-red-500">
                      {errors.nationalProviderId?.message}
                    </p>
                  )}
                </div>
                <div className="col-span-1">
                  <Input
                    {...register(`licenseNumber`, {
                      required: true,
                    })}
                    name="licenseNumber"
                    label="License number"
                    disabled={isSubmitting}
                    error={errors.licenseNumber?.message}
                  />
                </div>
                <div className="col-span-1">
                  <Input
                    {...register(`licenseEffectiveDate`, {
                      required: true,
                    })}
                    name="licenseEffectiveDate"
                    label="License Effective date"
                    type="date"
                    disabled={isSubmitting}
                    error={errors.licenseEffectiveDate?.message}
                  />
                </div>
                <div className="col-span-1">
                  <Input
                    {...register(`licenseExpirationDate`, {
                      required: true,
                    })}
                    name="licenseExpirationDate"
                    label="License Expiration date"
                    type="date"
                    disabled={isSubmitting}
                    error={errors.licenseExpirationDate?.message}
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
          value="fileUploads"
        >
          <AccordionItem value={accordionView}>
            <AccordionTrigger
              onClick={() =>
                setAccordionView(
                  accordionView === "fileUploads"
                    ? "practionerInfo"
                    : "fileUploads"
                )
              }
            >
              <h2 className="text-xl font-bold text-gray-900">File Uploads</h2>
            </AccordionTrigger>
            <AccordionContent className="overflow-visible">
              <FormField
                name="medicalLicense"
                control={control}
                rules={{ required: true }}
                render={({ field, fieldState: { error } }) => (
                  <FileDropzone
                    label="Medical License"
                    error={error?.message}
                    instructionText="Drag and drop here, or click to select file"
                    accept={{
                      "application/pdf": ["pdf, png, jpeg"],
                    }}
                    name={field.name}
                    maxFiles={1}
                    files={field.value}
                    onDrop={(acceptedFiles) => {
                      field.onChange(acceptedFiles);
                    }}
                  />
                )}
              />
              <p className=" mb-2 mt-4 text-sm">Government Issued ID</p>
              <FormField
                name="governermentId"
                control={control}
                rules={{ required: true }}
                render={({ field, fieldState: { error } }) => (
                  <FileDropzone
                    error={error?.message}
                    instructionText="Drag and drop here, or click to select file"
                    accept={{
                      "application/pdf": ["pdf, png, jpeg"],
                    }}
                    name={field.name}
                    maxFiles={1}
                    files={field.value}
                    onDrop={(acceptedFiles) => {
                      field.onChange(acceptedFiles);
                    }}
                  />
                )}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-5 flex justify-end gap-4">
          <Button
            variant="outline"
            loading={isSubmitting}
            onClick={() => (window.location.href = "/")}
          >
            Skip
          </Button>
          <Button loading={isSubmitting} type="submit">
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
