import { cn } from "@avplatform/ui/lib";
import { formatDistanceToNow } from "date-fns";
import { memo } from "react";

import { UNIActions } from "@/react-toolkit/features/unread-notifications/components/unread-notification-item/UNIActions";
import { UNTypeIcon } from "@/react-toolkit/features/unread-notifications/components/unread-notification-item/UNTypeIcon";
import { UnreadNotificationDto } from "@/react-toolkit/features/unread-notifications/dtos/unread-notification-dto";
import { extractNotificationUrl } from "@/react-toolkit/features/unread-notifications/utils/extract-notification-url";

interface UnreadNotificationItemProps {
  /** Index of the notification item in the list */
  index: number;

  /** Unread notification data */
  data: UnreadNotificationDto;
}

/**
 * Renders a single unread notification item.
 *
 * @param {number} props.index - The index of the notification item.
 * @param {Object} props.data - The data of the notification item.
 * @returns {JSX.Element} The rendered UnreadNotificationItem component.
 */
export const UnreadNotificationItem = memo(({ data }: UnreadNotificationItemProps) => {
  // Format the time since the notification was created
  const formattedTime = formatDistanceToNow(data.createdOn, {
    addSuffix: true,
  });

  // Resolve the navigation target. Prefer the dedicated action URL, but fall
  // back to any URL embedded in the message body so clicking a notification
  // always takes the user somewhere useful.
  const targetUrl = data.actionUrl || extractNotificationUrl(data.message);

  // Return the notification item
  return (
    <a
      href={targetUrl}
      className={cn(
        "group relative mx-3 flex gap-3 rounded-xl p-2.5 leading-[1.1rem] hover:bg-accent",
        targetUrl && "cursor-pointer",
      )}
    >
      {/* Mark as read Button with Tooltip */}
      <UNIActions id={data.id} />

      {/* Notification type icon */}
      <UNTypeIcon type={data.type} />

      {/* Notification container for title, message and time */}
      <div className="mr-7 flex flex-col gap-1">
        {/* Title */}
        {data.title ? (
          <p className="flex items-center text-xs font-medium tracking-wide text-foreground">
            {data.title}
          </p>
        ) : null}
        {/* Message */}
        <p className="flex items-center text-xs tracking-wide text-foreground">{data.message}</p>
        {/* Time */}
        <div className="flex items-center text-2xs text-muted-foreground">
          <span>{formattedTime}</span>
        </div>
      </div>
    </a>
  );
});
