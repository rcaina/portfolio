import { useRouter } from "next/router";
import { toast } from "react-toastify";

import ServiceTypeAForm, {
  ServiceTypeAFormInputs,
} from "@/components/forms/ServiceTypeForms/ServiceTypeAForm";
import { useState } from "react";

interface Props {
  answers?: {
    [key: string]: string;
  } | null;
  serviceRequestId?: string;
}

const ServiceTypeQuestionnaireADisplay = ({
  serviceRequestId,
  answers,
}: Props) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmitFormA = (data: ServiceTypeAFormInputs) => {
    setIsSubmitting(true);
    fetch(`/api/clinical/service/order/${serviceRequestId}/questionnaire`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(async (response) => {
        if (response.ok) {
          toast.success("Questinare saved successfully");
          return response.json();
        } else {
          const res = await response.json();
          toast.error(res.error ?? "An error occurred saving the Questinare");
        }
      })
      .then((data) => {
        router.push(`/clinical/service/order/${data.id}/kit`);
      })
      .catch((error) => {
        console.error("Error saving Questinare:", error);
        throw new Error("Error saving Questinare");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const continueWithoutChange = () => {
    router.push(`/clinical/service/order/${serviceRequestId}/kit`);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <ServiceTypeAForm
        onSubmit={onSubmitFormA}
        answers={answers}
        continueWithoutChange={continueWithoutChange}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default ServiceTypeQuestionnaireADisplay;
