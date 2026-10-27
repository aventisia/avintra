import { NoContentMessage } from "@avplatform/ui";
import { cn } from "@avplatform/ui/lib";
import { BellSlashIcon } from "@heroicons/react/24/outline";

interface UNNoContentMessageProps {
  /** (Optional): Additional class name to override the empty-state container */
  className?: string;
  primaryMessage?: string;
  secondaryMessage?: string;
}

/**
 * Renders a message indicating that there are no new notifications.
 */
export const UNNoContentMessage = ({
  className,
  primaryMessage = "You're all caught up!",
  secondaryMessage = "You have no new notifications",
}: UNNoContentMessageProps) => {
  return (
    <NoContentMessage
      className={cn("h-full w-full", className)}
      Icon={BellSlashIcon}
      primaryMessage={primaryMessage}
      secondaryMessage={secondaryMessage}
    />
  );
};
