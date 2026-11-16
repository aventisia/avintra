import { cva } from "class-variance-authority";

export const alertVariants = cva(
  "relative w-full rounded-lg border border-line px-4 py-3 text-body-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-surface text-ink",
        destructive:
          "border-bad/35 bg-surface text-bad [&>svg]:text-current *:data-[slot=alert-description]:text-bad",
        success: "border-ok/35 bg-surface text-ok [&>svg]:text-ok",
        warning: "border-warn/35 bg-surface text-warn [&>svg]:text-warn",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
