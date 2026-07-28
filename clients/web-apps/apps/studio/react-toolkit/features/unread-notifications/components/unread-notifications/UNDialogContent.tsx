import { useQueryData } from "@avplatform/ui/hooks";
import { ScrollArea } from "@avplatform/ui/scroll";

import { UnreadNotificationItem } from "@/react-toolkit/features/unread-notifications/components/unread-notification-item";
import { UNNoContentMessage } from "@/react-toolkit/features/unread-notifications/components/unread-notifications/UNNoContentMessage";
import { UN_QUERY_KEY } from "@/react-toolkit/features/unread-notifications/constants/constants";
import { UnreadNotificationDto } from "@/react-toolkit/features/unread-notifications/dtos/unread-notification-dto";

/**
 * Renders a list of unread notifications.
 */
export const UNDialogContent = () => {
  // Get unread notifications data from query client
  const unreadNotifications = useQueryData<UnreadNotificationDto>(UN_QUERY_KEY);

  // Return Unread Notifications List or No Notification Message
  return (
    <>
      {unreadNotifications?.length === 0 ? (
        <UNNoContentMessage />
      ) : (
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="py-3">
            {unreadNotifications?.map((item, index) => (
              <UnreadNotificationItem key={index} index={index} data={item} />
            ))}
          </div>
        </ScrollArea>
      )}
    </>
  );
};
