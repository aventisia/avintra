import { NoContentMessage } from "@avplatform/ui";
import { BellSlashIcon } from "@heroicons/react/24/outline";
import { cn } from "@avplatform/ui/lib";

interface UNNoContentMessageProps {
  /** (Optional): Additional class name to override the empty-state container */
  className?: string;
}

/**
 * Renders a message indicating that there are no new notifications.
 */
export const UNNoContentMessage = ({ className }: UNNoContentMessageProps) => {
  return (
    <NoContentMessage
      className={cn("h-full w-full", className)}
      Icon={BellSlashIcon}
      primaryMessage="You're all caught up!"
      secondaryMessage="You have no new notifications"
    />
  );
};
