import { KitOrderStatus } from "@prisma/client";
import React from "react";

import { mapStatusToText } from "@/lib/utils";
import Badge from "@/components/common/Badge";

interface Props {
  status: KitOrderStatus;
}

const mapStatusToColor = (status?: KitOrderStatus) => {
  switch (status) {
    case KitOrderStatus.DRAFT:
      return "gray";
    case KitOrderStatus.ORDERED:
      return "theme";
    case KitOrderStatus.COMPLETED:
      return "green";
    case KitOrderStatus.CANCELED:
      return "red";
    default:
      return "gray";
  }
};

export default function KitOrderStatusBadge({ status }: Props) {
  return (
    <Badge
      text={mapStatusToText[status || KitOrderStatus.DRAFT]}
      color={mapStatusToColor(status)}
    />
  );
}
