import Modal, { ModalProps } from "@/components/common/Modal";

import Button from "../common/Button";
import ProgressBar from "../common/ProgressBar";
import Spinner from "../common/Spinner";
import { getS3Docs } from "@/lib/utils";
import { useState } from "react";

interface Props extends Pick<ModalProps, "open" | "setOpen"> {
  selectedIds: string[];
  reportsOnly: boolean;
}

function isShowSaveFilePickerSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.showSaveFilePicker === "function"
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0B";

  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const formattedValue = (bytes / Math.pow(1024, i)).toFixed(2);

  return `${formattedValue}${sizes[i]}`;
}

export default function DataDownloadModal({
  open,
  setOpen,
  selectedIds,
  reportsOnly,
}: Props) {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completeStatus, setCompleteStatus] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [currentBytes, setCurrentBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);

  async function startDownload() {
    if (!isShowSaveFilePickerSupported()) {
      await getS3Docs(selectedIds, reportsOnly, false);
      setDownloadProgress(selectedIds.length);
    } else {
      setDownloadStarted(true);
      setCompleteStatus(true);
      setIsCompleted(false);
      const complete = await getS3Docs(
        selectedIds,
        reportsOnly,
        true,
        setDownloadProgress,
        setCurrentBytes,
        setTotalBytes
      );
      setIsCompleted(true);
      setCompleteStatus(complete);
    }
  }

  return (
    <Modal open={open} setOpen={setOpen} title={"Download Data"}>
      {
        <p className="text-lg dark:text-primary-300">{`Download results for ${selectedIds.length} Specimen?`}</p>
      }
      {!isShowSaveFilePickerSupported() && !reportsOnly && (
        <p className="text-red-500">
          Warning: downloading data is optimized on updated versions of Google
          Chrome. Please use an updated version of Google Chrome if possible. If
          that is not possible, downloading more that 5 files as a time is not
          recommended.
        </p>
      )}
      {downloadStarted && !reportsOnly && (
        <div className="m-5 flex w-full flex-col items-center justify-center space-y-5">
          <ProgressBar
            completed={downloadProgress}
            segments={selectedIds.length}
            size={"lg"}
          />
          {isCompleted ? (
            <p
              className={`${
                completeStatus ? "text-green-500" : "text-red-500"
              }`}
            >
              {completeStatus ? "Complete!" : "An Error Occured."}
            </p>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-lg dark:text-primary-300">
                {`${downloadProgress} of ${selectedIds.length} samples downloaded`}
              </p>
              <p className="flex items-center gap-4 text-lg dark:text-primary-300">
                <Spinner className="h-5 w-5" />
                {`Current File Progress: ${formatBytes(
                  currentBytes
                )} of ${formatBytes(totalBytes)}`}
              </p>
            </div>
          )}
        </div>
      )}
      {downloadProgress !== selectedIds.length ? (
        <div className="m-5 flex justify-end gap-4">
          <Button onClick={() => setOpen(false)} variant={"dangerLine"}>
            Cancel
          </Button>
          <Button
            onClick={startDownload}
            disabled={downloadStarted && completeStatus}
          >
            Start Download
          </Button>
        </div>
      ) : (
        <div className="m-5 flex justify-end gap-4">
          <Button onClick={() => setOpen(false)}>Exit</Button>
        </div>
      )}
    </Modal>
  );
}
