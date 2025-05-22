import { cn } from "@aventisia/ui/lib";
import { FormFieldSizeType } from "@aventisia/ui/types";
import { useFormField } from "@aventisia/ui/form";
import { Label } from "@aventisia/ui/label";
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
