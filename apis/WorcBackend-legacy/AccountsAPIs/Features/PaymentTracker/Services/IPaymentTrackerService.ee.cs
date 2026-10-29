namespace AccountsAPIs.Services;

/// <summary>
/// Defines the operations for retrieving and managing payment tracking details.
/// </summary>
public interface IPaymentTrackerService
{
    /// <summary>
    /// Retrieves the payment tracker details by the specified payment ID.
    /// </summary>
    /// <param name="paymentId">The unique identifier of the payment or transaction.</param>
    /// <returns>A <see cref="Task"/> representing the asynchronous operation, with a result of type <see cref="ServiceResponse{PaymentTrackerDto}"/> containing the details of the payment transaction status.</returns>
    Task<ServiceResponse<PaymentTrackerDto>> GetByPaymentIdAsync(string paymentId);
}
