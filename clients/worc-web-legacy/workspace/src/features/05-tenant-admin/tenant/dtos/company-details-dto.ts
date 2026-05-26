/**
 * Represents a data transfer object (DTO) for company details.
 */
export interface CompanyDetailsDTO {
  /**
   * Gets or sets the primary key of the company details id.
   */
  id?: string;

  /**
   * Gets or sets the name of the organization.
   */
  organizationName: string;

  /**
   * Gets or sets the first line of the company's address.
   */
  addressLine1: string;

  /**
   * Gets or sets the second line of the company's address (optional).
   */
  addressLine2?: string;

  /**
   * Gets or sets the city where the company is located.
   */
  city: string;

  /**
   * Gets or sets the postal code for the company's address.
   */
  postalCode: string;

  /**
   * Gets or sets the state or region of the company.
   */
  state: string;

  /**
   * Gets or sets the country where the company is located.
   */
  country: string;

  /**
   * Gets or sets a flag indicating whether the company is willing to file for GST.
   */
  isWillingToFileGst: boolean;

  /**
   * Gets or sets the GST number of the company (optional).
   * This is required if the company is willing to file GST.
   */
  gstNumber?: string;

  /**
   * Gets or sets the billing email address for the company (optional).
   */
  billingEmail: string;

  /**
   * Gets or sets the contact person for the company (optional).
   */
  contactPerson: string;
}
