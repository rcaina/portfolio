import Badge from "@/components/common/Badge";
import React from "react";
import { RequisitionFormStatus } from "@prisma/client";
import { mapStatusToText } from "@/lib/utils";

interface Props {
  status: RequisitionFormStatus;
}

const mapStatusToColor = (status?: RequisitionFormStatus) => {
  switch (status) {
    case RequisitionFormStatus.PENDING_APPROVAL:
      return "yellow";
    case RequisitionFormStatus.APPROVED:
      return "green";
    case RequisitionFormStatus.DENIED:
      return "red";
    default:
      return "gray";
  }
};

export default function RequisitionFormStatusBadge({ status }: Props) {
  return (
    <Badge
      text={mapStatusToText[status || RequisitionFormStatus.PENDING_APPROVAL]}
      color={mapStatusToColor(status)}
    />
  );
}
