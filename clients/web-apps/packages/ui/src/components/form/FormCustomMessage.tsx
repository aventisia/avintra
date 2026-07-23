import { type FormMessageProps } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { type FieldError } from "react-hook-form";

export type FormCustomMessageProps = {
  fieldStates?: { formMessageId?: string; error?: FieldError }[];
} & FormMessageProps;

// FormMessage
export const FormCustomMessage = ({
  className,
  customMessageType,
  size = "base",
  children,
  fieldStates: errors,
  ...props
}: FormCustomMessageProps) => {
  if (!errors) {
    return null;
  }

  return (
    <div className="flex text-ellipsis text-pretty">
      {errors?.map((item, index) => {
        const errorMessage = item.error ? String(item.error?.message) : children;

        const messageType = item.error?.type === "Red" ? "Red" : customMessageType;
        if (!errorMessage) {
          return null;
        }
        return (
          <p
            id={item?.formMessageId}
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
            {errors.length > 1 && index < errors.length - 1 && " &"}
          </p>
        );
      })}
    </div>
  );
};

FormCustomMessage.displayName = "FormMessage";
