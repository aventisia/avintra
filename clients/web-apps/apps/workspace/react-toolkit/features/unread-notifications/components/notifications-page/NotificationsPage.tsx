import { EmptyState, Skeleton } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";
import { Tabs, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { BellOffIcon, CheckCheckIcon, SearchXIcon } from "lucide-react";
import { useState } from "react";

import {
  SEGMENTED_TABS_LIST_CLASS,
  SEGMENTED_TABS_TRIGGER_CLASS,
} from "@/components/segmented-tabs.constant";
import { useFetchNotificationHistory } from "@/react-toolkit/features/unread-notifications/hooks/useFetchNotificationHistory";
import { useUnreadNotificationsStore } from "@/react-toolkit/features/unread-notifications/stores/unread-notifications-store";
import { groupNotificationsByDay } from "@/react-toolkit/features/unread-notifications/utils/group-notifications-by-day.util";

import { type NotificationFilterValues, NotificationFilters } from "./NotificationFilters";
import { NotificationRow } from "./NotificationRow";

type View = "unread" | "all";

const ListSkeleton = () => (
  <div className="space-y-2.5">
    <Skeleton className="h-3.5 w-20 rounded-sm" />
    <Skeleton className="h-[19rem] rounded-lg" />
  </div>
);

const NotificationList = ({
  view,
  filters,
  onShowAll,
  onClearFilters,
}: {
  view: View;
  filters: NotificationFilterValues;
  onShowAll: () => void;
  onClearFilters: () => void;
}) => {
  const query = useFetchNotificationHistory({
    ...filters,
    isRead: view === "unread" ? false : undefined,
  });
  const isFiltered = Object.values(filters).some(Boolean);

  const items = query.data ?? [];
  if (query.isLoading || (query.isPlaceholderData && items.length === 0)) return <ListSkeleton />;

  if (query.isError) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface px-5 py-4">
        <p className="text-body-sm text-ink-2">Couldn't load your notifications.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => query.refetch()}
          disabled={query.isRefetching}
        >
          Try again
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    const empty = isFiltered
      ? {
          Icon: SearchXIcon,
          primary: "No notifications match these filters",
          secondary: "Try another type, source or date range.",
          action: { label: "Clear filters", onClick: onClearFilters },
        }
      : view === "unread"
        ? {
            Icon: CheckCheckIcon,
            primary: "You're all caught up",
            secondary: "New notifications show up here until you mark them as read.",
            action: { label: "See all notifications", onClick: onShowAll },
          }
        : {
            Icon: BellOffIcon,
            primary: "No notifications yet",
            secondary:
              "Announcements from your admins and updates on tickets, credits and agents show up here.",
          };
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-line py-14">
        <EmptyState
          Icon={empty.Icon}
          primaryMessage={empty.primary}
          secondaryMessage={empty.secondary}
        />
        {empty.action && (
          <Button variant="outline" size="sm" onClick={empty.action.onClick}>
            {empty.action.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-8 transition-opacity",
        query.isPlaceholderData && "pointer-events-none opacity-60",
      )}
    >
      {groupNotificationsByDay(items).map((group) => (
        <section key={group.label} aria-label={group.label} className="space-y-2.5">
          <h2 className="flex items-center gap-2 text-label uppercase text-muted-foreground">
            {group.label}
            <span className="font-mono tabular-nums">{group.items.length}</span>
          </h2>
          <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
            {group.items.map((notification) => (
              <NotificationRow key={notification.id} notification={notification} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

/** Inbox of the notifications sent to the signed-in user, unread first. */
export const NotificationsPage = () => {
  useDocumentTitle("Notifications");
  const unreadCount = useUnreadNotificationsStore((state) => state.unreadCount);
  const [view, setView] = useState<View>("unread");
  const [filters, setFilters] = useState<NotificationFilterValues>({});

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16 pt-6">
      <header>
        <h1 className="text-title text-ink">Notifications</h1>
        <p className="mt-[5px] text-[13px] text-muted-foreground">
          Announcements from your admins and updates on your tickets, credits and agents.
        </p>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={view} onValueChange={(next) => setView(next as View)}>
          <TabsList aria-label="Show" className={SEGMENTED_TABS_LIST_CLASS}>
            <TabsTrigger value="unread" className={SEGMENTED_TABS_TRIGGER_CLASS}>
              Unread
              {unreadCount > 0 && (
                <span className="rounded-sm bg-primary/15 px-1.5 font-mono text-[11px] tabular-nums text-primary-text">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="all" className={SEGMENTED_TABS_TRIGGER_CLASS}>
              All
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <NotificationFilters filters={filters} onChange={setFilters} />
      </div>
      <NotificationList
        view={view}
        filters={filters}
        onShowAll={() => setView("all")}
        onClearFilters={() => setFilters({})}
      />
    </div>
  );
};
