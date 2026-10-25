import { cva } from "class-variance-authority";

const FILLED_DISABLED = "disabled:bg-border disabled:text-slate-400 disabled:shadow-none";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-transparent text-sm font-medium outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: [
          "bg-primary font-semibold text-primary-foreground shadow-[0_1px_2px_rgba(67,56,202,0.5),inset_0_1px_0_rgba(255,255,255,0.18)] hover:bg-indigo-500 focus-visible:ring-offset-2 active:scale-[0.98]",
          FILLED_DISABLED,
        ],
        caution:
          "text-rose-600 hover:bg-rose-50 hover:text-rose-700 focus-visible:ring-rose-500/50 disabled:text-slate-400",
        destructive: [
          "bg-rose-600 font-semibold text-white shadow-[0_1px_2px_rgba(190,18,60,0.5),inset_0_1px_0_rgba(255,255,255,0.18)] hover:bg-rose-500 focus-visible:ring-rose-500/50 focus-visible:ring-offset-2 active:scale-[0.98]",
          FILLED_DISABLED,
        ],
        outline:
          "border-input bg-background text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.05)] hover:bg-muted hover:text-slate-900 active:scale-[0.98] disabled:bg-muted disabled:text-slate-400 disabled:shadow-none",
        secondary: [
          "bg-secondary text-secondary-foreground shadow-[0_1px_2px_rgba(30,27,75,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-indigo-900 focus-visible:ring-offset-2 active:scale-[0.98]",
          FILLED_DISABLED,
        ],
        ghost: "hover:bg-muted hover:text-slate-900 disabled:opacity-50",
        dropdownItem:
          "relative cursor-default select-none !justify-start rounded-md bg-transparent !px-2 py-1.5 text-slate-700 hover:bg-muted hover:text-slate-900 focus-visible:bg-muted focus-visible:text-slate-900 focus-visible:ring-0 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 disabled:opacity-50",
        dropdownCautionItem:
          "relative w-full cursor-default select-none !justify-start rounded-md bg-transparent !px-2 py-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 focus-visible:bg-rose-50 focus-visible:text-rose-700 focus-visible:ring-0 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 disabled:opacity-50",
        link: "!h-auto rounded-sm !p-0 font-normal text-primary underline-offset-4 hover:text-indigo-500 hover:underline disabled:text-slate-400",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-8 px-3 text-2xs",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon11: "h-11 w-11 p-0",
        icon10: "h-10 w-10 p-0",
        icon9: "h-9 w-9 p-0",
        icon8: "h-8 w-8 p-0",
        icon7: "h-7 w-7 p-0",
        icon6: "h-6 w-6 p-0",
        icon5: "h-5 w-5 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
