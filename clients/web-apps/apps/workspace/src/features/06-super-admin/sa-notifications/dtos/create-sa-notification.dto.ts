import {
  AudienceScopeEnum,
  DeliveryChannelEnum,
  NotificationRecurrenceEnum,
  NotificationTypesEnum,
} from "@avplatform/ui/enums";

/**
 * Represents the request payload to create a Super Admin platform-wide notification.
 */
export interface CreateSaNotificationDto {
  /** Notification title. Max 200 characters. */
  title?: string;

  /** Notification message. Max 500 characters. */
  message: string;

  /** Notification type (Information, Warning, Alert, Reminder). */
  type: NotificationTypesEnum;

  /** Optional deep-link URL. Max 1000 characters. */
  actionUrl?: string;

  /** Delivery channel (Email, Platform, Both). */
  deliveryChannel: DeliveryChannelEnum;

  /** Audience scope (AllUsers, SelectedUsers, SelectedTenants). */
  audienceScope: AudienceScopeEnum;

  /** List of target user IDs (used when audienceScope is SelectedUsers). */
  targetUserIds?: string[];

  /** List of target tenant IDs (used when audienceScope is SelectedTenants). */
  targetTenantIds?: string[];

  /** List of role IDs to target. When provided, recipients are users holding these roles. */
  roleIds?: string[];

  /** Scheduled send date/time. Null sends immediately. */
  scheduledFor?: string;

  /** Recurrence frequency of a scheduled notification. */
  recurrenceFrequency?: NotificationRecurrenceEnum;

  /** Recurrence interval (e.g. every N days/weeks/months). */
  recurrenceInterval?: number;

  /** Weekdays on which a weekly notification recurs (1=Mon ... 7=Sun). */
  recurrenceWeekdays?: number[];

  /** Days of the month on which a monthly notification recurs. */
  recurrenceMonthDays?: number[];

  /** Date after which a recurring notification stops being sent. */
  recurrenceEndOn?: string;
}
