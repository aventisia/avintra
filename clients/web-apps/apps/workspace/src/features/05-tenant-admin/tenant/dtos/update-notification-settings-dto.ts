/**
 * Represents a partial update to a tenant's automatic notification control settings.
 * Each property is nullable so that omitted properties are left unchanged:
 * - `true` — enable the notification type.
 * - `false` — disable the notification type.
 * - `null`/absent — leave the current value unchanged.
 */
export interface UpdateNotificationSettingsDto {
  /**
   * Gets or sets the desired state for the "Low Credit" automatic notification.
   * `null` means no change.
   */
  lowCredits?: boolean | null;

  /**
   * Gets or sets the desired state for the "Subscription" automatic notification.
   * `null` means no change.
   */
  subscription?: boolean | null;

  /**
   * Gets or sets the desired state for the "Publish Agent" automatic notification.
   * `null` means no change.
   */
  publishAgent?: boolean | null;
}
