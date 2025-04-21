import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import {
  Dispatch,
  Fragment,
  MouseEvent,
  ReactNode,
  SetStateAction,
} from "react";

export interface ModalProps {
  size?: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  children: ReactNode;
  title: string | React.ReactElement;
  subtitle?: string | ReactNode;
  bottomGradient?: boolean;
  disableCloseButton?: boolean;
  onClose?: () => void;
  afterEnter?: () => void;
  afterLeave?: () => void;
  beforeEnter?: () => void;
  beforeLeave?: () => void;
}

export default function Modal({
  size,
  open,
  setOpen,
  title,
  subtitle,
  children,
  bottomGradient = false,
  onClose,
  afterEnter,
  afterLeave,
  beforeEnter,
  beforeLeave,
  disableCloseButton = false,
  ...otherProps
}: ModalProps) {
  let screenClassName = `w-full transform bg-primary-500 text-left mdshadow-xl transition-all sm:my-8 sm:max-w-screen-md sm:rounded-md`;

  if (size === "sm") {
    screenClassName = `w-full transform bg-primary-500 text-left mdshadow-xl transition-all sm:my-8 sm:max-w-screen-sm sm:rounded-md`;
  } else if (size === "lg") {
    screenClassName = `w-full transform bg-primary-500 text-left mdshadow-xl transition-all sm:my-8 sm:max-w-screen-lg sm:rounded-md`;
  } else if (size === "xl") {
    screenClassName = `w-full transform bg-primary-500 text-left mdshadow-xl transition-all sm:my-8 sm:max-w-screen-2xl sm:rounded-md`;
  }

  return (
    <Transition.Root
      show={open}
      as={Fragment}
      afterEnter={afterEnter}
      afterLeave={afterLeave}
      beforeEnter={beforeEnter}
      beforeLeave={beforeLeave}
      {...otherProps}
    >
      <Dialog
        as="div"
        className="relative z-30 "
        onClose={onClose || setOpen}
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-0 text-center sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className={screenClassName}>
                <div className="h-2 rounded-t-md bg-gradient-to-r from-highlight-600 to-secondary-600" />

                <div className="p-10 ">
                  {title && (
                    <Dialog.Title as="div" className="mb-12">
                      <h2 className="text-2xl leading-6">{title}</h2>
                      {subtitle && (
                        <div className="my-2">
                          {typeof subtitle === "string" ? (
                            <p className="text-sm font-medium text-gray-600">
                              {subtitle}
                            </p>
                          ) : (
                            subtitle
                          )}
                        </div>
                      )}
                    </Dialog.Title>
                  )}
                  <button
                    hidden={disableCloseButton}
                    className="absolute right-4 top-4"
                    onClick={() => setOpen(false)}
                  >
                    <XMarkIcon className="h-8 w-8 text-gray-500" />
                  </button>
                  {children}
                </div>
                {bottomGradient && (
                  <div className="h-4 bg-gradient-to-r from-pink-700 to-violet-700" />
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
