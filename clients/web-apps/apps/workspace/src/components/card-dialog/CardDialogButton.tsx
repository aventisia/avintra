import { cn } from "@avplatform/ui/lib";
import { LoaderCircle } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";

const VARIANTS = {
  primary:
    "bg-primary px-4 font-semibold text-white shadow-[0_1px_2px_rgba(67,56,202,0.5),inset_0_1px_0_rgba(255,255,255,0.18)] hover:bg-indigo-500 focus-visible:ring-offset-2 disabled:bg-border disabled:text-slate-400 disabled:shadow-none",
  danger:
    "bg-rose-600 px-4 font-semibold text-white shadow-[0_1px_2px_rgba(190,18,60,0.5),inset_0_1px_0_rgba(255,255,255,0.18)] hover:bg-rose-500 focus-visible:ring-rose-500/50 focus-visible:ring-offset-2 disabled:bg-border disabled:text-slate-400 disabled:shadow-none",
  secondary: "px-3.5 font-medium text-slate-600 hover:bg-muted hover:text-slate-900",
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
        "inline-flex h-9 shrink-0 items-center gap-2 rounded-lg text-[13px] outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-500/50 active:scale-[0.98] disabled:pointer-events-none",
        VARIANTS[variant],
        className,
      )}
    >
      {isBusy && <LoaderCircle className="size-4 animate-spin" />}
      {children}
    </button>
  ),
);
CardDialogButton.displayName = "CardDialogButton";
