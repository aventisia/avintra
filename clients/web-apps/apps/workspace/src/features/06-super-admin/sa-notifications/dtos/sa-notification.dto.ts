import {
  AudienceScopeEnum,
  DeliveryChannelEnum,
  NotificationRecurrenceEnum,
  NotificationSourceEnum,
  NotificationStatusEnum,
  NotificationTypesEnum,
} from "@avplatform/ui/enums";

/**
 * Represents a Super Admin platform-wide notification record returned from the API.
 */
export interface SaNotificationDto {
  /** Notification record primary key. */
  id: string;

  /** Notification title. */
  title?: string;

  /** Notification message. */
  message: string;

  /** Notification type. */
  type: NotificationTypesEnum;

  /** Optional deep-link URL. */
  actionUrl?: string;

  /** Notification source/discriminator. */
  sourceType?: NotificationSourceEnum;

  /** Delivery channel. */
  deliveryChannel: DeliveryChannelEnum;

  /** Audience scope. */
  audienceScope?: AudienceScopeEnum;

  /** Lifecycle status. */
  status: NotificationStatusEnum;

  /** Scheduled send date/time. */
  scheduledFor?: string;

  /** Date/time the notification was actually sent. */
  sentOn?: string;

  /** Recurrence frequency of a scheduled notification. */
  recurrenceFrequency?: NotificationRecurrenceEnum;

  /** Recurrence interval (e.g. every N days/weeks/months). */
  recurrenceInterval?: number;

  /** Weekdays on which a weekly notification recurs. */
  recurrenceWeekdays?: number[];

  /** Days of the month on which a monthly notification recurs. */
  recurrenceMonthDays?: number[];

  /** Date after which a recurring notification stops being sent. */
  recurrenceEndOn?: string;

  /** Username of the creator. Response-only. */
  createdBy?: string;

  /** Creation timestamp. Response-only. */
  createdOn?: string;

  /** Username of the last modifier. Response-only. */
  lastModifiedBy?: string;

  /** Last modified timestamp. Response-only. */
  lastModifiedOn?: string;

  /** Number of recipient users of the notification. Response-only. */
  recipientCount: number;

  /** Number of targeted tenants of the notification. Response-only. */
  tenantCount: number;
}
