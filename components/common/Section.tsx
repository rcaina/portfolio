import { ReactNode } from "react";

interface WrapperProps {
  title?: string | ReactNode;
  subtitle?: string;
  status?: ReactNode;
  rightElement?: ReactNode;
  children: ReactNode;
  backgroundColor?: string;
}

export const Section = ({
  title,
  subtitle,
  status,
  rightElement,
  children,
  backgroundColor = "bg-primary-100",
}: WrapperProps) => {
  return (
    <>
      <div
        className={`rounded-sm border border-highlight-600 ${backgroundColor} p-6 `}
      >
        {(title || status || rightElement) && (
          <div className="mb-4 flex flex-col">
            <div className="flex flex-row justify-between">
              {(title || status) && (
                <div className="flex gap-4">
                  {title && (
                    <h2 className="mb-4 text-lg font-medium ">{title}</h2>
                  )}
                  {status && <div>{status}</div>}
                </div>
              )}
              <div>{rightElement}</div>
            </div>
            {subtitle && (
              <div className="text-foreground-accent text-sm">{subtitle}</div>
            )}
          </div>
        )}
        {children}
      </div>
    </>
  );
};
