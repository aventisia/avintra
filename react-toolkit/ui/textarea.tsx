import { cn } from "@/react-toolkit/lib/utils";
import { FormFieldSizeType } from "@/react-toolkit/types/literal-types";

import * as React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: FormFieldSizeType;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size = "base", ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-input bg-background shadow-sm shadow-black/5 ring-offset-background transition-shadow placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-80",
          size === "xs" && "px-[0.45rem] py-1 text-2xs",
          size === "sm" && "px-[0.55rem] py-1.5 text-xs",
          size === "base" && "px-3 py-2 text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
