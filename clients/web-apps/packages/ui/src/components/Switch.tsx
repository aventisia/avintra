import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as React from "react";

import { cn } from "@/ui/lib";
import { type FormFieldSizeType } from "@/ui/types";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    size?: FormFieldSizeType;
  }
>(({ className, size = "base", ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "group peer inline-flex shrink-0 cursor-pointer items-center rounded-full border border-line-strong bg-fill p-0.5 transition-colors duration-[120ms] ease-out focus-visible:outline-none focus-visible:shadow-focus data-[state=checked]:border-indicator data-[state=checked]:bg-indicator disabled:cursor-not-allowed disabled:border-line disabled:bg-sunken disabled:data-[state=checked]:border-line disabled:data-[state=checked]:bg-sunken motion-reduce:transition-none",
      size === "xs" && "h-3.5 w-6",
      size === "sm" && "h-4 w-7",
      size === "base" && "h-[18px] w-8",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block rounded-full bg-ink-2 ring-0 transition-transform duration-[120ms] ease-out data-[state=checked]:bg-primary-foreground data-[state=unchecked]:translate-x-0 group-disabled:bg-line-strong group-disabled:data-[state=checked]:bg-line-strong motion-reduce:transition-none",
        size === "xs" && "h-2 w-2 data-[state=checked]:translate-x-2.5",
        size === "sm" && "h-2.5 w-2.5 data-[state=checked]:translate-x-3",
        size === "base" && "h-3 w-3 data-[state=checked]:translate-x-3.5",
      )}
    />
  </SwitchPrimitives.Root>
));

Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
