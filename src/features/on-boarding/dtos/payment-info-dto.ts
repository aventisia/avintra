/** Payment Info DTO */
interface PaymentInfoDto {
  /** Unique identifier for the payment request */
  id: string;

  /** Tenant identifier */
  tenantId: string;

  /** Payment frequency (e.g., Monthly, Yearly) */
  frequency: string;

  /** Current payment status (e.g., Pending, Completed) */
  paymentStatus: string;

  /** Whether the payment request is active or not */
  isActive: boolean;

  /** Available credit for the tenant */
  availableCredit: number;

  /** Optional name associated with the payment (could be a subscription name or user name) */
  name?: string;

  /** ID of the plan associated with the payment */
  planId: string;

  /** Whether the payment is disabled or not */
  isDisabled: boolean;

  /** Date when the payment request was created */
  createdOn: string;

  /** Date when the payment request was last modified */
  lastModifiedOn: string;

  /** Razorpay payment URL for redirection */
  razorpayPaymentUrl?: string;

  razorpaySubscriptionId?: string;

  razorpayOrderId?: string;
}

export { type PaymentInfoDto };
