import * as PopoverPrimitive from "@radix-ui/react-popover";
import { type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

import { buttonVariants } from "@/ui/components/buttons";
import { popoverVariants } from "@/ui/components/popover";
import { cn } from "@/ui/lib";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverClose = PopoverPrimitive.Close;

// ------------------------------------------------------------------------------------------------

interface PopoverContentProps
  extends
    React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>,
    VariantProps<typeof popoverVariants> {}

/** Radix-ui's popover extension. Supports responsive design.
 * if responsive variant selected and screen width is less than
 * 425px then popover is going to cover the full screen.
 *
 * Note: Triggered style "hidden mlg:flex" is used to hide the trigger
 * for mobile screen which has to handle separately if responsive variant selected.
 */
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({ className, variant, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(popoverVariants({ variant, className }))}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

// ------------------------------------------------------------------------------------------------

interface PopoverDefaultHeaderProps extends React.PropsWithChildren {
  heading: React.ReactNode;
  className?: string;
}

/** Popover default header */
const PopoverDefaultHeader = ({ heading, className, children }: PopoverDefaultHeaderProps) => {
  return (
    <div className={cn("relative flex items-center justify-between border-b px-2 py-2", className)}>
      {/* Left side - Popover Heading */}
      <h2 className="ml-2 flex items-center text-base font-semibold text-foreground">{heading}</h2>
      {/* Right side - Popover action buttons */}
      <div className="flex items-center">
        {/* Extras */}
        {children}
        {/* Close popover */}
        <PopoverPrimitive.Close className={buttonVariants({ variant: "ghost", size: "icon8" })}>
          <X className="h-5 w-5 text-[--icon-color]" />
          <span className="sr-only">Close</span>
        </PopoverPrimitive.Close>
      </div>
    </div>
  );
};

export { Popover, PopoverClose, PopoverContent, PopoverDefaultHeader, PopoverTrigger };
