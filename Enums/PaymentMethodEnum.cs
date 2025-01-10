namespace AspNetToolkit.Enums;

/// <summary>
/// Enum representing the payment method for payment. <br/>
/// </summary>
/// <remarks>
/// IMPORTANT NOTE: Any changes to this file should be manually synced with front-end enum file.
/// </remarks>

public enum PaymentMethodEnum
{
    CreditCard,
    DebitCard,
    BankTransfer,
    Cash,
    PayPal,
    UPI,
    Other
}
