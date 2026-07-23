/**
 * Represents a data transfer object (DTO) for a my account.
 */
export interface UserBillingAddressDto {
  tenantName?: string;
  designation?: string;
  addressLine1?: string;
  addressLine2?: string;
  country?: string;
  stateOrProvince?: string;
  city?: string;
  zipOrPostalCode?: string;
}
