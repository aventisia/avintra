import * as React from "react";

import { useFormField } from "@/ui/components/form";
import { cn } from "@/ui/lib";
import { type FormFieldSizeType } from "@/ui/types";

// FormDescription
const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    size?: FormFieldSizeType;
  }
>(({ className, size = "base", ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn(
        "text-muted-foreground",
        size === "xs" && "text-2xs",
        size === "sm" && "text-[12px]/4",
        size === "base" && "text-hint",
        className,
      )}
      {...props}
    />
  );
});

FormDescription.displayName = "FormDescription";

export { FormDescription };
