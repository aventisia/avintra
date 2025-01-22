import { useUnreadNotificationsStore } from "@/react-toolkit/features/unread-notifications/stores/unread-notifications-store";
import { BellIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

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
    <div className="relative h-5 w-5">
      <BellIcon className="h-5 w-5 text-[--icon-color]" />
      {unreadCount > 0 ? (
        <span className="absolute right-0.5 top-[0.08rem] block h-2 w-2 rounded-full bg-destructive" />
      ) : null}
    </div>
  );
};
