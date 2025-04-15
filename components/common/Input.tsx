import {
  ChangeEvent,
  ElementType,
  forwardRef,
  HTMLInputTypeAttribute,
  InputHTMLAttributes,
} from "react";

import { cx } from "lib/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (value: ChangeEvent<HTMLInputElement>) => void;
  Icon?: ElementType;
}

export default forwardRef<HTMLInputElement, Props>(function Input(
  {
    name,
    label,
    type,
    placeholder,
    error,
    disabled,
    onChange: onChangeFromProps,
    value: valueFromProps,
    Icon,
    ...rest
  },
  ref
) {
  const isControlled = typeof valueFromProps != "undefined";

  const value = isControlled ? valueFromProps : undefined;

  const onChange = onChangeFromProps
    ? (e: ChangeEvent<HTMLInputElement>) => {
        onChangeFromProps(e);
      }
    : undefined;

  return (
    <div>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium ">
          {label}
        </label>
      )}
      <div className="relative w-full">
        {Icon && (
          <div
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
            aria-hidden="true"
          >
            <Icon className="mr-3 h-4 w-4 text-gray-400" aria-hidden="true" />
          </div>
        )}
        <input
          type={type ?? "text"}
          name={name}
          placeholder={
            placeholder ?? (label ? `Enter ${label?.toLowerCase()}` : undefined)
          }
          value={value}
          onChange={onChange}
          disabled={disabled}
          ref={ref}
          aria-invalid={error !== undefined ? "true" : undefined}
          className={cx(
            "block h-10 w-full rounded-md border-highlight-200 shadow-sm focus:border-primary-500 focus:ring-highlight-600 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 disabled:opacity-70 aria-[invalid]:border-red-300 aria-[invalid]:text-red-500 aria-[invalid]:placeholder-red-500 aria-[invalid]:focus:border-red-300 aria-[invalid]:focus:ring-red-500 sm:text-sm",
            { "pl-9": Icon }
          )}
          {...rest}
        />
      </div>
    </div>
  );
});
