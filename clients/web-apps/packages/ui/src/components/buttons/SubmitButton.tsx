import { type VariantProps } from "class-variance-authority";
import * as React from "react";

import { LoadingSpinner } from "@/ui/components";
import { buttonVariants } from "@/ui/components/buttons";
import { cn } from "@/ui/lib";

/** SubmitButton props interface */
export interface SubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Mutation/form (isPending/isSubmitting) state can be passed to show loading animation */
  isPending: boolean;
  /** Button's text to show when "isPending" prop is false. Default value is Submit */
  primaryText?: string;
  /** Button's text to show when "isPending" prop is true. Default value is Please wait */
  secondaryText?: string;
}

/** Implementation of button for form submit using buttonVariants tailwind classes */
export const SubmitButton = React.forwardRef<HTMLButtonElement, SubmitButtonProps>(
  (
    {
      className,
      variant,
      size,
      isPending,
      primaryText = "Submit",
      secondaryText = "Please wait",
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        type="submit"
        className={cn("gap-2", buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
        disabled={disabled || isPending}
        aria-busy={isPending}
      >
        {isPending ? (
          <>
            <LoadingSpinner className="h-4 w-4" />
            {secondaryText}
          </>
        ) : (
          <>{primaryText}</>
        )}
      </button>
    );
  },
);
SubmitButton.displayName = "SubmitButton";
