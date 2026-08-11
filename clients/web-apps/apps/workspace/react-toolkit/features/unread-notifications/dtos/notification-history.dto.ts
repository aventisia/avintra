/**
 * Represents a single notification history row for the current user.
 */
interface NotificationHistoryDto {
  /** Notification user record primary key */
  id: string;

  /** Notification record primary key */
  notificationId: string;

  /** (optional): The title of the notification */
  title?: string;

  /** The main content of the notification */
  message: string;

  /** The type of notification (e.g., Information, Warning, Alert, Reminder) */
  type: string;

  /** (optional): The source/discriminator of the notification */
  sourceType?: string;

  /** (optional): A URL linking to a specific page or action related to the notification */
  actionUrl?: string;

  /** A flag indicating whether the user has read the notification */
  isRead: boolean;

  /** (optional): The date and time the notification was read */
  readOn?: Date;

  /** The date and time the notification was created */
  createdOn: Date;
}

/**
 * Represents the list of notification history rows for the current user.
 */
interface NotificationHistoryListDto {
  /** The list of notification history items */
  items: NotificationHistoryDto[];
}

export { type NotificationHistoryDto, type NotificationHistoryListDto };
