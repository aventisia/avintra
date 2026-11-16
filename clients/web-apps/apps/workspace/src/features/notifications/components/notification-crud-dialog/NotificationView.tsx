import { useQuery } from "@tanstack/react-query";

import { getNotification } from "../../apis/notification-apis";
import { NotificationRecordSheet } from "./NotificationRecordSheet";

type NotificationViewProps = {
  rowId: string;
};

/**
 * Read-only tenant notification record.
 */
export const NotificationView = ({ rowId }: NotificationViewProps) => {
  const { data: response, isLoading } = useQuery({
    queryKey: ["notification", rowId],
    queryFn: () => getNotification(rowId),
    enabled: !!rowId,
  });

  return <NotificationRecordSheet notification={response?.data} isLoading={isLoading} />;
};
