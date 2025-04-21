import { ReactNode } from "react";

interface WrapperProps {
  children: ReactNode;
  className?: string;
}

export function LabelValueWrapper({ children, className }: WrapperProps) {
  return <div className={`grid gap-4  ${className}`}>{children}</div>;
}
