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
      "peer grid size-4 shrink-0 place-items-center rounded-sm border-[1.5px] border-line-strong bg-surface outline-none transition-colors",
      "hover:border-line-strong focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:border-indicator data-[state=checked]:bg-indicator data-[state=indeterminate]:border-indicator data-[state=indeterminate]:bg-indicator data-[state=checked]:text-primary-foreground data-[state=indeterminate]:text-primary-foreground",
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
