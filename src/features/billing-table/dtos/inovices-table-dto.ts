/**
 * Represents a data transfer object (DTO) for a billingplan.
 */
export interface InovicesTableDto {
  /**
   * Gets or sets the billingplan record's primary key.
   *
   * Note: Not making it required because the same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the plan billing Component.
   *
   */
  billingComponent: string;

  /**
   * Gets or sets the plan tenantType.
   *
   */
  tenantType: string;

  /**
   * Gets or sets the plan tenant Name.
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
  billingFrequency: string;

  /**
   * Gets or sets the plan cola.
   *
   */
  cola: number;

  /**
   * Gets or sets a flag indicating whether the billingplan record is disabled.
   *
   * Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets the username of the user who created the billingplan record.
   * This property is intended for use in responses only and should not be included in requests.
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the billingplan record was created.
   * This property is intended for use in responses only and should not be included in requests.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the billingplan record.
   * This property is intended for use in responses only and should not be included in requests.
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the billingplan record was last modified.
   * This property is intended for use in responses only and should not be included in requests.
   */
  lastModifiedOn?: Date;
}
