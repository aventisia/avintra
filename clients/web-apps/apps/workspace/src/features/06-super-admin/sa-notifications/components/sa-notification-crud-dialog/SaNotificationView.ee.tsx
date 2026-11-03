import { EmptyState, LoadingSpinner, Separator } from "@avplatform/ui";
import {
  ViewContainer,
  ViewDefaultCard,
  ViewField,
  ViewInfoRow,
  ViewInfoRowsCard,
} from "@avplatform/ui/components/view-record";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { formatDate } from "@avplatform/ui/utils";
import { BellIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";

import { getSaNotification } from "../../apis/sa-notification-apis.ee";
import { formatEnumLabel } from "../../constants/sa-notifications-table.constant.ee";

interface SaNotificationViewProps {
  rowId: string;
}

/**
 * Renders the details of a Super Admin notification in a read-only view.
 * Fetches the notification data from the API using the rowId from the crud dialog store.
 */
export const SaNotificationView = ({ rowId }: SaNotificationViewProps) => {
  // Fetch the notification data from the API
  const { data: response, isLoading } = useQuery({
    queryKey: ["sa-notification", rowId],
    queryFn: () => getSaNotification(rowId),
    enabled: !!rowId,
  });

  const notification = response?.data;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-3 text-sm">
        <LoadingSpinner className="size-8 text-primary" />
        Loading notification details...
      </div>
    );
  }

  // If the notification data is not found, display a message indicating that the record is not available
  if (!notification) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <EmptyState
          className="-mt-20"
          Icon={BellIcon}
          primaryMessage="Notification record is not available."
          secondaryMessage="Try refreshing the page and opening this record again."
        />
      </div>
    );
  }

  return (
    <ViewContainer>
      <ViewDefaultCard>
        {/* Notification profile section */}
        <div className="flex flex-col gap-1">
          <p className="text-2xs uppercase tracking-wide text-muted-foreground">Notification</p>
          <p className="text-base font-medium leading-tight">
            {notification.title || FALLBACK_VALUE}
          </p>
        </div>

        {/* Message section */}
        <div className="flex flex-col gap-1">
          <p className="text-2xs uppercase tracking-wide text-muted-foreground">Message</p>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {notification.message}
          </p>
        </div>

        {/* Type, Status, Delivery, Source, Audience section */}
        <div className="grid grid-cols-2 gap-2">
          <ViewField label="ID" value={notification.id} className="break-all font-mono" />
          <ViewField label="Type" value={formatEnumLabel(notification.type)} />
          <ViewField label="Status" value={formatEnumLabel(notification.status)} />
          <ViewField label="Delivery" value={formatEnumLabel(notification.deliveryChannel)} />
          <ViewField label="Source" value={formatEnumLabel(notification.sourceType)} />
          <ViewField label="Audience" value={formatEnumLabel(notification.audienceScope)} />
          <ViewField
            label="Action URL"
            value={notification.actionUrl || FALLBACK_VALUE}
            className="break-all"
          />
        </div>
      </ViewDefaultCard>

      {/* Schedule section */}
      <ViewInfoRowsCard
        title="Schedule"
        icon={<BellIcon className="size-3.5 text-muted-foreground" />}
      >
        <ViewInfoRow label="Scheduled for" value={formatDate(notification.scheduledFor, true)} />
        <Separator className="h-[0.5px]" />
        <ViewInfoRow label="Sent on" value={formatDate(notification.sentOn, true)} />
        <Separator className="h-[0.5px]" />
        <ViewInfoRow label="Recurrence" value={formatEnumLabel(notification.recurrenceFrequency)} />
        <Separator className="h-[0.5px]" />
        <ViewInfoRow
          label="Recurrence end"
          value={formatDate(notification.recurrenceEndOn, true)}
        />
      </ViewInfoRowsCard>

      {/* Audit trail section */}
      <ViewInfoRowsCard
        title="Audit trail"
        icon={<BellIcon className="size-3.5 text-muted-foreground" />}
      >
        <ViewInfoRow label="Created by" value={notification.createdBy} />
        <Separator className="h-[0.5px]" />
        <ViewInfoRow label="Created on" value={formatDate(notification.createdOn, true)} />
        <Separator className="h-[0.5px]" />
        <ViewInfoRow label="Last modified by" value={notification.lastModifiedBy} />
        <Separator className="h-[0.5px]" />
        <ViewInfoRow
          label="Last modified on"
          value={formatDate(notification.lastModifiedOn, true)}
        />
      </ViewInfoRowsCard>
    </ViewContainer>
  );
};
