import { DeliveryChannelEnum } from "@avplatform/ui/enums";

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

  /**
   * Gets or sets a value indicating whether the "Agent Risk Assessment Approval"
   * automatic notification is enabled for the tenant. When enabled, the designated
   * approver is notified when an agent risk assessment is submitted for approval.
   */
  agentRiskAssessmentApproval: boolean;

  /**
   * Gets or sets the number of days before the subscription renewal date at which the
   * renewal reminder starts being sent to the Tenant Admin. Required and must be greater
   * than zero. Defaults to 7.
   */
  subscriptionRenewalReminderDays: number;

  /**
   * Gets or sets the credit balance threshold below which the Tenant Admin is notified
   * that the credit balance is low. Required and must be greater than zero. Defaults to 1000.
   */
  lowCreditThreshold: number;

  /**
   * Gets or sets the delivery channel used for automatic notifications.
   * Supported values: Platform, Email, or Both. Defaults to Platform.
   */
  deliveryChannel: DeliveryChannelEnum;
}
