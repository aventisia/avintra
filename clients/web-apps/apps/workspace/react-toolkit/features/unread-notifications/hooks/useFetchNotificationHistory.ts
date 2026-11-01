import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  type NotificationHistoryParams,
  getNotificationHistory,
} from "@/react-toolkit/features/unread-notifications/apis/unread-notifications-apis";
import { NOTIFICATION_HISTORY_QUERY_KEY } from "@/react-toolkit/features/unread-notifications/constants/constants";

/** Fetches the user's notifications matching the filters, keeping the last list while refiltering. */
export const useFetchNotificationHistory = (params: NotificationHistoryParams) =>
  useQuery({
    queryKey: [...NOTIFICATION_HISTORY_QUERY_KEY, params],
    queryFn: () => getNotificationHistory(params),
    select: (response) => response.data.items,
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  });
