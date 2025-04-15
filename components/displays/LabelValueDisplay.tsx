import { ReactNode } from "react";

interface Props {
  label: string;
  value: string | ReactNode;
}

export default function LabelValueDisplay({ label, value }: Props) {
  return (
    <div className="grid grid-cols-[1fr,2fr] gap-2 border-b border-secondary-200 pb-2">
      <p className="text-sm font-medium leading-6 dark:text-gray-200">
        {label}
      </p>
      <div className="text-md font-normal dark:text-gray-200">{value}</div>
    </div>
  );
}
