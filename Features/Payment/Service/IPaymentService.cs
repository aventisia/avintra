namespace AccountsAPIs.Services;

public interface IPaymentService
{
    Task<ServiceResponse<PaymentDto>> InsertPaymentAsync (PaymentDto paymentDto);
}