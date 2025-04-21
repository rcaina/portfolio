import { ReactNode } from "react";

interface WrapperProps {
  children: ReactNode;
  className?: string;
}

export function BoxLabelWrapper({ children, className }: WrapperProps) {
  return (
    <div
      className={`grid auto-cols-auto gap-4 sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] ${className}`}
    >
      {children}
    </div>
  );
}
