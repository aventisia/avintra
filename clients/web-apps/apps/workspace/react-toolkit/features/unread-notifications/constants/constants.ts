/**
 * The query key for unread notifications. ["unread-notifications"]
 */
export const UN_QUERY_KEY = ["unread-notifications"];

/**
 * The query key for notification history. ["notification-history"]
 */
export const NOTIFICATION_HISTORY_QUERY_KEY = ["notification-history"];

export const NOTIFICATIONS_ROUTE = "/notifications";

/** Labels for the backend `NotificationSourceEnum` values. */
export const NOTIFICATION_SOURCE_LABELS: Record<string, string> = {
  Manual: "Announcement",
  NewTicket: "New ticket",
  TicketUpdate: "Ticket update",
  TicketComment: "Ticket comment",
  AgentPublished: "Agent published",
  LowCredit: "Low credits",
  SubscriptionRenewal: "Subscription",
};
