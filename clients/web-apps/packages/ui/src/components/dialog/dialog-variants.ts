import { cva } from "class-variance-authority";

export const dialogVariants = cva(
  "fixed z-50 bg-surface text-ink shadow-pop transition ease-out data-[state=open]:animate-in data-[state=closed]:animate-out motion-reduce:animate-none",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 rounded-b-lg data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 rounded-t-lg data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 w-3/4 rounded-r-lg data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 w-3/4 rounded-l-lg data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
        center:
          "left-[50%] top-[50%] w-full max-w-[440px] translate-x-[-50%] translate-y-[-50%] rounded-lg data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
      },
    },
    defaultVariants: {
      side: "center",
    },
  },
);
