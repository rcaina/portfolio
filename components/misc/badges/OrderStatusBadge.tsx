import Badge from "@/components/common/Badge";
import React from "react";

interface Props {
  status: string;
}

const mapStatusToColor = (status?: string) => {
  switch (status) {
    case "DRAFT":
      return "gray";
    case "IN_PROGRESS":
      return "violet";
    case "COMPLETED":
      return "green";
    default:
      return "yellow";
  }
};

export default function OrderStatusBadge({ status }: Props) {
  return <Badge text={status || "DRAFT"} color={mapStatusToColor(status)} />;
}
