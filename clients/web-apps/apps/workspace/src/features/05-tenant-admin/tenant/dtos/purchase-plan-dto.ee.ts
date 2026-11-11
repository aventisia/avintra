import { PlanFrequency } from "../types/plan-type.ee";

/** Purchase Plan dto */
interface PurchasePlanDto {
  /** ID of the subscription plan */
  planId: string;

  /** Frequency of plan - e.g., Monthly, Yearly */
  frequency: PlanFrequency;

  /** Address Line 1 */
  addressLine1: string;

  /** Address Line 2 (optional) */
  addressLine2?: string;

  /** City name */
  city: string;

  /** Postal or ZIP code */
  postalCode: string;

  /** State name */
  state: string;

  /** Country name */
  country: string;

  /** Whether the user is willing to file GST */
  isWillingToFileGst: boolean;

  /** GST number (if applicable) */
  gstNumber?: string;

  /** Subscription amount */
  amount: number;

  /** Tax rate applied to the subscription */
  taxRate: number;
}

export { type PurchasePlanDto };
