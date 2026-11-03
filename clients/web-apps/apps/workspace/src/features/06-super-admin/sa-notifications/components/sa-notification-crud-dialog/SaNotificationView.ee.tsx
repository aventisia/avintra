import { useQuery } from "@tanstack/react-query";

import { NotificationRecordSheet } from "@/features/notifications";

import { getSaNotification } from "../../apis/sa-notification-apis.ee";

type SaNotificationViewProps = {
  rowId: string;
};

/**
 * Read-only super admin notification record, with the tenants it reaches.
 */
export const SaNotificationView = ({ rowId }: SaNotificationViewProps) => {
  const { data: response, isLoading } = useQuery({
    queryKey: ["sa-notification", rowId],
    queryFn: () => getSaNotification(rowId),
    enabled: !!rowId,
  });

  const notification = response?.data;

  return (
    <NotificationRecordSheet
      notification={notification}
      isLoading={isLoading}
      tenantCount={notification?.tenantCount}
    />
  );
};
