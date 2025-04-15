import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/common/Accordion";
import { Controller, useForm } from "react-hook-form";
import { StatesInAmerica, mapPracticeTypeToText } from "@/lib/utils";

import Button from "@/components/common/Button";
import { FileDropzone } from "@/components/common/FileDropzone";
import { FinishPractitionerSignUpFormInputs } from "@/pages/clinic-sign-up";
import Input from "@/components/common/Input";
import { Role } from "@prisma/client";
import Select from "@/components/common/Select";
import { toast } from "react-toastify";
import { useState } from "react";

const practiceTypeOptions = Object.entries(mapPracticeTypeToText).map(
  ([key, value]) => ({
    label: value,
    value: key,
  })
);

interface Props {
  role: Role;
  onSubmit: (data: FinishPractitionerSignUpFormInputs) => void;
}

export default function FinishPractitionerSignUpForm({
  role,
  onSubmit,
}: Props) {
  const [accordionView, setAccordionView] = useState(
    role === Role.PRACTITIONER ? "generalInfo" : "clinicAddress"
  );
  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<FinishPractitionerSignUpFormInputs>({
    defaultValues: {
      practiceType: "Select practitioner type",
      nationalProviderId: "",
      licenseNumber: "",
      licenseEffectiveDate: "",
      licenseExpirationDate: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "Select a state",
      zip: "",
      country: "US",
      medicalLicense: undefined,
      governermentId: undefined,
    },
  });

  const handleFormSubmit = (data: FinishPractitionerSignUpFormInputs) => {
    onSubmit(data);
  };

  const handleFormError = () => {
    if (
      errors.practiceType ||
      errors.nationalProviderId ||
      errors.licenseNumber ||
      errors.licenseEffectiveDate ||
      errors.licenseExpirationDate
    ) {
      toast.error("Missing fields in General Information Section.");
      setAccordionView("generalInfo");
    } else if (
      errors.addressLine1 ||
      errors.city ||
      errors.state ||
      errors.zip ||
      errors.country
    ) {
      toast.error("Missing fields in Clinic Address Section.");
      setAccordionView("clinicAddress");
    } else if (errors.medicalLicense || errors.governermentId) {
      setAccordionView("fileUploads");
    }
  };

  return (
    <div className="m-auto flex flex-col gap-4">
      <h1 className="mb-5 text-3xl font-bold">Complete onboarding</h1>
      <form onSubmit={handleSubmit(handleFormSubmit, handleFormError)}>
        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-2">
            <Input
              {...register(`name`, {
                required: true,
              })}
              name="name"
              label="Clinic Name"
              disabled={isSubmitting}
              error={errors.name?.message}
            />
          </div>
        </div>
        {role === Role.PRACTITIONER && (
          <Accordion
            type="single"
            collapsible
            className="flex w-full min-w-96 flex-col gap-2"
            value="generalInfo"
            onClick={() => setAccordionView("generalInfo")}
          >
            <AccordionItem value={accordionView}>
              <AccordionTrigger>
                <h2 className="text-xl font-bold">General Information</h2>
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
        )}
        <Accordion
          type="single"
          collapsible
          className="flex min-w-96 flex-col gap-2"
          value="clinicAddress"
          onClick={() => setAccordionView("clinicAddress")}
        >
          <AccordionItem value={accordionView}>
            <AccordionTrigger>
              <h2 className="text-xl font-bold">Clinic Address</h2>
            </AccordionTrigger>
            <AccordionContent className="overflow-visible">
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
        {role === Role.PRACTITIONER && (
          <Accordion
            type="single"
            collapsible
            className="flex min-w-96 flex-col gap-2"
            value="fileUploads"
            onClick={() => setAccordionView("fileUploads")}
          >
            <AccordionItem value={accordionView}>
              <AccordionTrigger>
                <h2 className="text-xl font-bold">File Uploads</h2>
              </AccordionTrigger>
              <AccordionContent className="overflow-visible">
                <p className="mb-2 text-sm">Medical license</p>
                <Controller
                  name="medicalLicense"
                  control={control}
                  rules={{
                    required: "Medical license is required.",
                    validate: (value) =>
                      (value && value.length > 0) ||
                      "Please upload a medical license.",
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <FileDropzone
                      error={error?.message}
                      instructionText="Drag and drop here, or click to select file"
                      accept={{
                        "application/pdf": [],
                      }}
                      maxFiles={10}
                      files={field.value}
                      onDrop={(acceptedFiles) => {
                        field.onChange(acceptedFiles); // Update form state with the files
                      }}
                    />
                  )}
                />
                {errors?.medicalLicense?.message && (
                  <p className="text-xs text-red-500">
                    {errors?.medicalLicense?.message}
                  </p>
                )}
                <p className=" mb-2 mt-4 text-sm">Government Issued ID</p>
                <Controller
                  name="governermentId"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <FileDropzone
                      error={error?.message}
                      instructionText="Drag and drop here, or click to select file"
                      accept={{
                        "application/pdf": [],
                      }}
                      name={field.name}
                      maxFiles={1}
                      files={field.value}
                      onDrop={(acceptedFiles) => {
                        field.onChange(acceptedFiles); // Update form state with the files
                      }}
                    />
                  )}
                />
                {errors?.governermentId?.message && (
                  <p className="text-xs text-red-500">
                    {errors?.governermentId?.message}
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        <div className="mt-5 flex justify-end">
          <Button className="w-48" loading={isSubmitting} type="submit">
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
