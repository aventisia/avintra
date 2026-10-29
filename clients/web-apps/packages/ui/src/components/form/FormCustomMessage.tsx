import { type FormMessageProps } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { CircleCheck, CircleX, TriangleAlert } from "lucide-react";
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
            {messageType === "Yellow" && <TriangleAlert className="h-3.5 w-3.5" />}
            {messageType === "Red" && <CircleX className="h-3.5 w-3.5" />}
            {messageType === "Green" && <CircleCheck className="h-3.5 w-3.5" />}
            {errorMessage}
            {errors.length > 1 && index < errors.length - 1 && " &"}
          </p>
        );
      })}
    </div>
  );
};

FormCustomMessage.displayName = "FormMessage";
