import { cn } from "@avplatform/ui/lib";
import { CircleAlert } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

import { PANEL_TRANSITION } from "../../constants/folder-motion.constant";

type FormFieldProps = {
  htmlFor: string;
  label: string;
  isOptional?: boolean;
  length: number;
  maxLength: number;
  error?: string | null;
  /** Shown under the input while there is no error. */
  hint?: ReactNode;
  children: ReactNode;
};

/**
 * Label, character counter and animated error message around one form input.
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
      <span
        className={cn(
          "text-[11px] tabular-nums transition-colors",
          length >= maxLength ? "font-medium text-warn" : "text-muted-foreground",
        )}
      >
        {length}/{maxLength}
      </span>
    </div>
    {children}
    <AnimatePresence initial={false}>
      {error && (
        <motion.p
          key="error"
          id={`${htmlFor}-error`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={PANEL_TRANSITION}
          className="overflow-hidden"
        >
          <span className="flex items-center gap-1.5 pt-1.5 text-[12px] text-bad">
            <CircleAlert className="size-3.5 shrink-0" />
            {error}
          </span>
        </motion.p>
      )}
    </AnimatePresence>
    {!error && hint}
  </div>
);
