import * as React from "react";

import { cn } from "@/ui/lib";
import { type FormFieldSizeType } from "@/ui/types";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: FormFieldSizeType;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size = "base", ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-input bg-background shadow-sm shadow-black/5 ring-offset-background transition-shadow placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-80",
          size === "xs" && "px-[0.45rem] py-1 text-2xs",
          size === "sm" && "px-[0.55rem] py-[0.4rem] text-xs",
          size === "base" && "px-3 py-[0.55rem] text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea, type TextareaProps };
