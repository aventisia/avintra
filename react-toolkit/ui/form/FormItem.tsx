import { cn } from "@/react-toolkit/lib/utils";
import { FormFieldSizeType } from "@/react-toolkit/types/form-field-size-type";
import { FormItemContext } from "@/react-toolkit/ui/form/FormItemContext";

import * as React from "react";

// FormItem
const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: FormFieldSizeType;
  }
>(({ className, size = "base", ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        ref={ref}
        className={cn(
          size === "xs" && "space-y-0.5",
          size === "sm" && "space-y-1",
          size === "base" && "space-y-1",
          className,
        )}
        {...props}
      />
    </FormItemContext.Provider>
  );
});

FormItem.displayName = "FormItem";

export { FormItem };
