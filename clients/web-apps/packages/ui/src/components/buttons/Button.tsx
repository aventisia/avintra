import { type VariantProps } from "class-variance-authority";
import * as React from "react";

import { buttonVariants } from "@/ui/components/buttons";
import { cn } from "@/ui/lib";

/** Base Button props interface */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

/** Basic/Default button implementation using buttonVariants tailwind classes */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";
