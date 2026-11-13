import { cn } from "@avplatform/ui/lib";

/**
 * Classes for a text input or textarea inside a card dialog form.
 */
export const getFieldInputClassName = (hasError: boolean) =>
  cn(
    "w-full rounded-md border-0 bg-popover px-3.5 text-body-sm text-ink outline-none ring-1 transition-shadow placeholder:text-muted-foreground",
    hasError ? "ring-bad focus:ring-bad" : "ring-border focus:ring-focus",
  );
