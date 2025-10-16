/**
 * Represents a data transfer object (DTO) for Subscription Plans.
 */
export interface SubscriptionPlanDTO {
  /**
   * Gets or sets the primary key of the subscription plan.
   */
  id: string;

  /**
   * Gets or sets the unique name identifier of the subscription plan.
   */
  uniqueName: string;

  /**
   * Gets or sets the name of the subscription plan.
   */
  name: string;

  /**
   * Gets or sets the type of the subscription plan.
   */
  type: "Starter" | "Pro" | "Enterprise";

  /**
   * Gets or sets the billing frequency of the plan.
   */
  frequency: "Monthly" | "Yearly";

  /**
   * Gets or sets the currency in which the plan is priced.
   */
  currency: string;

  /**
   * Gets or sets the maximum number of credits allowed in the plan.
   */
  maxCredits: number;

  /**
   * Gets or sets the maximum number of published items allowed.
   */
  maxPublishedItems: number;

  /**
   * Gets or sets the number of days to retain history.
   */
  historyRetentionDays: number;

  /**
   * Gets or sets the price of the plan based on frequency.
   */
  price: number;

  /**
   * Gets or sets the maximum number of spaces allowed.
   */
  maxSpaces: number;

  /**
   * Gets or sets the total storage limit in megabytes.
   */
  storageLimitMB: number;

  /**
   * Gets or sets the maximum number of users allowed.
   */
  maxUsers: number;

  /**
   * Gets or sets a flag indicating whether the subscription plan is disabled.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets the username of the user who created the subscription plan.
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the subscription plan was created.
   */
  createdOn?: Date | string;

  /**
   * Gets or sets the username of the user who last modified the subscription plan.
   */
  lastModifiedBy?: string | null;

  /**
   * Gets or sets the date and time when the subscription plan was last modified.
   */
  lastModifiedOn?: Date | string;
}
