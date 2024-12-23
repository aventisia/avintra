namespace AccountsAPIs.Services;

public interface IPaymentService
{
    Task<ServiceResponse<PaymentDto>> GetPaymentAsync (Guid id);
    Task<ServiceResponse<IEnumerable<PaymentDto>>> GetPaymentInvoiceAsync (Guid invoiceId);
    Task<ServiceResponse<PaymentDto>> InsertPaymentAsync (PaymentDto paymentDto);
}