import { CheckCircleIcon, WarningIcon, XCircleIcon } from "@phosphor-icons/react";
import * as React from "react";

import { useFormField } from "@/ui/components/form";
import { cn } from "@/ui/lib";
import { type CustomMessageType, type FormFieldSizeType } from "@/ui/types";

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  customMessageType?: CustomMessageType;
  size?: FormFieldSizeType;
}

// FormMessage
const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, customMessageType, size = "base", children, ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    const errorMessage = error ? String(error?.message) : children;

    /* NOTE: If we want to show a stop/cross icon with the error message the 
      we can set form error manualy with the type "Red". Custom message type 
      can also have "Red" type but it does not going to make the field/form invalid
    */

    // Set message type based on error type
    const messageType = error?.type === "Red" ? "Red" : customMessageType;

    if (!errorMessage) {
      return null;
    }

    return (
      <p
        ref={ref}
        id={formMessageId}
        className={cn(
          "flex items-center gap-1.5 font-medium text-bad",
          size === "xs" && "pt-0 text-2xs",
          size === "sm" && "pt-0 text-[12px]/4",
          size === "base" && "pt-0.5 text-hint",
          messageType === "Gray" &&
            "animate-pulse text-muted-foreground duration-1000 motion-reduce:animate-none",
          messageType === "Yellow" && "text-warn",
          messageType === "Red" && "text-bad",
          messageType === "Green" && "text-ok",
          className,
        )}
        {...props}
      >
        {messageType === "Yellow" && <WarningIcon className="h-3.5 w-3.5" />}
        {messageType === "Red" && <XCircleIcon className="h-3.5 w-3.5" />}
        {messageType === "Green" && <CheckCircleIcon className="h-3.5 w-3.5" />}
        {errorMessage}
      </p>
    );
  },
);

FormMessage.displayName = "FormMessage";

export { FormMessage, type FormMessageProps };
