import { BellIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { useUnreadNotificationsStore } from "@/react-toolkit/features/unread-notifications/stores/unread-notifications-store";

/**
 * Renders a bell icon with a red dot if there are any unread notifications.
 */
export const UNBellIcon = () => {
  // Get store state
  const { unreadCount } = useUnreadNotificationsStore(
    useShallow((state) => ({
      unreadCount: state.unreadCount,
    })),
  );

  // Return Bell icon with red dot if there are any unread notifications
  return (
    <div className="relative flex h-5 w-5 items-center justify-center">
      <BellIcon className="h-5 w-5 text-ink-2" />
      {unreadCount > 0 ? (
        <span className="absolute right-0.5 top-[0.08rem] block h-2 w-2 rounded-full bg-destructive" />
      ) : null}
    </div>
  );
};
