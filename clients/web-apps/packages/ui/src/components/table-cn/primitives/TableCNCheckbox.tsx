import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import * as React from "react";

import { cn } from "@/ui/lib";

/**
 * Compact checkbox with a dash for the indeterminate state.
 */
export const TableCNCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, checked, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    checked={checked}
    className={cn(
      "peer grid size-4 shrink-0 place-items-center rounded-[5px] border border-slate-300 bg-background shadow-[0_1px_1px_rgba(15,23,42,0.06)] outline-none transition-colors",
      "hover:border-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600 data-[state=indeterminate]:border-indigo-600 data-[state=indeterminate]:bg-indigo-600 data-[state=checked]:text-white data-[state=indeterminate]:text-white",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator>
      {checked === "indeterminate" ? (
        <Minus className="size-3 stroke-[3]" />
      ) : (
        <Check className="size-3 stroke-[3]" />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
TableCNCheckbox.displayName = "TableCNCheckbox";
