import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from "@heroicons/react/24/solid";
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
          "flex items-center gap-1 px-1 font-medium text-destructive transition-all duration-300 ease-in-out",
          size === "xs" && "pt-0 text-3xs",
          size === "sm" && "pt-0 text-2xs",
          size === "base" && "pt-1 text-2xs",
          messageType === "Gray" && "animate-pulse text-muted-foreground duration-1000",
          messageType === "Yellow" && "text-yellow-600",
          messageType === "Red" && "text-destructive",
          messageType === "Green" && "text-green-600",
          className,
        )}
        {...props}
      >
        {messageType === "Yellow" && <ExclamationTriangleIcon className="h-3.5 w-3.5" />}
        {messageType === "Red" && <XCircleIcon className="h-3.5 w-3.5" />}
        {messageType === "Green" && <CheckCircleIcon className="h-3.5 w-3.5" />}
        {errorMessage}
      </p>
    );
  },
);

FormMessage.displayName = "FormMessage";

export { FormMessage, type FormMessageProps };
