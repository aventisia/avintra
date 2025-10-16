export interface IBillingData {
  organizationName: string;
  addressLine1: string;
  addressLine2?: string;
  gstNumber?: string;
  state?: string;
  city: string;
  postalCode: string;
  country: string;
  isWillingToFileGst?: boolean;
}
