/** Credit TopUp  dto */
interface CreditTopUpDto {
  /** Total amount against top-up credits */
  amount: number;

  /** Currency */
  currency: string;

  /** Whether tax included in amount */
  includeTax: boolean;

  /** Total number of credits to top-up */
  credits: number;

  /** OrderId received in response */
  razorpayId?: string;

  type?: "Subscription" | "TopUp" | "Addon";

  /** SubscriptionId received in response */
  subscriptionId?: string;
}

export { type CreditTopUpDto };
