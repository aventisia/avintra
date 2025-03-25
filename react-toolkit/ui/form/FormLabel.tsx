import { cn } from "@/react-toolkit/lib/utils";
import { FormFieldSizeType } from "@/react-toolkit/types/form-field-size-type";
import { useFormField } from "@/react-toolkit/ui/form/useFormField";
import { Label } from "@/react-toolkit/ui/label";
import * as LabelPrimitive from "@radix-ui/react-label";
import * as React from "react";

// FormLabel
const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    size?: FormFieldSizeType;
  }
>(({ className, size = "base", ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(
        "font-medium",
        size === "xs" && "text-3xs",
        size === "sm" && "text-2xs",
        size === "base" && "text-2xs",
        error && "text-destructive",
        className,
      )}
      htmlFor={formItemId}
      {...props}
    />
  );
});

FormLabel.displayName = "FormLabel";

export { FormLabel };
