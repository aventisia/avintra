import * as React from "react";

import { cn } from "@/ui/lib";
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
          "flex w-full rounded-md border border-line-strong bg-surface text-ink transition-[border-color,box-shadow] duration-[120ms] ease-out placeholder:text-muted-foreground focus-visible:border-focus focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-focus/[0.28] aria-[invalid=true]:border-bad aria-[invalid=true]:focus-visible:ring-bad/[0.24] disabled:cursor-not-allowed disabled:border-line disabled:bg-sunken disabled:text-muted-foreground motion-reduce:transition-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:tracking-normal read-only:cursor-not-allowed read-only:opacity-80",
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
