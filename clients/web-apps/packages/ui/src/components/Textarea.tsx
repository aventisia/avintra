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
          "flex min-h-[76px] w-full resize-y rounded-md border border-line-strong bg-surface text-ink transition-[border-color,box-shadow] duration-[120ms] ease-out placeholder:text-muted-foreground focus-visible:border-focus focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-focus/[0.28] aria-[invalid=true]:border-bad aria-[invalid=true]:focus-visible:ring-bad/[0.24] disabled:cursor-not-allowed disabled:border-line disabled:bg-sunken disabled:text-muted-foreground motion-reduce:transition-none",
          size === "xs" && "px-2 py-0.5 text-hint",
          size === "sm" && "px-2.5 py-1 text-body-sm",
          size === "base" && "px-[11px] py-1.5 text-body",
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
