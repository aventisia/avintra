namespace AccountsAPIs.Controllers;

[Route("payment")]
[ApiController]
[Authorize]
 public class PaymentController : BaseApiController
 {
    private readonly IPaymentService _PaymentService;

    public PaymentController(IPaymentService paymentService)
    {
      _PaymentService = paymentService;    
    }

    // insert payment
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<PaymentDto>>> InsertPayment ([FromBody] PaymentDto paymentDto)
    {
        return ResultHelper (await _PaymentService.InsertPaymentAsync (paymentDto));
    }
 }