import { cva } from "class-variance-authority";

export const labelVariants = cva(
  "text-[13px]/[18px] font-semibold text-ink peer-disabled:cursor-not-allowed peer-disabled:text-muted-foreground",
);
