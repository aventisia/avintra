import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors duration-0 focus-visible:outline-none focus-visible:ring-[3px] cursor-pointer disabled:pointer-events-none disabled:opacity-80",
  {
    variants: {
      variant: {
        default:
          "hover:bg-primary/90 border border-primary bg-primary shadow-sm shadow-black/5 transition-shadow text-primary-foreground focus-visible:border-primary focus-visible:ring-ring",
        caution:
          "border border-transparent bg-transparent text-destructive hover:bg-destructive hover:text-white focus:border-destructive focus:!bg-destructive focus:!text-white focus:ring-transparent",
        destructive:
          "hover:bg-destructive/90 border border-destructive bg-destructive text-destructive-foreground focus-visible:border-black focus-visible:ring-black",
        outline:
          "border border-input bg-background shadow-sm shadow-black/5 transition-shadow hover:bg-accent hover:text-accent-foreground focus-visible:border-primary focus-visible:ring-ring",
        secondary:
          "hover:bg-secondary/80 border border-secondary bg-secondary text-secondary-foreground focus-visible:border-black focus-visible:ring-black",
        ghost:
          "border border-transparent hover:bg-accent hover:text-accent-foreground focus-visible:border-primary focus-visible:ring-ring",
        dropdownItem:
          "relative w-full cursor-default select-none !justify-start rounded-md border border-transparent bg-transparent !px-2 py-1.5 outline-none focus:border-accent focus:!bg-accent focus:text-accent-foreground focus:ring-transparent data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        dropdownCautionItem:
          "relative w-full cursor-default select-none !justify-start rounded-md border border-transparent bg-transparent !px-2 py-1.5 text-destructive outline-none focus:border-destructive focus:!bg-destructive focus:text-white focus:ring-transparent data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        link: "!h-auto !p-0 font-normal text-primary underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-8 px-3 text-2xs",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon11:
          "h-11 w-11 p-0 focus-visible:ring-1 focus-visible:ring-offset-0",
        icon10:
          "h-10 w-10 p-0 focus-visible:ring-1 focus-visible:ring-offset-0",
        icon9: "h-9 w-9 p-0 focus-visible:ring-1 focus-visible:ring-offset-0",
        icon8: "h-8 w-8 p-0 focus-visible:ring-1 focus-visible:ring-offset-0",
        icon7: "h-7 w-7 p-0 focus-visible:ring-1 focus-visible:ring-offset-0",
        icon6: "h-6 w-6 p-0 focus-visible:ring-1 focus-visible:ring-offset-0",
        icon5: "h-5 w-5 p-0 focus-visible:ring-1 focus-visible:ring-offset-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
