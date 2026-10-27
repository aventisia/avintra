import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import * as React from "react";

import { cn } from "@/ui/lib";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border-[1.5px] border-line-strong bg-surface text-primary-foreground transition-colors duration-[120ms] ease-out focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:border-line disabled:bg-sunken data-[state=checked]:border-indicator data-[state=checked]:bg-indicator data-[state=indeterminate]:border-indicator data-[state=indeterminate]:bg-indicator disabled:data-[state=checked]:border-fill disabled:data-[state=checked]:bg-fill disabled:data-[state=checked]:text-muted-foreground disabled:data-[state=indeterminate]:border-fill disabled:data-[state=indeterminate]:bg-fill disabled:data-[state=indeterminate]:text-muted-foreground motion-reduce:transition-none",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      {props.checked === "indeterminate" ? (
        <Minus className="h-3 w-3 stroke-[3]" />
      ) : (
        <Check className="h-3 w-3 stroke-[3]" />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
