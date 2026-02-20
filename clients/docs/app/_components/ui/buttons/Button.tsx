import { type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib";
import { buttonVariants } from "./button-variants";

/** Base Button props interface */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

/** Basic/Default button implementation using buttonVariants tailwind classes */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
