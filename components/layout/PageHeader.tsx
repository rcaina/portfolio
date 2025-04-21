import ArrowLeftIcon from "@heroicons/react/20/solid/ArrowLeftIcon";
import Container from "@/components/layout/Container";
import { ReactNode } from "react";
import { cx } from "@/lib/utils";
import { useRouter } from "next/router";

interface Props {
  backButtonText?: string;
  backButtonHref?: string;
  title: string | ReactNode;
  description?: string | React.ReactNode;
  inContainer?: boolean;
  withOutlines?: boolean;
  RightElement?: React.ReactNode;
  showLock?: boolean;
}

export default function PageHeader({
  backButtonText,
  backButtonHref,
  title,
  description,
  inContainer = false,
  withOutlines = true,
  RightElement,
}: Props) {
  const router = useRouter();

  const Inner = () => (
    <div>
      <div
        className={cx(
          "flex w-full items-center",
          inContainer ? "py-4" : "pt-[5px]"
        )}
      >
        <div className="flex-auto">
          {backButtonHref && backButtonText && (
            <button
              onClick={() => {
                router.back();
              }}
              className="text-xs text-gray-400 hover:text-gray-500 dark:text-white"
            >
              <ArrowLeftIcon className="inline-block h-3 w-3" />
              &nbsp;{backButtonText}
            </button>
          )}
          {typeof title === "string" ? (
            <h1 className="pl-4 text-2xl dark:text-gray-200">{title}</h1>
          ) : (
            <div className="pl-4 text-2xl dark:text-gray-200">{title}</div>
          )}
          <div className="mt-2 text-sm  dark:text-gray-100">{description}</div>
        </div>
        {RightElement && <div>{RightElement}</div>}
      </div>
    </div>
  );

  return (
    <>
      <div
        className={cx("z--1 p-4", {
          "border-b border-highlight-600 bg-primary-500 p-4": withOutlines,
        })}
      >
        {inContainer ? (
          <Container>
            <Inner />
          </Container>
        ) : (
          <Inner />
        )}
      </div>
    </>
  );
}
