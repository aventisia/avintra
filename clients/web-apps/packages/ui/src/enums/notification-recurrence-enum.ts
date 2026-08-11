/**
 * Enum representing the recurrence frequency of a scheduled notification.
 * IMPORTANT NOTE: Any changes to this file should be manually synced with back-end enum file.
 */
export enum NotificationRecurrenceEnum {
  /** Represents a one-time notification (no recurrence). */
  None = "None",

  /** Represents a notification that recurs daily. */
  Daily = "Daily",

  /** Represents a notification that recurs weekly on selected weekdays. */
  Weekly = "Weekly",

  /** Represents a notification that recurs monthly on selected days of the month. */
  Monthly = "Monthly",
}
