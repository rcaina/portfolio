import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

export enum S3ResourceType {
  REQUISITION_FORM = "requisitionForms",
  RESULTS = "results",
}

export const mapResourceTypeToIdentifier = {
  [S3ResourceType.RESULTS]: "resultsS3Key",
  [S3ResourceType.REQUISITION_FORM]: "requisitionS3Key",
};

export const handleGetFromS3 = (
  resource: S3ResourceType,
  resourceId: string
) => {
  const params = new URLSearchParams({
    [mapResourceTypeToIdentifier[resource]]: resourceId,
  });
  fetch(`/api/s3/presigned/${resource}?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to access resource");
      }
    })
    .then((responseJson) => {
      window.open(responseJson.url, "_blank");
    })
    .catch((err) => {
      toast.error("Failed to access resource");
      console.error(err);
    });
};

export const S3Link = ({
  resourceType,
  resourceIdentifier,
  text,
  allowedToView,
  children,
}: {
  resourceType: S3ResourceType;
  resourceIdentifier?: string;
  text?: string;
  allowedToView: boolean;
  children?: React.ReactNode;
}) => {
  return allowedToView && resourceIdentifier ? (
    <div
      onClick={(event) => {
        event.stopPropagation();
        handleGetFromS3(resourceType, resourceIdentifier);
      }}
      className="cursor-pointer"
    >
      {children ? (
        children
      ) : (
        <span className="text-md hover: flex items-center text-highlight-600 underline">
          {text}
          <ArrowTopRightOnSquareIcon className="ml-1 inline-block w-3" />
        </span>
      )}
    </div>
  ) : (
    <>--</>
  );
};
