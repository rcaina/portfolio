import { S3Link, S3ResourceType } from "@/components/misc/S3Link";

import Button from "../../common/Button";
import { FileDropzone } from "@/components/common/FileDropzone";
import { FormField } from "@/components/common/Form";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const ServiceRequestRequisitionFileUploadSchema = z.object({
  requisitionForm: z.custom<File[]>(),
  verifySignedForm: z.boolean().refine((val) => val === true, {
    message: "Form must be signed by practitioner.",
  }),
});

export type ServiceRequestRequisitionFileUploadFormInputs = z.infer<
  typeof ServiceRequestRequisitionFileUploadSchema
>;

interface Props {
  onSubmit: (data: ServiceRequestRequisitionFileUploadFormInputs) => void;
  continueWithoutUpload: () => void;
  serviceRequest: { id: string } & {
    order: {
      reqFormS3Key: string;
    };
  };
  isSubmitting: boolean;
}

const RequisitionFileUploadForm: React.FC<Props> = ({
  onSubmit,
  continueWithoutUpload,
  serviceRequest,
  isSubmitting,
}) => {
  const {
    handleSubmit,
    control,
    register,
    watch,
    formState: { errors },
  } = useForm<ServiceRequestRequisitionFileUploadFormInputs>({
    defaultValues: {
      requisitionForm: undefined,
      verifySignedForm: false,
    },
  });

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full max-w-2xl flex-col gap-8 rounded-md bg-white p-8 shadow-lg"
      >
        {serviceRequest.order.reqFormS3Key && (
          <div className="flex gap-4 text-primary-600">
            <p className="text-sm">Currently Uploaded: </p>
            <S3Link
              resourceIdentifier={serviceRequest.order.reqFormS3Key}
              resourceType={S3ResourceType.REQUISITION_FORM}
              allowedToView={true}
              text={"View Uploaded Requisition Form"}
            />
          </div>
        )}
        <FormField
          name="requisitionForm"
          control={control}
          rules={{ required: true }}
          render={({ field, fieldState: { error } }) => (
            <FileDropzone
              label="Requisition Form"
              error={error?.message}
              instructionText="Drag and drop here, or click to select file"
              accept={{
                "application/pdf": ["pdf", "png", "jpeg"],
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
        {errors.requisitionForm && <p>{errors.requisitionForm.message}</p>}
        <div className="flex justify-between gap-4">
          <div className="flex flex-row items-end gap-2">
            <input
              id="verifySignedForm"
              type="checkbox"
              className="rounded border-gray-300 text-highlight-600 focus:ring-highlight-600"
              {...register("verifySignedForm")}
            />
            <label
              className="text-sm text-secondary-500"
              htmlFor="verifySignedForm"
            >
              Verify form signed by the practitioner.
            </label>
          </div>
          <div className="flex gap-4">
            {serviceRequest.order.reqFormS3Key && (
              <Button
                variant="outline"
                onClick={continueWithoutUpload}
                disabled={isSubmitting}
              >
                Continue
              </Button>
            )}
            <Button
              variant="primary"
              type="submit"
              disabled={!watch("verifySignedForm") || isSubmitting}
              loading={isSubmitting}
            >
              Upload & Continue
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RequisitionFileUploadForm;
