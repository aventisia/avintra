export interface CompanyDetailsDTO {
  id?: string;
  organizationName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  state: string;
  country: string;
  isWillingToFileGst: boolean;
  gstNumber?: string;
}
