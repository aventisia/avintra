import { UserAvatarBaseDto } from "@avplatform/ui/dtos";

/**
 * Represents the data structure for an unread notification.
 *
 * Note: UserAvatar details could be null if notification was not created by user's action.
 * if null then check notification type to show relavent icon for the notification
 */
interface UnreadNotificationDto extends UserAvatarBaseDto {
  /** Notification primary key. A unique identifier for each notification */
  id: string;

  /** Notification message. The main content of the notification */
  message: string;

  /** The date and time the notification was created */
  createdOn: Date;

  /** (optional): The type of notification (e.g., info, warning, alert, reminder) */
  type?: string;

  /** (optional): A URL linking to a specific page or action related to the notification */
  actionUrl?: string;

  /** A flag indicating whether the user has read the notification */
  isRead: boolean;
}

export { type UnreadNotificationDto };
