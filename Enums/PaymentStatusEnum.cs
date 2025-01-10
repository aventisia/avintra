namespace AspNetToolkit.Enums;

/// <summary>
/// Enum representing the payment status for payment. <br/>
/// </summary>
/// <remarks>
/// IMPORTANT NOTE: Any changes to this file should be manually synced with front-end enum file.
/// </remarks>

public enum PaymentStatusEnum
{
    Pending,
    Successful,
    Failed,
    Refunded,
    Canceled
}
