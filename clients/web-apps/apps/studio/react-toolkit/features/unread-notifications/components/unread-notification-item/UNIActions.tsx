import { Button } from "@avplatform/ui/buttons";
import { Tooltip } from "@avplatform/ui/tooltip";
import { CheckIcon } from "@phosphor-icons/react";

import { useMarkNotificationAsRead } from "@/react-toolkit/features/unread-notifications/hooks/useMarkNotificationAsRead";

interface UNIActionsProps {
  /** Unread notification record id */
  id: string;
}

/**
 * Renders the actions for an unread notification item.
 * The actions include a button to mark the notification as read.
 */
export const UNIActions = ({ id }: UNIActionsProps) => {
  // Get the mutation function and isPending flag
  const { handleMutateMarkAsRead } = useMarkNotificationAsRead(id);

  // return the action buttons
  return (
    <Tooltip content="Mark as read" side="left" className="text-xs">
      <Button
        variant={"outline"}
        size={"icon7"}
        className="absolute right-3 top-3 z-10 bg-surface opacity-0 hover:bg-hover group-hover:opacity-100"
        onClick={(e) => {
          // mutate the notification as read
          handleMutateMarkAsRead();

          // Stop the event propagation
          e.preventDefault();
        }}
      >
        <CheckIcon className="h-3.5 w-3.5" />
      </Button>
    </Tooltip>
  );
};
