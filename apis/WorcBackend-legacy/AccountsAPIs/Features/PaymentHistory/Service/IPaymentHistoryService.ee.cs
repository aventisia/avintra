namespace AccountsAPIs.Services;

/// <summary>
/// Defines the contract for managing payment history operations.
/// </summary>
public interface IPaymentHistoryService
{
    /// <summary>
    /// Retrieves a payment history record by its ID.
    /// </summary>
    /// <param name="paymentHistoryId">The unique ID of the payment history to retrieve.</param>
    /// <returns>A task that returns a service response containing the payment history details.</returns>
    Task<ServiceResponse<PaymentHistoryDto>> GetPaymentHistoryAsync(Guid paymentHistoryId);

    /// <summary>
    /// Retrieves all available payment history records.
    /// </summary>
    /// <returns>A task that returns a service response containing a list of payment histories.</returns>
    Task<ServiceResponse<IEnumerable<PaymentHistoryDto>>> GetPaymentHistoriesAsync();

    /// <summary>
    /// Creates a new payment history record.
    /// </summary>
    /// <param name="paymentHistoryDto">The data for the new payment history record.</param>
    /// <returns>A task that returns a service response containing the created payment history details.</returns>
    Task<ServiceResponse<PaymentHistoryDto>> CreatePaymentHistoryAsync(PaymentHistoryDto paymentHistoryDto);

    /// <summary>
    /// Updates an existing payment history record.
    /// </summary>
    /// <param name="paymentHistoryDto">The updated payment history data.</param>
    /// <returns>A task that returns a service response containing the updated payment history details.</returns>
    Task<ServiceResponse<PaymentHistoryDto>> UpdatePaymentHistoryAsync(PaymentHistoryDto paymentHistoryDto);

    /// <summary>
    /// Deletes a specific payment history record by its ID.
    /// </summary>
    /// <param name="paymentHistoryId">The unique ID of the payment history to delete.</param>
    /// <returns>A task that returns a service response indicating the result of the deletion.</returns>
    Task<ServiceResponse<bool>> DeletePaymentHistoryAsync(Guid paymentHistoryId);

    /// <summary>
    /// Deletes multiple payment history records by their IDs.
    /// </summary>
    /// <param name="paymentHistoryIds">A collection of IDs representing the payment histories to delete.</param>
    /// <returns>A task that returns a service response indicating the result of the batch deletion.</returns>
    Task<ServiceResponse<bool>> DeleteMultiplePaymentHistoriesAsync(IEnumerable<Guid> paymentHistoryIds);
}