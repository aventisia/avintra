import * as React from "react";

import { FormItemContext } from "@/ui/components/form";
import { cn } from "@/ui/lib";
import { type FormFieldSizeType } from "@/ui/types";

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
