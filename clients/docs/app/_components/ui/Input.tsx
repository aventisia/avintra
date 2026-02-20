import * as React from "react";

import { cn } from "@/lib";
import { FormFieldSizeType } from "@/types";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fieldSize?: FormFieldSizeType;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, fieldSize = "base", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-background shadow-sm shadow-black/5 ring-offset-background transition-shadow file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:tracking-normal placeholder:text-muted-foreground read-only:cursor-not-allowed read-only:opacity-80 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-80",
          fieldSize === "xs" && "h-7 px-[0.45rem] text-2xs",
          fieldSize === "sm" && "h-8 px-[0.55rem] text-xs",
          fieldSize === "base" && "h-10 px-3 text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input, type InputProps };
