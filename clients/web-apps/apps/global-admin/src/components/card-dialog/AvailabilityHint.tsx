import { cn } from "@avplatform/ui/lib";
import { type CustomFormMessage } from "@avplatform/ui/types";
import { CheckCircleIcon, CircleNotchIcon } from "@phosphor-icons/react";

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
        <CircleNotchIcon className="size-3.5 shrink-0 animate-spin" />
      ) : (
        <CheckCircleIcon className="size-3.5 shrink-0" />
      )}
      {message.message}
    </span>
  );
};
