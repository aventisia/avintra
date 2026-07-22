import * as LabelPrimitive from "@radix-ui/react-label";
import * as React from "react";

import { useFormField } from "@/ui/components/form";
import { Label } from "@/ui/components/label";
import { cn } from "@/ui/lib";
import { type FormFieldSizeType } from "@/ui/types";

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
