import { cn } from "@avplatform/ui/lib";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    thumbColor?: string;
    trackColor?: string;
    /** Shows the value in a bubble above the thumb on hover; off when the value is shown elsewhere. */
    showValueBubble?: boolean;
    /** Accessible name for the thumb; the field label is not associated with it. */
    thumbAriaLabel?: string;
    /** Spoken value, when the thumb's numeric value needs formatting. */
    valueText?: string;
  }
>(
  (
    {
      className,
      value,
      thumbColor,
      trackColor,
      showValueBubble = true,
      thumbAriaLabel,
      valueText,
      ...props
    },
    ref,
  ) => {
    const currentValue = Array.isArray(value) ? value[0] : 0;

    return (
      <SliderPrimitive.Root
        ref={ref}
        value={value}
        className={cn("relative flex w-full touch-none select-none items-center", className)}
        {...props}
      >
        <SliderPrimitive.Track
          className={cn(
            "relative h-1.5 w-full grow overflow-hidden rounded-full bg-fill",
            trackColor,
          )}
        >
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          aria-label={thumbAriaLabel}
          aria-valuetext={valueText}
          className={cn(
            "relative block h-4 w-4 rounded-full bg-background transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border border-primary group",
            thumbColor,
          )}
        >
          {showValueBubble && (
            <span className="absolute hidden -top-6 left-1/2 -translate-x-1/2 text-xs text-primary-foreground px-3 py-0.5 rounded-md bg-primary group-hover:block">
              {currentValue}
            </span>
          )}
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>
    );
  },
);

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
