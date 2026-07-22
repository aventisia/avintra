import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as React from "react";

import { cn } from "@/ui/lib";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
    showHorizontalScrollbar?: boolean;
    showVerticalScrollbar?: boolean;
    /**
     * Custom classes applied to the internal Viewport.
     *
     * Why this exists:
     * - Applying `max-height` or sizing only on the Root does NOT control scrolling
     *
     * When to use:
     * - Use this to control scroll behavior (e.g. `max-h-[300px]`)
     * - Allows content to grow naturally when small
     * - Enables scrolling ONLY when content exceeds the defined max height
     *
     * Example:
     * <ScrollArea viewportClassName="max-h-[300px]" />
     */
    viewportClassName?: string;
  }
>(
  (
    {
      className,
      children,
      viewportClassName,
      showHorizontalScrollbar = false,
      showVerticalScrollbar = true,
      ...props
    },
    ref,
  ) => (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        className={cn(
          "h-full w-full rounded-[inherit]",
          /**
           * Important:
           * - This is where height/overflow should be controlled
           * - Putting `max-h-*` here ensures:
           *   - No empty space when content is small
           *   - Scroll appears only when content overflows
           */
          viewportClassName,
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {showVerticalScrollbar ? <ScrollBar /> : null}
      {showHorizontalScrollbar ? <ScrollBar orientation="horizontal" /> : null}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  ),
);

ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
