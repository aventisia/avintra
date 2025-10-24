/**
 * DTO representing the status of a Razorpay payment.
 */
interface PaymentStatusDto {
  /** Indicates whether the payment process has been initiated. */
  isInitiated: boolean;

  /** Indicates whether the payment has been successfully collected from the user. */
  isCollected: boolean;

  /** Indicates whether a billing record has been created  */
  isBillingCreated: boolean;

  /** Indicates whether the user has been successfully subscribed. */
  isSubscribed: boolean;

  /** Indicates whether the user's credit or balance has been updated after payment. */
  isCreditUpdated: boolean;

  /** The unique Razorpay payment ID associated with this transaction. */
  razorpayPaymentId?: string;

  /** The unique Razorpay order ID (if this payment is part of a top up). */
  razorpayOrderId?: string;

  /** The unique Razorpay subscription ID (if this payment is part of a subscription). */
  razorpaySubscriptionId?: string;

  /** A human-readable description or message related to the payment status. */
  description?: string;
}

export { type PaymentStatusDto };
