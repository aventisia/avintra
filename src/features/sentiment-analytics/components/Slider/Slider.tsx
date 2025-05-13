import { cn } from "@aventisia/ui/lib";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  /** Optional Tailwind class to style the slider range (filled track) */
  rangeColorClass?: string;

  /** Optional Tailwind class to style the slider thumb (handle) */
  thumbColorClass?: string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      rangeColorClass = "bg-primary",
      thumbColorClass = "border-primary",
      value,
      ...props
    },
    ref,
  ) => {
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
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-accent">
          <SliderPrimitive.Range
            className={cn("absolute h-full", rangeColorClass)}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            "relative block h-4 w-4 rounded-full bg-background shadow transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border",
            thumbColorClass,
          )}
        >
          <span
            className={
              "absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white px-3 py-0.5 rounded-md bg-primary"
            }
          >
            {currentValue}
          </span>
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>
    );
  },
);

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
