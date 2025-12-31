/**
 * Represents a data transfer object (DTO) for a pricingplan.
 */
export interface PricingPlanDto {
  /**
   * Gets or sets the pricingplan record's primary key.
   *
   * Note: Not making it required because the same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the plan for tenant id.
   *
   */
  tenantId: string;

  /**
   * Gets or sets the plan pricing Component.
   *
   */
  pricingComponent: string;

  /**
   * Gets or sets the plan Type.
   *
   */
  tenantType: string;

  /**
   * Gets or sets the plan Name.
   *
   */
  tenantName: string;

  /**
   * Gets or sets the plan currency.
   *
   */
  currency: string;

  /**
   * Gets or sets the plan unit.
   *
   */
  unit: string;

  /**
   * Gets or sets the plan unit Price.
   *
   */
  unitPrice: number;

  /**
   * Gets or sets the plan billing Frequency.
   *
   */
  frequency: string;

  /**
   * Gets or sets the plan cola.
   *
   */
  cola: number;

  /**
   * Gets or sets a flag indicating whether the pricingplan record is disabled.
   *
   * Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets the username of the user who created the pricingplan record.
   * This property is intended for use in responses only and should not be included in requests.
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the pricingplan record was created.
   * This property is intended for use in responses only and should not be included in requests.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the pricingplan record.
   * This property is intended for use in responses only and should not be included in requests.
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the pricingplan record was last modified.
   * This property is intended for use in responses only and should not be included in requests.
   */
  lastModifiedOn?: Date;
}
