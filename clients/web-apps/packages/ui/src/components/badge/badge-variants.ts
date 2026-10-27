import { cva } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap rounded-sm border px-2 font-mono text-[10.5px]/none font-medium uppercase tracking-[0.05em]",
  {
    variants: {
      variant: {
        default: "border-primary-text/35 text-primary-text",
        secondary: "border-line-strong text-muted-foreground",
        destructive: "border-bad/35 text-bad",
        outline: "border-line-strong text-ink-2",
        primary: "border-primary-text/35 text-primary-text",
        running: "border-live/35 text-live",
        completed: "border-ok/35 text-ok",
        review: "border-warn/35 text-warn",
        failed: "border-bad/35 text-bad",
        queued: "border-muted-foreground/35 text-muted-foreground",
        draft: "border-dashed border-muted-foreground/35 text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const badgeDotVariants = cva("relative size-1.5 shrink-0 rounded-full bg-current", {
  variants: {
    variant: {
      running: "",
      completed: "",
      review: "rotate-45 rounded-[1px]",
      failed: "rounded-[1px]",
      queued: "size-[7px] border-[1.5px] border-current bg-transparent",
    },
  },
});

export { badgeDotVariants, badgeVariants };
