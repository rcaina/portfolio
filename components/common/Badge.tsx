import Link from "next/link";

import { cx } from "@/lib/utils";
import { HUE_OFFSET } from "@/lib/contants";

interface Props {
  text: string;
  variant?: "default" | "outline";
  gradientValue?: number;
  color?:
    | "default"
    | "yellow"
    | "green"
    | "gray"
    | "violet"
    | "blue"
    | "red"
    | "black"
    | "white"
    | "theme";
  href?: string;
}

export default function Badge({
  text,
  variant = "default",
  gradientValue = 0,
  color = "default",
  href,
}: Props) {
  const BadgeContent = (
    <span
      style={{ filter: `hue-rotate(${-gradientValue * HUE_OFFSET}deg)` }}
      className={cx(
        "inline-flex select-none items-center rounded-md px-3 py-0.5 text-sm font-medium",
        {
          "border bg-opacity-0": variant === "outline",
        },
        {
          "border border-purple-600 bg-purple-100 text-purple-600":
            color === "default",
        },
        {
          "border border-yellow-600 bg-yellow-100 text-yellow-600":
            color === "yellow",
        },
        {
          "border border-green-600 bg-green-100 text-green-600":
            color === "green",
        },
        {
          "border border-gray-600 bg-gray-100 text-gray-600 dark:bg-gray-300 dark:text-gray-500":
            color === "gray",
        },
        {
          "border border-violet-600 bg-violet-100 text-violet-600":
            color === "violet",
        },
        {
          "border border-blue-600 bg-blue-100 text-blue-600": color === "blue",
        },
        {
          "border border-red-600 bg-red-100 text-red-600": color === "red",
        },
        {
          "border border-slate-500 bg-slate-500 text-white dark:bg-white dark:text-black":
            color === "theme",
        },
        {
          "border border-slate-800 bg-slate-800 text-white": color === "black",
        },
        {
          "border border-gray-200 bg-gray-200 text-black": color === "white",
        }
      )}
    >
      {text}
    </span>
  );

  return href ? <Link href={href}>{BadgeContent}</Link> : BadgeContent;
}
