import { useFetchUnreadNotifications } from "@/react-toolkit/features/unread-notifications/hooks/useFetchUnreadNotifications";

/** Keeps the unread notifications count fresh while the signed-in app is mounted. */
export const UnreadNotificationsPoller = () => {
  useFetchUnreadNotifications();
  return null;
};
