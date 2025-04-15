import { cva, VariantProps } from "class-variance-authority";
import React, { ButtonHTMLAttributes, forwardRef } from "react";

import { cx } from "lib/utils";
import Spinner from "./Spinner";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      size: {
        xxs: "px-1 py-1 text-2xs",
        xs: "px-2.5 py-1.5 text-xs",
        sm: "px-3 py-2 text-sm",
        md: "px-4 h-10 text-base",
        lg: "px-4 py-2 text-lg",
        xl: "px-6 py-3 text-lg",
      },
      variant: {
        primary:
          "bg-secondary-600 text-primary-500 hover:bg-highlight-200 hover:text-secondary-600 shadow-md shadow-highlight-600 hover:shadow-xl hover:shadow-highlight-600",
        secondary:
          "bg-primary-100 hover:bg-secondary-600 hover:text-primary-500 focus:ring-primary-200 border border-highlight-600 shadow-md shadow-highlight-600 hover:shadow-lg hover:shadow-highlight-600",
        outline:
          "bg-transparent border-secondary-600 border focus:ring-primary-500 hover:bg-primary-500 hover:text-white hover:bg-highlight-200 hover:border-transparent",
        white:
          "border-gray-300 bg-white hover:bg-gray-50 focus:ring-primary-500",
        danger:
          "border-transparent bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        dangerLine:
          "border-transparent hover:bg-red-600 text-red-600 border border-red-600 hover:text-red-600 focus:ring-red-500 bg-primary-500 hover:text-primary-500",
        ghost: "hover:bg-accent hover:text-accent-foreground ",
        underline: "text-highlight-600 underline hover:text-secondary-600",
        none: "focus:ring-transparent",
      },
      disabled: {
        true: "opacity-50 pointer-events-none saturate-0",
      },
      loading: {
        true: "animate-pulse pointer-events-none",
      },
    },
    compoundVariants: [
      {
        disabled: false,
        loading: false,
        class: "active:scale-95",
      },
    ],
    defaultVariants: {
      size: "md",
      variant: "primary",
    },
  }
);

interface Props
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  disabled?: boolean;
  loading?: boolean;
  Icon?: React.ReactNode;
}

export default forwardRef<HTMLButtonElement, Props>(function Button(
  {
    className,
    size = "md",
    type = "button",
    variant,
    disabled = false,
    loading = false,
    Icon,
    children,
    ...otherProps
  },
  ref
) {
  return (
    <button
      type={type}
      ref={ref}
      disabled={disabled || loading}
      className={cx(
        buttonVariants({ variant, size, loading, disabled, className })
      )}
      {...otherProps}
    >
      {(loading || Icon) && (
        <div
          className={cx(
            { "mr-1 w-2": size === "xxs" },
            { "mr-1 w-4": size === "xs" },
            { "mr-1 w-4": size === "sm" },
            { "mr-1 w-5": size === "md" },
            { "mr-2 w-6": size === "lg" },
            { "mr-2 w-6": size === "xl" }
          )}
        >
          {loading ? <Spinner /> : Icon}
        </div>
      )}

      {children}
    </button>
  );
});
