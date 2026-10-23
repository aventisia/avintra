import * as React from "react";

import { cn } from "./cn.util";
import { type IconInput, KitIcon } from "./icons";

const CONTROL =
  "w-full rounded-md border border-input bg-card px-3 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20";

type FieldChrome = {
  label: string;
  hideLabel?: boolean;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  className?: string;
};

const Field = ({
  id,
  label,
  hideLabel,
  hint,
  error,
  required,
  className,
  children,
}: FieldChrome & { id: string; children: React.ReactNode }) => (
  <div className={cn("space-y-1.5", className)}>
    <label
      htmlFor={id}
      className={hideLabel ? "sr-only" : "block text-sm font-medium text-foreground"}
    >
      {label}
      {required && (
        <span aria-hidden className="ml-0.5 text-destructive">
          *
        </span>
      )}
    </label>
    {children}
    {error ? (
      <p id={`${id}-error`} className="text-xs text-destructive">
        {error}
      </p>
    ) : (
      hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )
    )}
  </div>
);

const describedBy = (id: string, hint?: React.ReactNode, error?: React.ReactNode) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;

/** Props for {@link Input}. */
export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> &
  FieldChrome & { icon?: IconInput; inputClassName?: string };

/** Labelled text input with optional leading icon, hint, and error. */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, hideLabel, hint, error, required, className, icon, inputClassName, id, ...props },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    return (
      <Field
        id={inputId}
        label={label}
        hideLabel={hideLabel}
        hint={hint}
        error={error}
        required={required}
        className={className}
      >
        <div className="relative">
          {icon && (
            <KitIcon
              icon={icon}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
            />
          )}
          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(inputId, hint, error)}
            className={cn(CONTROL, "h-9", icon && "pl-9", inputClassName)}
            {...props}
          />
        </div>
      </Field>
    );
  },
);
Input.displayName = "Input";

/** Labelled multi-line text input. */
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & FieldChrome
>(({ label, hideLabel, hint, error, required, className, id, rows = 4, ...props }, ref) => {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  return (
    <Field
      id={inputId}
      label={label}
      hideLabel={hideLabel}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, hint, error)}
        className={cn(CONTROL, "min-h-20 py-2")}
        {...props}
      />
    </Field>
  );
});
Textarea.displayName = "Textarea";

/** One option of a Select, RadioGroup, or Segmented control. */
export type Option = string | { value: string; label: React.ReactNode; disabled?: boolean };

const normalizeOption = (option: Option) =>
  typeof option === "string" ? { value: option, label: option, disabled: false } : option;

/** Labelled native select; `onValueChange` receives the chosen value. */
export const Select = ({
  label,
  hideLabel,
  hint,
  error,
  required,
  className,
  options,
  value,
  defaultValue,
  placeholder,
  onValueChange,
  disabled,
  id,
}: FieldChrome & {
  options: Option[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  id?: string;
}) => {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;
  return (
    <Field
      id={selectId}
      label={label}
      hideLabel={hideLabel}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <div className="relative">
        <select
          id={selectId}
          value={value}
          defaultValue={
            value === undefined ? (defaultValue ?? (placeholder ? "" : undefined)) : undefined
          }
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(selectId, hint, error)}
          onChange={(event) => onValueChange?.(event.target.value)}
          className={cn(CONTROL, "h-9 cursor-pointer appearance-none pr-9")}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(normalizeOption).map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {typeof option.label === "string" ? option.label : option.value}
            </option>
          ))}
        </select>
        <KitIcon
          icon="ChevronDown"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    </Field>
  );
};

/** Labelled checkbox with optional description. */
export const Checkbox = ({
  label,
  description,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  className,
  id,
}: {
  label: React.ReactNode;
  description?: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}) => {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={(event) => onCheckedChange?.(event.target.checked)}
        className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-input accent-primary disabled:cursor-not-allowed"
      />
      <label htmlFor={inputId} className="cursor-pointer space-y-0.5 text-sm">
        <span className="block font-medium text-foreground">{label}</span>
        {description && <span className="block text-xs text-muted-foreground">{description}</span>}
      </label>
    </div>
  );
};

/** Labelled on/off toggle. */
export const Switch = ({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  className,
}: {
  label: string;
  description?: React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}) => {
  const labelId = React.useId();
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <span className="space-y-0.5">
        <span id={labelId} className="block text-sm font-medium text-foreground">
          {label}
        </span>
        {description && <span className="block text-xs text-muted-foreground">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-primary" : "bg-input",
        )}
      >
        <span
          className={cn(
            "inline-block size-4 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-4.5" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
};

/** Labelled group of radio buttons. */
export const RadioGroup = ({
  label,
  options,
  value,
  onValueChange,
  orientation = "vertical",
  className,
}: {
  label: string;
  options: Option[];
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: "vertical" | "horizontal";
  className?: string;
}) => {
  const name = React.useId();
  return (
    <fieldset className={cn("space-y-2", className)}>
      <legend className="mb-1.5 text-sm font-medium text-foreground">{label}</legend>
      <div className={cn("flex gap-3", orientation === "vertical" ? "flex-col" : "flex-wrap")}>
        {options.map(normalizeOption).map((option) => {
          const optionId = `${name}-${option.value}`;
          return (
            <div key={option.value} className="flex items-center gap-2">
              <input
                id={optionId}
                type="radio"
                name={name}
                value={option.value}
                checked={value === undefined ? undefined : value === option.value}
                disabled={option.disabled}
                onChange={() => onValueChange?.(option.value)}
                className="size-4 cursor-pointer accent-primary"
              />
              <label htmlFor={optionId} className="cursor-pointer text-sm text-foreground">
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
};

/** Compact search box with an accessible label and a clear button. */
export const SearchInput = ({
  value,
  onValueChange,
  placeholder = "Search…",
  label = "Search",
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}) => (
  <div className={cn("relative w-full sm:w-64", className)}>
    <KitIcon
      icon="Search"
      className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
    />
    <input
      type="search"
      aria-label={label}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onValueChange(event.target.value)}
      className={cn(CONTROL, "h-9 pr-8 pl-9 [&::-webkit-search-cancel-button]:hidden")}
    />
    {value && (
      <button
        type="button"
        aria-label="Clear search"
        onClick={() => onValueChange("")}
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <KitIcon icon="X" size={14} />
      </button>
    )}
  </div>
);

/** Button group for picking one of a few options, such as a time range or view mode. */
export const Segmented = ({
  label,
  options,
  value,
  onValueChange,
  size = "md",
  className,
}: {
  label: string;
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  size?: "sm" | "md";
  className?: string;
}) => (
  <div
    role="radiogroup"
    aria-label={label}
    className={cn("inline-flex rounded-lg bg-muted p-1", className)}
  >
    {options.map(normalizeOption).map((option) => (
      <button
        key={option.value}
        type="button"
        role="radio"
        aria-checked={value === option.value}
        disabled={option.disabled}
        onClick={() => onValueChange(option.value)}
        className={cn(
          "cursor-pointer rounded-md font-medium whitespace-nowrap text-muted-foreground transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50",
          size === "sm" ? "h-6 px-2 text-xs" : "h-7 px-3 text-sm",
          value === option.value ? "bg-card text-foreground shadow-xs" : "hover:text-foreground",
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);

/** A from/to date range as ISO date strings (yyyy-mm-dd). */
export type DateRangeValue = { from: string; to: string };

/** Two labelled date inputs for filtering by a range. */
export const DateRange = ({
  label = "Date range",
  value,
  onValueChange,
  className,
}: {
  label?: string;
  value: DateRangeValue;
  onValueChange: (value: DateRangeValue) => void;
  className?: string;
}) => {
  const id = React.useId();
  return (
    <fieldset className={cn("flex flex-wrap items-end gap-2", className)}>
      <legend className="sr-only">{label}</legend>
      <div className="space-y-1">
        <label htmlFor={`${id}-from`} className="block text-xs font-medium text-muted-foreground">
          From
        </label>
        <input
          id={`${id}-from`}
          type="date"
          value={value.from}
          max={value.to || undefined}
          onChange={(event) => onValueChange({ ...value, from: event.target.value })}
          className={cn(CONTROL, "h-9 w-40")}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor={`${id}-to`} className="block text-xs font-medium text-muted-foreground">
          To
        </label>
        <input
          id={`${id}-to`}
          type="date"
          value={value.to}
          min={value.from || undefined}
          onChange={(event) => onValueChange({ ...value, to: event.target.value })}
          className={cn(CONTROL, "h-9 w-40")}
        />
      </div>
    </fieldset>
  );
};

/** Lays out form fields in a responsive grid with consistent spacing. */
export const FormGrid = ({
  columns = 2,
  className,
  children,
}: {
  columns?: 1 | 2 | 3;
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={cn(
      "grid gap-4",
      columns === 2 && "sm:grid-cols-2",
      columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
      className,
    )}
  >
    {children}
  </div>
);
