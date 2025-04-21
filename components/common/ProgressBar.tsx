import React from "react";
import { cx } from "@/lib/utils";

interface Props {
  completed: number;
  segments: number;
  size?: string;
}

export default function ProgressBar({ completed, size, segments }: Props) {
  return (
    <div
      className={`flex w-full ${
        size !== "lg" && "max-w-[15rem]"
      } items-center gap-[2px] overflow-hidden rounded-full`}
    >
      {Array.from({ length: segments }, (_, i) => {
        const isCompleted = i < completed;
        return (
          <div
            key={i}
            className={cx("inline-block h-2 flex-1", {
              "bg-highlight-600": isCompleted,
              "bg-primary-500": !isCompleted,
            })}
          />
        );
      })}
    </div>
  );
}
