/**
 * Represents the full set of per-tenant automatic notification control settings.
 * Each property maps to a single controllable notification type and indicates whether
 * that type is currently enabled for the tenant.
 */
export interface NotificationSettingsDto {
  /**
   * Gets or sets the unique identifier (ID) of the tenant these settings belong to.
   */
  tenantId: string;

  /**
   * Gets or sets a value indicating whether the "Low Credit" automatic notification
   * is enabled for the tenant.
   */
  lowCredits: boolean;

  /**
   * Gets or sets a value indicating whether the "Subscription" automatic notification
   * is enabled for the tenant.
   */
  subscription: boolean;

  /**
   * Gets or sets a value indicating whether the "Publish Agent" automatic notification
   * is enabled for the tenant.
   */
  publishAgent: boolean;
}
