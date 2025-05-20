export interface BillingAddressDto {
  /**
   * Gets or sets the billing address record's primary key.
   *
   * Note: Not making it required because the same DTO is used for insert and update.
   */
  id: string;
  /**
   * get or set name of the user whos getting the bill.
   */
  name: string;

  /**
   * get or set email of the user whos getting the bill
   */
  email: string;

  /**
   * get or set address line 1 of the user whos getting the bill
   */
  addressLine1: string;

  /**
   * get or set address line 2 of the user whos getting the bill
   */
  addressLine2?: string;

  /**
   * get or set city of the address
   */
  city: string;

  /**
   * get or set state of the address
   */
  state: string;

  /**
   * get or set country of the address
   */
  country: string;

  /**
   * get or set taxId of the bill
   */
  taxId: string;

  /**
   * get or set pinCode of the address
   */
  pinCode: string;

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
