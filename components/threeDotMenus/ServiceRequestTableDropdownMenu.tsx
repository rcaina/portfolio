import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../common/DropdownMenu";

import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { GetServiceRequestResponse } from "@/pages/api/clinical/service/order";
import { isEmpty } from "lodash-es";
import { useRouter } from "next/router";

export const ServiceRequestTableDropdownMenu = ({
  serviceRequest,
}: {
  serviceRequest: GetServiceRequestResponse["services"][number];
  mutate: () => Promise<void>;
}) => {
  const router = useRouter();

  const onCompleteServiceRequest = async () => {
    if (serviceRequest.order?.reqFormS3Key) {
      router.push(`/clinical/service/order/${serviceRequest.id}`);
    } else if (serviceRequest.practitionerId) {
      router.push(`/clinical/service/order/${serviceRequest.id}/upload`);
    } else if (!isEmpty(serviceRequest.specimen)) {
      router.push(`/clinical/service/order/${serviceRequest.id}/practitioner`);
    } else if (serviceRequest.questionnaire) {
      router.push(`/clinical/service/order/${serviceRequest.id}/kit`);
    } else if (serviceRequest.patientId) {
      router.push(
        `/clinical/service/order/${serviceRequest.id}/questions/${serviceRequest.serviceTypeId}`
      );
    } else {
      router.push(`/clinical/service/order/${serviceRequest.id}/patient`);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <EllipsisVerticalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {serviceRequest.specimen[0]?.status === "DRAFT" && (
            <DropdownMenuItem
              id={serviceRequest.id}
              onClick={(e) => {
                e.stopPropagation();
                onCompleteServiceRequest();
              }}
            >
              Complete Service Request
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
