import Badge from "@/components/common/Badge";
import React from "react";

interface Props {
  status: string;
}

const mapStatusToColor = (status?: string) => {
  switch (status) {
    case "true":
      return "green";
    case "false":
      return "gray";
    default:
      return "yellow";
  }
};

export default function ProjectStatusBadge({ status }: Props) {
  return (
    <Badge
      text={status === "true" ? "ACTIVE" : "INACTIVE"}
      color={mapStatusToColor(status)}
    />
  );
}
