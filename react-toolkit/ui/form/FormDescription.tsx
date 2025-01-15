import { cn } from "@/react-toolkit/lib/utils";
import { FormFieldSizeType } from "@/react-toolkit/types/form-field-size-type";
import { useFormField } from "@/react-toolkit/ui/form/useFormField";
import * as React from "react";

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
        size === "xs" && "text-3xs",
        size === "sm" && "text-2xs",
        size === "base" && "text-xs",
        className,
      )}
      {...props}
    />
  );
});

FormDescription.displayName = "FormDescription";

export { FormDescription };
