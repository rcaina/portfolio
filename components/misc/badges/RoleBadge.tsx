import { Role } from "@prisma/client";
import React from "react";

import { mapStatusToText } from "@/lib/utils";
import Badge from "@/components/common/Badge";

interface Props {
  status: Role;
}

const mapStatusToColor = (status?: Role) => {
  switch (status) {
    case Role.PRACTITIONER:
      return "violet";
    case Role.STAFF:
      return "blue";
    case Role.BILLING_MANAGER:
      return "green";
    case Role.ADMIN:
      return "theme";
    case Role.RESEARCHER:
      return "blue";
    case Role.DATA_ANALYST:
      return "violet";
    case Role.PROJECT_MANAGER:
      return "yellow";
    default:
      return "gray";
  }
};

export default function RoleBadge({ status }: Props) {
  return (
    <Badge
      text={mapStatusToText[status || Role.STAFF]}
      color={mapStatusToColor(status)}
    />
  );
}
