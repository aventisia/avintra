/**
 * Represents a data transfer object (DTO) for payment method details.
 */
export interface PaymentMethodDTO {
  /**
   * Gets or sets the unique payment identifier of the payment history.
   */
  id: string;
  /**
   * Gets or sets the name.
   */

  name?: string;
  /**
   * Gets or sets the Razorpay-assigned identifier for the saved or tokenized payment method.
   */
  razorpayMethodId?: string;

  /**
   * Gets or sets the type of payment method (e.g., Card, UPI, Wallet).
   */
  type?: PaymentMethodTypesEnum;

  /**
   * Gets or sets the name of the digital wallet used (e.g., Paytm, AmazonPay). Only applicable when the method is `Wallet`.
   */
  wallet?: string;

  /**
   * Gets or sets the Virtual Payment Address (VPA) for UPI payments. Only applicable when the method is `UPI`.
   */
  vpa?: string;

  /**
   * Gets or sets the last four digits of the card used.
   */
  cardLast4?: string;

  /**
   * Gets or sets the card network (e.g., Visa, MasterCard).
   */
  cardNetwork?: CardNetworkTypesEnum;

  /**
   * Gets or sets the type of card used (e.g., Credit, Debit).
   */
  cardType?: CardTypesEnum;

  /**
   * Gets or sets the name of the card issuer (e.g., HDFC Bank, SBI).
   */
  cardIssuer?: string;

  /**
   * Gets or sets a value indicating whether the card is international.
   */
  cardInternational: boolean;
}

/**
 * Enum for the different payment method types.
 */
export enum PaymentMethodTypesEnum {
  Card = "Card",
  Upi = "Upi",
  Wallet = "Wallet",
}

/**
 * Enum for the different card network types.
 */
export enum CardNetworkTypesEnum {
  Visa = "Visa",
  MasterCard = "MasterCard",
  Amex = "Amex",
  Discover = "Discover",
}

/**
 * Enum for the different card types.
 */
export enum CardTypesEnum {
  Credit = "Credit",
  Debit = "Debit",
}
