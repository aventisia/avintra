/**
 * Represents the main subscription DTO containing plan and payment information.
 */
export interface CurrentPlanDto {
  /**
   * Gets or sets the current plan details.
   */
  currentPlan: PlanDto;

  /**
   * Gets or sets the next payment details.
   */
  nextPayment: NextPaymentDto;
}

/**
 * Represents a data transfer object (DTO) for the current subscription plan.
 */
export interface PlanDto {
  /**
   * Gets or sets the name of the subscription plan.
   */
  planName: string;

  /**
   * Gets or sets the type of the subscription plan (e.g., Starter, Pro, Enterprise, Commercial).
   */
  planType: string;

  /**
   * Gets or sets the frequency of the subscription plan (e.g., Monthly, Yearly).
   */
  frequency: string;

  /**
   * Gets or sets the price of the subscription plan.
   */
  price: number;

  /**
   * Gets or sets the currency used for the subscription plan.
   */
  currency: string;

  /**
   * Gets or sets the number of available credits for the subscription.
   */
  availableCredits: number;

  /**
   * Gets or sets the feature details for the subscription plan.
   */
  feature: PlanFeatureDto;

  /**
   * Gets or sets the usage details for the subscription plan.
   */
  usage: PlanUsageDto[];

  expiredOn?: Date | string;

  isActive?: boolean;

  isRecurringPayment?: boolean;

  planId?: string;

  subscriptionId?: string;
}

/**
 * Represents a data transfer object (DTO) for the features of the subscription plan.
 */
export interface PlanFeatureDto {
  /**
   * Gets or sets the maximum number of credits available for the plan.
   */
  maxCredits: number;

  /**
   * Gets or sets the maximum number of published items allowed by the plan.
   */
  maxPublishedItems: number;

  /**
   * Gets or sets the history retention duration in days.
   */
  historyRetentionDays: number;

  /**
   * Gets or sets the maximum number of spaces available for the plan.
   */
  maxSpaces: number;

  /**
   * Gets or sets the storage limit in MB.
   */
  storageLimitMB: number;

  /**
   * Gets or sets the maximum number of users allowed by the plan.
   */
  maxUsers: number;
}

/**
 * Represents a data transfer object (DTO) for the usage details of the subscription plan.
 */
export interface PlanUsageDto {
  /**
   * Gets or sets the name of the resource (e.g., PublishedItems, Spaces, Storage).
   */
  resourceName: string;

  /**
   * Gets or sets the amount of the resource used.
   */
  used: number;

  /**
   * Gets or sets the limit of the resource.
   */
  limit: number;

  /**
   * Gets or sets the unit of measurement for the resource (e.g., number, MB).
   */
  unit: string;
}

/**
 * Represents a data transfer object (DTO) for the next payment details.
 */
export interface NextPaymentDto {
  /**
   * Gets or sets the due date for the next payment.
   */
  dueDate: string; // Consider changing to Date type if necessary.

  /**
   * Gets or sets the subscription fee for the next payment.
   */
  subscriptionFee: number;

  /**
   * Gets or sets the tax amount for the next payment.
   */
  tax: number;

  /**
   * Gets or sets the total amount due for the next payment (including tax).
   */
  totalAmount: number;
}
