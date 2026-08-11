/**
 * Enum representing the source of a Notification.
 * IMPORTANT NOTE: Any changes to this file should be manually synced with back-end enum file.
 */
export enum NotificationSourceEnum {
  /** Represents a notification created manually by an admin. */
  Manual = "Manual",

  /** Represents a system-generated notification when a new ticket or change request is created. */
  NewTicket = "NewTicket",

  /** Represents a system-generated notification when a support ticket is updated. */
  TicketUpdate = "TicketUpdate",

  /** Represents a system-generated notification when a comment is posted on a support ticket. */
  TicketComment = "TicketComment",

  /** Represents a system-generated notification when an agent is published. */
  AgentPublished = "AgentPublished",

  /** Represents a system-generated notification when a tenant's credit balance falls below the configured threshold. */
  LowCredit = "LowCredit",

  /** Represents a system-generated notification reminding the tenant admin of an upcoming subscription renewal. */
  SubscriptionRenewal = "SubscriptionRenewal",
}
