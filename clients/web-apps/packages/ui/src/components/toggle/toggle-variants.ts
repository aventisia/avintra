import { cva } from "class-variance-authority";

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-sm text-hint font-semibold text-muted-foreground transition-colors duration-[120ms] ease-out hover:text-ink focus-visible:outline-none focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-fill data-[state=on]:text-ink data-[state=on]:shadow-[0_0_0_1px_var(--line-strong)] motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-line-strong bg-surface hover:bg-hover",
      },
      size: {
        default: "h-[22px] min-w-[22px] px-2.5",
        sm: "h-5 min-w-5 px-2",
        lg: "h-7 min-w-7 px-3 text-body-sm [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export { toggleVariants };
