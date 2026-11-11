namespace AccountsAPIs.Services;

/// <summary>
/// Defines the contract for managing payment method operations.
/// </summary>
public interface IPaymentMethodService
{
    /// <summary>
    /// Retrieves a payment method by its unique identifier.
    /// </summary>
    /// <param name="paymentMethodId">The ID of the payment method to retrieve.</param>
    /// <returns>A task that returns a service response containing the payment method details.</returns>
    Task<ServiceResponse<PaymentMethodDto>> GetPaymentMethodAsync(Guid paymentMethodId);

    /// <summary>
    /// Retrieves all available payment methods.
    /// </summary>
    /// <returns>A task that returns a service response containing a list of payment methods.</returns>
    Task<ServiceResponse<IEnumerable<PaymentMethodDto>>> GetPaymentMethodsAsync();

    /// <summary>
    /// Creates a new payment method record.
    /// </summary>
    /// <param name="paymentMethodDto">The data for the new payment method.</param>
    /// <returns>A task that returns a service response containing the created payment method details.</returns>
    Task<ServiceResponse<PaymentMethodDto>> CreatePaymentMethodAsync(PaymentMethodDto paymentMethodDto);

    /// <summary>
    /// Updates an existing payment method record.
    /// </summary>
    /// <param name="paymentMethodDto">The updated payment method data.</param>
    /// <returns>A task that returns a service response containing the updated payment method details.</returns>
    Task<ServiceResponse<PaymentMethodDto>> UpdatePaymentMethodAsync(PaymentMethodDto paymentMethodDto);

    /// <summary>
    /// Deletes a specific payment method by its ID.
    /// </summary>
    /// <param name="paymentMethodId">The ID of the payment method to delete.</param>
    /// <returns>A task that returns a service response indicating the result of the deletion.</returns>
    Task<ServiceResponse<bool>> DeletePaymentMethodAsync(Guid paymentMethodId);

    /// <summary>
    /// Deletes multiple payment methods by their IDs.
    /// </summary>
    /// <param name="paymentMethodIds">A list of IDs of payment methods to delete.</param>
    /// <returns>A task that returns a service response indicating the result of the batch deletion.</returns>
    Task<ServiceResponse<bool>> DeleteMultiplePaymentMethodsAsync(IEnumerable<Guid> paymentMethodIds);
}
