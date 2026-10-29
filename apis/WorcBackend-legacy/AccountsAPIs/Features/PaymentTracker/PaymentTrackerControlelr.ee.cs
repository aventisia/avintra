namespace AccountsAPIs.Controllers;

[Route("payment-tracker")]
[ApiController]
[Authorize]
public class PaymentTrackerControlelr : BaseApiController
{
    private readonly IPaymentTrackerService _paymentTrackerService;

    public PaymentTrackerControlelr(IPaymentTrackerService paymentTrackerService)
    {
        _paymentTrackerService = paymentTrackerService;
    }

    // Get payment status detail.
    [HttpGet("{paymentId}")]
    public async Task<ActionResult<ServiceResponse<PaymentTrackerDto>>> CreateTopUp(string paymentId)
    {
        return ResultHelper(await _paymentTrackerService.GetByPaymentIdAsync(paymentId));
    }
}
