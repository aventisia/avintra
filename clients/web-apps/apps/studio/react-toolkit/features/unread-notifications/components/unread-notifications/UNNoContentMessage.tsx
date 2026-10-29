import { EmptyState } from "@avplatform/ui";
import { cn } from "@avplatform/ui/lib";
import { BellOffIcon } from "lucide-react";

interface UNNoContentMessageProps {
  /** (Optional): Additional class name to override the empty-state container */
  className?: string;
}

/**
 * Renders a message indicating that there are no new notifications.
 */
export const UNNoContentMessage = ({ className }: UNNoContentMessageProps) => {
  return (
    <EmptyState
      className={cn("h-full w-full", className)}
      Icon={BellOffIcon}
      primaryMessage="You're all caught up!"
      secondaryMessage="You have no new notifications"
    />
  );
};
