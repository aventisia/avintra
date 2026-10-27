import { cva } from "class-variance-authority";

const MENU_ITEM =
  "relative cursor-default select-none !justify-start rounded-sm bg-transparent !px-2 py-1.5 text-body-sm font-normal hover:bg-hover focus-visible:bg-hover focus-visible:shadow-none active:translate-y-0 data-[disabled]:pointer-events-none data-[disabled]:text-muted-foreground disabled:bg-transparent disabled:text-muted-foreground";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md border border-transparent text-button font-semibold outline-none transition-[background-color,border-color,color,transform] duration-[120ms] ease-out focus-visible:outline-none focus-visible:shadow-focus active:translate-y-px disabled:pointer-events-none disabled:border-transparent disabled:bg-fill disabled:text-muted-foreground aria-busy:cursor-progress motion-reduce:transition-none motion-reduce:active:translate-y-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        caution: "bg-transparent text-bad hover:bg-hover",
        destructive: "bg-bad text-bad-foreground hover:bg-bad-hover",
        outline: "border-line-strong bg-surface text-ink hover:bg-hover",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
        ghost: "bg-transparent text-ink-2 hover:bg-hover hover:text-ink",
        dropdownItem: [MENU_ITEM, "text-ink"],
        dropdownCautionItem: [MENU_ITEM, "w-full text-bad"],
        link: "!h-auto rounded-sm !p-0 font-medium text-primary-text underline decoration-line-strong underline-offset-[3px] hover:decoration-current active:translate-y-0 disabled:bg-transparent",
      },
      size: {
        default: "h-8 px-3.5",
        xs: "h-6 gap-1.5 px-2 text-[12.5px]/5",
        sm: "h-7 px-[11px] text-[13px]/5",
        lg: "h-[38px] px-[18px] text-[14px]/5",
        icon: "size-8 p-0",
        icon11: "size-[38px] p-0",
        icon10: "size-8 p-0",
        icon9: "size-8 p-0",
        icon8: "size-8 p-0",
        icon7: "size-7 p-0",
        icon6: "size-6 p-0",
        icon5: "size-5 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
