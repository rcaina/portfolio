import { ReactNode } from "react";

interface Props {
  label: string;
  value: string | ReactNode;
}

export default function BoxLabelDisplay({ label, value }: Props) {
  return (
    <div className="grid grid-cols-1 items-center gap-4 rounded-sm border border-secondary-300 bg-primary-200 p-4">
      <p className="col-span-2 h-6 self-start text-sm font-medium leading-6 dark:text-gray-200">
        {label}
      </p>
      {typeof value === "string" ? (
        <p className="text-md col-span-3 text-lg dark:text-gray-200">{value}</p>
      ) : (
        <div className="col-span-3  dark:text-gray-200">{value}</div>
      )}
    </div>
  );
}
