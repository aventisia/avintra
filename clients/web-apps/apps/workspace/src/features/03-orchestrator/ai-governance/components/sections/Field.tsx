import { FieldHelpPopover } from "@avplatform/ui/form";
import { ReactNode } from "react";

interface FieldProps {
  label: string;
  clause?: string;
  hint?: string;
  /** Markdown instructional text shown in an "i" popover for human-input fields. */
  info?: string;
  /** Whether the field is mandatory (shows a red asterisk). */
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Label + control + optional hint wrapper for form fields.
 * Pass `info` (Markdown) to show an "i" popover with instructions on how to fill the field.
 */
export const Field = ({ label, clause, hint, info, required, children, className }: FieldProps) => {
  return (
    <div className={className}>
      <label className="mb-1.5 flex items-center gap-1 text-[12.5px] font-semibold">
        {label}
        {required && <span className="text-bad">*</span>}
        {info && <FieldHelpPopover content={info} />}
        {clause && (
          <span className="ml-1 text-[10px] font-normal text-muted-foreground">{clause}</span>
        )}
      </label>
      {children}
      {hint && (
        <div className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{hint}</div>
      )}
    </div>
  );
};
