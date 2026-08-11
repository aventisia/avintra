/**
 * Enum representing the audience scope of a manually created Notification.
 * IMPORTANT NOTE: Any changes to this file should be manually synced with back-end enum file.
 */
export enum AudienceScopeEnum {
  /** Represents delivery to all users in the target tenant(s). */
  AllUsers = "AllUsers",

  /** Represents delivery to a specific set of selected users. */
  SelectedUsers = "SelectedUsers",

  /** Represents delivery to all users holding the selected roles. */
  SelectedRoles = "SelectedRoles",

  /** Represents delivery to all users of selected tenant(s). Only available to Super Admins. */
  SelectedTenants = "SelectedTenants",
}
