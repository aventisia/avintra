import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { MetaLine } from "@avplatform/ui/meta-line";
import { Tooltip } from "@avplatform/ui/tooltip";
import { CheckIcon } from "@phosphor-icons/react";
import { format, formatDistanceToNow } from "date-fns";

import { NOTIFICATION_SOURCE_LABELS } from "@/react-toolkit/features/unread-notifications/constants/constants";
import type { NotificationHistoryDto } from "@/react-toolkit/features/unread-notifications/dtos/notification-history.dto";
import { useMarkNotificationAsRead } from "@/react-toolkit/features/unread-notifications/hooks/useMarkNotificationAsRead";

import { NotificationTypeIcon } from "./NotificationTypeIcon";

// TODO: link rows to `actionUrl` (or `extractNotificationUrl(message)`) once the backend sends
// routes the app has; today every backend link points to a missing page, so rows are not clickable.
export const NotificationRow = ({ notification }: { notification: NotificationHistoryDto }) => {
  const { mutate: markAsRead, isPending } = useMarkNotificationAsRead();
  const { title, message, type, sourceType, isRead, createdOn } = notification;
  const heading = title || message;
  const createdAt = new Date(createdOn);

  return (
    <li className="group relative flex gap-3.5 px-4 py-3.5 transition-colors duration-[120ms] hover:bg-hover">
      <NotificationTypeIcon type={type} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-3">
          <p
            className={cn(
              "min-w-0 flex-1 break-words text-body-sm",
              isRead ? "text-ink-2" : "font-medium text-ink",
            )}
          >
            {heading}
          </p>
          <time
            dateTime={createdAt.toISOString()}
            title={format(createdAt, "PPpp")}
            className="shrink-0 pt-px text-xs tabular-nums text-muted-foreground"
          >
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </time>
        </div>
        {title && (
          <p className="mt-0.5 whitespace-pre-line break-words text-body-sm text-ink-2">
            {message}
          </p>
        )}
        <MetaLine
          className="mt-1.5 text-xs text-muted-foreground"
          items={[sourceType && NOTIFICATION_SOURCE_LABELS[sourceType], type]}
        />
      </div>
      <div className="relative flex w-7 shrink-0 justify-center self-start">
        {isRead ? null : (
          <>
            <span
              aria-hidden="true"
              className="mt-1.5 size-2 rounded-full bg-primary group-focus-within:hidden group-hover:hidden"
            />
            <Tooltip content="Mark as read" side="left">
              <Button
                variant="outline"
                size="icon7"
                aria-label="Mark as read"
                disabled={isPending}
                onClick={() => markAsRead(notification.notificationId)}
                className="absolute -top-0.5 bg-surface opacity-0 focus-visible:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100"
              >
                <CheckIcon className="size-3.5" />
              </Button>
            </Tooltip>
          </>
        )}
      </div>
    </li>
  );
};
