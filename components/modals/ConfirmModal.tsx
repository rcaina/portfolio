import { ReactNode, useEffect, useState } from "react";

import Modal, { ModalProps } from "@/components/common/Modal";
import { TrashIcon } from "@heroicons/react/20/solid";
import Button from "../common/Button";

interface Props extends Omit<ModalProps, "children" | "title"> {
  title?: string;
  text?: string | ReactNode;
  checkboxLabelText?: string;
  confirmText?: string;
  onConfirm?: () => Promise<void> | void;
  danger?: boolean;
  afterLeave?: () => void;
  children?: ReactNode;
  disableButton?: boolean;
}

export default function ConfirmModal({
  title,
  text,
  checkboxLabelText,
  open,
  children,
  confirmText,
  danger,
  disableButton,
  setOpen,
  onConfirm,
  afterLeave,
  ...otherProps
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyChecked, setIsVerifyChecked] = useState(!checkboxLabelText);

  useEffect(() => {
    setIsVerifyChecked(!checkboxLabelText);
  }, [checkboxLabelText]);
  return (
    <Modal
      open={open}
      setOpen={setOpen}
      title={title || "Confirm"}
      afterLeave={() => {
        setIsVerifyChecked(!checkboxLabelText);
        afterLeave?.();
      }}
      {...otherProps}
    >
      <div className="flex h-full min-h-[100px] w-full flex-col">
        {text && <p className="text-lg dark:text-primary-300">{text}</p>}
        <div className="grow ">{children}</div>
        <div className="mt-4 flex w-full content-end items-center gap-4 ">
          <div className="mr-auto flex items-center gap-2">
            {checkboxLabelText && (
              <div className="space-x-2">
                <input
                  id="verifiedConfirmModalCheckbox"
                  type="checkbox"
                  checked={isVerifyChecked}
                  onChange={() => setIsVerifyChecked(!isVerifyChecked)}
                  className="rounded border-secondary-600 text-highlight-600 focus:ring-highlight-500 dark:text-highlight-600 dark:focus:ring"
                />
                <label
                  className="text-sm text-gray-700 dark:text-primary-300"
                  htmlFor="verifiedConfirmModalCheckbox"
                >
                  {checkboxLabelText}
                </label>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            disabled={isSubmitting}
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant={danger ? "danger" : undefined}
            disabled={!isVerifyChecked || isSubmitting || disableButton}
            onClick={async () => {
              setIsSubmitting(true);
              await onConfirm?.();
              setOpen(false);
              setIsSubmitting(false);
            }}
            Icon={
              confirmText === "Archive" || confirmText === "Delete" ? (
                <TrashIcon />
              ) : undefined
            }
          >
            {confirmText ? confirmText : "Confirm"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
