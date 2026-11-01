import { format, isSameYear, isToday, isYesterday, startOfDay } from "date-fns";

import type { NotificationHistoryDto } from "@/react-toolkit/features/unread-notifications/dtos/notification-history.dto";

export type NotificationDayGroup = { label: string; items: NotificationHistoryDto[] };

const getDayLabel = (day: Date) => {
  if (isToday(day)) return "Today";
  if (isYesterday(day)) return "Yesterday";
  return format(day, isSameYear(day, new Date()) ? "EEEE, MMM d" : "MMM d, yyyy");
};

/** Splits a newest-first list into one group per local calendar day, keeping the order. */
export const groupNotificationsByDay = (items: NotificationHistoryDto[]) =>
  items.reduce<NotificationDayGroup[]>((groups, item) => {
    const label = getDayLabel(startOfDay(new Date(item.createdOn)));
    const last = groups.at(-1);
    if (last?.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
    return groups;
  }, []);
