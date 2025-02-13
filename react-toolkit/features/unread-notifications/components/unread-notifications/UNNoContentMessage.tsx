import { NoContentMessage } from "@/react-toolkit/ui/custom/NoContentMessage";
import { BellSlashIcon } from "@heroicons/react/24/outline";

/**
 * Renders a message indicating that there are no new notifications.
 */
export const UNNoContentMessage = () => {
  return (
    <NoContentMessage
      className="mb-12"
      Icon={BellSlashIcon}
      primaryMessage="You're all caught up!"
      secondaryMessage="You have no new notifications"
    />
  );
};
