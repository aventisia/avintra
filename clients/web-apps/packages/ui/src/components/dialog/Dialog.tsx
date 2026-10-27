import * as DialogPrimitive from "@radix-ui/react-dialog";
import { type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

import { buttonVariants } from "@/ui/components/buttons";
import { dialogVariants } from "@/ui/components/dialog";
import { Tooltip } from "@/ui/components/tooltip";
import { cn } from "@/ui/lib";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

// ------------------------------------------------------------------------------------------------

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-scrim data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// ------------------------------------------------------------------------------------------------
interface DialogContentProps
  extends
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogVariants> {}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, side, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay>
      <DialogPrimitive.Content
        ref={ref}
        className={cn(dialogVariants({ side }), className)}
        {...props}
      />
    </DialogOverlay>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

// ------------------------------------------------------------------------------------------------

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

// ------------------------------------------------------------------------------------------------

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 border-t border-line px-5 py-3 sm:flex-row sm:justify-end",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

// ------------------------------------------------------------------------------------------------

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("flex items-center text-heading text-ink", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// ------------------------------------------------------------------------------------------------

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-body-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// ------------------------------------------------------------------------------------------------

interface DialogDefaultHeaderProps extends React.PropsWithChildren {
  heading: string;
  description?: string;
  className?: string;
}

const DialogDefaultHeader = ({
  heading,
  description,
  children,
  className,
}: DialogDefaultHeaderProps) => (
  <div
    className={cn(
      "relative flex items-center justify-between gap-3 border-b border-line py-3 pl-5 pr-3",
      className,
    )}
  >
    {/* Left side - Dialog Heading and description */}
    <div className="flex min-w-0 flex-col gap-1">
      <DialogPrimitive.Title className="flex items-center text-heading text-ink">
        {heading}
      </DialogPrimitive.Title>
      <DialogPrimitive.Description className="text-body-sm text-muted-foreground">
        {description}
      </DialogPrimitive.Description>
    </div>
    {/* Right side - Dialog action buttons */}
    <div className="flex items-center">
      {/* Extras */}
      {children}
      {/* Close Dialog */}
      <Tooltip content={"Close"} shortcut="Esc">
        <DialogPrimitive.Close className={buttonVariants({ variant: "ghost", size: "icon8" })}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </Tooltip>
    </div>
  </div>
);
DialogDefaultHeader.displayName = "DialogDefaultHeader";

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDefaultHeader,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogPrimitive,
  DialogTitle,
  DialogTrigger,
};
