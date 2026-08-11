import { Tabs, TabsContent, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { useQueryData } from "@avplatform/ui/hooks";
import { ScrollArea } from "@avplatform/ui/scroll";
import { useState } from "react";

import { NotificationHistoryItem } from "@/react-toolkit/features/unread-notifications/components/notification-history-item";
import { NotificationHistoryFilters } from "@/react-toolkit/features/unread-notifications/components/notification-history-filters";
import { UnreadNotificationItem } from "@/react-toolkit/features/unread-notifications/components/unread-notification-item";
import { UNNoContentMessage } from "@/react-toolkit/features/unread-notifications/components/unread-notifications/UNNoContentMessage";
import { useFetchNotificationHistory } from "@/react-toolkit/features/unread-notifications/hooks/useFetchNotificationHistory";
import { UN_QUERY_KEY } from "@/react-toolkit/features/unread-notifications/constants/constants";
import { UnreadNotificationDto } from "@/react-toolkit/features/unread-notifications/dtos/unread-notification-dto";
import type { NotificationHistoryParams } from "@/react-toolkit/features/unread-notifications/apis/unread-notifications-apis";

/**
 * Renders the tabbed notification center content: Unread and History tabs.
 */
export const UNDialogContent = () => {
  // Get unread notifications data from query client
  const unreadNotifications = useQueryData<UnreadNotificationDto>(UN_QUERY_KEY);

  // Local state for the active tab and history filters
  const [activeTab, setActiveTab] = useState("unread");
  const [historyFilters, setHistoryFilters] = useState<NotificationHistoryParams>({});

  // Fetch notification history with the current filters
  const { data: historyData, isLoading: isHistoryLoading } =
    useFetchNotificationHistory(historyFilters);

  const historyItems = historyData?.data?.items ?? [];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      {/* Tab bar */}
      <TabsList className="mx-3 mt-2 grid w-[calc(100%-1.5rem)] grid-cols-2">
        <TabsTrigger value="unread">Unread</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>

      {/* Unread tab */}
      <TabsContent value="unread" className="mt-0">
        {unreadNotifications?.length === 0 ? (
          <div className="h-[calc(100vh-8rem)]">
            <UNNoContentMessage />
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="py-3">
              {unreadNotifications?.map((item, index) => (
                <UnreadNotificationItem key={index} index={index} data={item} />
              ))}
            </div>
          </ScrollArea>
        )}
      </TabsContent>

      {/* History tab */}
      <TabsContent value="history" className="mt-0">
        {/* Filters */}
        <NotificationHistoryFilters filters={historyFilters} onChange={setHistoryFilters} />

        {isHistoryLoading ? (
          <div className="flex h-[calc(100vh-12rem)] items-center justify-center text-sm text-muted-foreground">
            Loading history...
          </div>
        ) : historyItems.length === 0 ? (
          <div className="h-[calc(100vh-12rem)]">
            <UNNoContentMessage />
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="py-3">
              {historyItems.map((item, index) => (
                <NotificationHistoryItem key={item.id ?? index} index={index} data={item} />
              ))}
            </div>
          </ScrollArea>
        )}
      </TabsContent>
    </Tabs>
  );
};
