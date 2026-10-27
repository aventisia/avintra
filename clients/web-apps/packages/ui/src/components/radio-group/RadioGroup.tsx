import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import * as React from "react";

import { cn } from "@/ui/lib";
import { type FormFieldSizeType } from "@/ui/types";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />;
});

RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    size?: FormFieldSizeType;
  }
>(({ className, size = "base", ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square shrink-0 rounded-full border-[1.5px] border-line-strong bg-surface text-primary-foreground transition-colors duration-[120ms] ease-out focus:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:border-line disabled:bg-sunken data-[state=checked]:border-indicator data-[state=checked]:bg-indicator disabled:data-[state=checked]:border-fill disabled:data-[state=checked]:bg-fill disabled:data-[state=checked]:text-muted-foreground motion-reduce:transition-none",
        size === "xs" && "h-3 w-3",
        size === "sm" && "h-3.5 w-3.5",
        size === "base" && "h-4 w-4",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle
          className={cn(
            "fill-current text-current",
            size === "xs" && "h-1 w-1",
            size === "sm" && "h-[5px] w-[5px]",
            size === "base" && "h-1.5 w-1.5",
          )}
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});

RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
