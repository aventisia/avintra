import { cn } from "@avplatform/ui/lib";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { type ButtonHTMLAttributes, forwardRef } from "react";

const VARIANTS = {
  primary:
    "bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary-hover focus-visible:ring-offset-2 disabled:bg-border disabled:text-muted-foreground disabled:shadow-none",
  danger:
    "bg-bad px-4 font-semibold text-on-bad hover:bg-bad/90 focus-visible:ring-offset-2 disabled:bg-border disabled:text-muted-foreground disabled:shadow-none",
  secondary: "px-3.5 font-medium text-ink-2 hover:bg-muted hover:text-ink",
} as const;

type CardDialogButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS;
  isBusy?: boolean;
};

/**
 * Button in the card dialog style; shows a spinner while busy.
 */
export const CardDialogButton = forwardRef<HTMLButtonElement, CardDialogButtonProps>(
  ({ variant = "secondary", isBusy = false, className, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      {...props}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-2 rounded-md text-[13px] outline-none transition focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] disabled:pointer-events-none",
        VARIANTS[variant],
        className,
      )}
    >
      {isBusy && <CircleNotchIcon className="size-4 animate-spin" />}
      {children}
    </button>
  ),
);
CardDialogButton.displayName = "CardDialogButton";
