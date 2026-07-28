import { NoContentMessage } from "@avplatform/ui";
import { BellSlashIcon } from "@heroicons/react/24/outline";

/**
 * Renders a message indicating that there are no new notifications.
 */
export const UNNoContentMessage = () => {
  return (
    <NoContentMessage
      className="-mt-16"
      Icon={BellSlashIcon}
      primaryMessage="You're all caught up!"
      secondaryMessage="You have no new notifications"
    />
  );
};
