import { cn } from "@aventisia/ui/lib";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    thumbColor?: string;
    trackColor?: string;
  }
>(({ className, value, thumbColor, trackColor, ...props }, ref) => {
  const currentValue = Array.isArray(value) ? value[0] : 0;

  return (
    <SliderPrimitive.Root
      ref={ref}
      value={value}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          "relative h-1.5 w-full grow overflow-hidden rounded-full bg-white",
          trackColor,
        )}
      >
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          "relative block h-4 w-4 rounded-full bg-background shadow transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border border-primary group",
          thumbColor,
        )}
      >
        <span className="absolute hidden -top-6 left-1/2 -translate-x-1/2 text-xs text-white px-3 py-0.5 rounded-md bg-primary group-hover:block">
          {currentValue}
        </span>
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  );
});

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
