import React from "react";

import { mapStatusToText } from "@/lib/utils";
import Badge from "@/components/common/Badge";
import { LicenseStatus } from "@prisma/client";

interface Props {
  status: LicenseStatus | null;
}

const mapStatusToColor = (status?: LicenseStatus) => {
  switch (status) {
    case LicenseStatus.ACTIVE:
      return "green";
    case LicenseStatus.PENDING_APPROVAL:
      return "yellow";
    case LicenseStatus.REJECTED:
      return "red";
    case LicenseStatus.EXPIRED:
      return "red";
    default:
      return "gray";
  }
};

export default function LicenseStatusBadge({ status }: Props) {
  return (
    <Badge
      text={status ? mapStatusToText[status] : "Not Submitted"}
      color={status ? mapStatusToColor(status) : "gray"}
    />
  );
}
