import { cva } from "class-variance-authority";

export const popoverVariants = cva(
  "z-50 bg-surface text-ink shadow-pop outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 motion-reduce:animate-none",
  {
    variants: {
      variant: {
        default: "rounded-lg",
        responsive:
          "flex h-screen w-screen flex-col overflow-hidden rounded-none mlg:h-[var(--popover-height)] mlg:w-[22rem] mlg:rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
