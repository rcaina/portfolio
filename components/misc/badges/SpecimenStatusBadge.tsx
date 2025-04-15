import Badge from "@/components/common/Badge";
import React from "react";

interface Props {
  status: string;
}

const mapStatusToColor = (status?: string) => {
  switch (status) {
    case "DRAFT":
      return "gray";
    case "ORDERED":
      return "blue";
    case "IN_PROGRESS":
      return "violet";
    case "COMPLETED":
      return "green";
    default:
      return "yellow";
  }
};

export default function SpecimenStatusBadge({ status }: Props) {
  return <Badge text={status} color={mapStatusToColor(status)} />;
}
