import * as React from "react";

import { FIELD_SURFACE, cn } from "@/ui/lib";
import { type FormFieldSizeType } from "@/ui/types";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fieldSize?: FormFieldSizeType;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, fieldSize = "base", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          FIELD_SURFACE,
          "flex w-full placeholder:text-muted-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:tracking-normal read-only:cursor-not-allowed read-only:opacity-80",
          fieldSize === "xs" && "h-6 px-2 text-hint",
          fieldSize === "sm" && "h-7 px-2.5 text-body-sm",
          fieldSize === "base" && "h-8 px-[11px] text-body",
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
