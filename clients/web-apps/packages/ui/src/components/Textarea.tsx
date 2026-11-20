import * as React from "react";

import { FIELD_SURFACE, cn } from "@/ui/lib";
import { type FormFieldSizeType } from "@/ui/types";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: FormFieldSizeType;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size = "base", ...props }, ref) => {
    return (
      <textarea
        className={cn(
          FIELD_SURFACE,
          "flex min-h-[76px] w-full resize-y placeholder:text-muted-foreground",
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
