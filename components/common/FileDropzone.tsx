import { Accept, DropEvent, FileRejection, useDropzone } from "react-dropzone";

import { cx } from "@/lib/utils";
import { toast } from "react-toastify";
import { useCallback } from "react";

interface Props {
  onDrop: (files: File[] | null) => void;
  files: File[] | null;
  label?: string;
  name?: string;
  instructionText?: string;
  accept?: Accept;
  maxFiles?: number;
  error?: string;
}

export function FileDropzone({
  onDrop,
  files,
  label,
  name,
  instructionText,
  accept,
  maxFiles = 1,
  error,
}: Props) {
  const handleDrop: <T extends File>(
    acceptedFiles: T[],
    fileRejections: FileRejection[],
    event: DropEvent
  ) => void = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onDrop(acceptedFiles);
      } else {
        onDrop(null);
        toast.error("Invalid file type");
      }
    },
    [onDrop]
  );

  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
    isDragActive,
  } = useDropzone({ onDrop: handleDrop, accept, maxFiles });

  const fileNames = Array.from(files || [])
    .map((file) => file.name)
    .join(", ");

  return (
    <div>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium">
          {label}
        </label>
      )}
      <div className="container h-32">
        <div
          {...getRootProps()}
          aria-invalid={error !== undefined ? "true" : undefined}
          className={cx(
            "flex h-full flex-col items-center justify-center rounded-md border-2 border-dashed border-neutral-500 bg-neutral-100 p-4 text-secondary-200 outline-none aria-[invalid]:border-red-300 aria-[invalid]:bg-red-50 aria-[invalid]:font-medium aria-[invalid]:text-red-500",
            { "border-primary-500": isDragActive },
            { "border-danger-500": isDragReject },
            { "border-success-500": isDragAccept },
            { "border-primary-500": isFocused }
          )}
        >
          <input
            {...getInputProps()}
            name={name}
            id={name}
            capture="environment"
          />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : files ? (
            <p className="text-secondary-600">{fileNames}</p>
          ) : (
            <p>
              {instructionText ||
                "Drag and drop your file here, or click to select a file"}
            </p>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
