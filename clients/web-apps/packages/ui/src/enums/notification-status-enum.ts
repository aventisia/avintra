/**
 * Enum representing the lifecycle status of a Notification.
 * IMPORTANT NOTE: Any changes to this file should be manually synced with back-end enum file.
 */
export enum NotificationStatusEnum {
  /** Represents a notification that has been drafted but not yet sent. */
  Draft = "Draft",

  /** Represents a notification that has been scheduled to be sent at a future date/time. */
  Scheduled = "Scheduled",

  /** Represents a notification that has been sent. Sent notifications are immutable. */
  Sent = "Sent",

  /** Represents a notification whose sending failed. */
  Failed = "Failed",
}
