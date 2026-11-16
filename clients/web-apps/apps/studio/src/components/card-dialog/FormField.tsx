import { cn } from "@avplatform/ui/lib";
import { WarningCircleIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

type FormFieldProps = {
  htmlFor: string;
  label: string;
  isOptional?: boolean;
  /** Shows a character counter when both are set. */
  length?: number;
  maxLength?: number;
  error?: string | null;
  /** Shown under the input while there is no error. */
  hint?: ReactNode;
  children: ReactNode;
};

/**
 * Label, optional character counter and error message around one form input.
 */
export const FormField = ({
  htmlFor,
  label,
  isOptional = false,
  length,
  maxLength,
  error,
  hint,
  children,
}: FormFieldProps) => (
  <div>
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-[12.5px] font-semibold text-ink-2">
        {label}
        {isOptional && <span className="ml-1.5 font-normal text-muted-foreground">Optional</span>}
      </label>
      {length !== undefined && maxLength !== undefined && (
        <span
          className={cn(
            "text-[11px] tabular-nums transition-colors",
            length >= maxLength ? "font-medium text-warn" : "text-muted-foreground",
          )}
        >
          {length}/{maxLength}
        </span>
      )}
    </div>
    {children}
    {error && (
      <p id={`${htmlFor}-error`} className="flex items-center gap-1.5 pt-1.5 text-[12px] text-bad">
        <WarningCircleIcon className="size-3.5 shrink-0" />
        {error}
      </p>
    )}
    {!error && hint}
  </div>
);
