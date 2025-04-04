/**
 * Represents a data transfer object (DTO) for a inovice.
 */
export interface InovicesTableDto {
  /**
   * Gets or sets the inovice record's primary key.
   *
   * Note: Not making it required because the same DTO is used for insert and update.
   */
  id?: string;

  /**
   * get subscription id of the inovice
   */
  subscriptionId: string;

  /**
   * get the amount of the subscription.
   */
  amount: number;

  /**
   * get the generated date of the the inovice
   */
  generatedDate: Date;

  /**
   * get wheather the subscription is paid or not
   */
  isPaid: boolean;

  /**
   * get the date of the payment
   */
  paidOn: Date;

  /**
   * get the inovice number of the subscription
   */
  invoiceNumber: string;

  /**
   * get the effective date of the inovice
   */
  invoiceDate: Date;

  /**
   * get the tax percentage
   */
  tax: number;

  /**
   * get the discount on the subscription
   */
  discount: number;

  /**
   * total amount of subscription including the tax
   */
  totalAmount: number;

  /**
   * subscription due date
   */
  dueDate: Date;

  /**
   * status of the payment
   */
  status: string;

  /**
   * Gets or sets a flag indicating whether the inovice record is disabled.
   *
   * Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets the username of the user who created the inovice record.
   * This property is intended for use in responses only and should not be included in requests.
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the inovice record was created.
   * This property is intended for use in responses only and should not be included in requests.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the inovice record.
   * This property is intended for use in responses only and should not be included in requests.
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the inovice record was last modified.
   * This property is intended for use in responses only and should not be included in requests.
   */
  lastModifiedOn?: Date;
}
