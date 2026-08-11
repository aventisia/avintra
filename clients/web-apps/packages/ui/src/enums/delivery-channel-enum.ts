/**
 * Enum representing the delivery channel of a Notification.
 * IMPORTANT NOTE: Any changes to this file should be manually synced with back-end enum file.
 */
export enum DeliveryChannelEnum {
  /** Represents delivery via email. */
  Email = "Email",

  /** Represents delivery via the in-app platform (bell icon). */
  Platform = "Platform",

  /** Represents delivery via both email and the in-app platform. */
  Both = "Both",
}
