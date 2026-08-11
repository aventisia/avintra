import { DotSeparator } from "@avplatform/ui";
import { cn } from "@avplatform/ui/lib";
import { formatDistanceToNow } from "date-fns";
import { memo } from "react";

import { UNTypeIcon } from "@/react-toolkit/features/unread-notifications/components/unread-notification-item/UNTypeIcon";
import { NotificationHistoryDto } from "@/react-toolkit/features/unread-notifications/dtos/notification-history.dto";

interface NotificationHistoryItemProps {
  /** Index of the history item in the list */
  index: number;

  /** Notification history data */
  data: NotificationHistoryDto;
}

/**
 * Renders a single notification history item.
 *
 * @param {number} props.index - The index of the history item.
 * @param {Object} props.data - The data of the history item.
 * @returns {JSX.Element} The rendered NotificationHistoryItem component.
 */
export const NotificationHistoryItem = memo(({ data }: NotificationHistoryItemProps) => {
  // Format the time since the notification was created
  const formattedTime = formatDistanceToNow(data.createdOn, {
    addSuffix: true,
  });

  // Return the history item
  return (
    <a
      href={data.actionUrl}
      className={cn(
        "group relative mx-3 flex gap-3 rounded-xl p-2.5 leading-[1.1rem] hover:bg-accent",
        data.actionUrl && "cursor-pointer",
      )}
    >
      {/* Notification type icon */}
      <UNTypeIcon type={data.type} />

      {/* Notification container for title, message and time */}
      <div className="mr-7 flex flex-col gap-1">
        {/* Title (optional) */}
        {data.title ? (
          <p className="flex items-center text-xs font-medium tracking-wide text-foreground">
            {data.title}
          </p>
        ) : null}
        {/* Message */}
        <p className="flex items-center text-xs tracking-wide text-foreground">{data.message}</p>
        {/* Time and read status */}
        <div className="flex items-center text-2xs text-muted-foreground">
          <span>{formattedTime}</span>
          <DotSeparator />
          <span>{data.isRead ? "Read" : "Unread"}</span>
        </div>
      </div>
    </a>
  );
});
