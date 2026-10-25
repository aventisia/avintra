import { cn } from "@avplatform/ui/lib";

/**
 * Classes for a text input or textarea inside a card dialog form.
 */
export const getFieldInputClassName = (hasError: boolean) =>
  cn(
    "w-full rounded-xl border-0 bg-popover px-3.5 text-[13.5px] text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none ring-1 transition-shadow placeholder:text-slate-400",
    hasError
      ? "ring-rose-400 focus:shadow-[0_0_0_4px_rgba(244,63,94,0.12)] focus:ring-rose-500"
      : "ring-border focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)] focus:ring-indigo-500",
  );
