namespace AccountsAPIs.Services;

public interface IPaymentService
{
    /// <summary>
    /// Get payment .
    /// </summary>
    /// <returns>The task result contains the service response with the get payment details.</returns>
    Task<ServiceResponse<PaymentDto>> GetPaymentAsync (Guid id);

    /// <summary>
    /// Get payment list by InvoiceId.
    /// </summary>
    /// <param name="invoiceId">The data required to payment list by InvoiceId.</param>
    /// <returns>The task result contains the service response with the payment list by InvoiceId details.</returns>

    Task<ServiceResponse<IEnumerable<PaymentDto>>> GetPaymentInvoiceAsync (Guid invoiceId);

    /// <summary>
    /// Inserts a new payment.
    /// </summary>
    /// <param name="paymentDto">The data required to insert the payment.</param>
    /// <returns>The task result contains the service response with the inserted payment details.</returns>

    Task<ServiceResponse<PaymentDto>> InsertPaymentAsync (PaymentDto paymentDto);

    /// <summary>
    /// Update payment status.
    /// </summary>
    /// <param name="paymentStatusDto">The data required to update the payment status.</param>
    /// <returns>The task result contains the service response with the updated payment status details.</returns>

    Task<ServiceResponse<PaymentStatusDto>> UpdatePaymentStatusAsync (PaymentStatusDto paymentStatusDto);
}