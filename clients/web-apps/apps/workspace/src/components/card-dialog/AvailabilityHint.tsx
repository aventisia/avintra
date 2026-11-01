import { cn } from "@avplatform/ui/lib";
import { type CustomFormMessage } from "@avplatform/ui/types";
import { CircleCheck, LoaderCircle } from "lucide-react";

/**
 * Field hint that shows a name or email availability check in progress, then its result.
 */
export const AvailabilityHint = ({ message }: { message: CustomFormMessage | null }) => {
  if (!message) return null;

  const isChecking = message.type === "Gray";

  return (
    <span
      className={cn(
        "flex items-center gap-1.5 pt-1.5 text-[12px]",
        isChecking ? "text-muted-foreground" : "text-ok",
      )}
    >
      {isChecking ? (
        <LoaderCircle className="size-3.5 shrink-0 animate-spin" />
      ) : (
        <CircleCheck className="size-3.5 shrink-0" />
      )}
      {message.message}
    </span>
  );
};
