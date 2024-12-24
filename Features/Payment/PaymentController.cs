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

  //Retrive a specific payment by ID.
  [HttpGet("{id}")]
  public async Task<ActionResult<ServiceResponse<PaymentDto>>> GetPayment(Guid id)
  {
    return ResultHelper(await _PaymentService.GetPaymentAsync(id));
  }

  //Get all payments for an invoice.
  [HttpGet("list/{invoiceId}")]
  public async Task<ActionResult<ServiceResponse<IEnumerable<PaymentDto>>>> GetPaymentInvoice(Guid invoiceId)
  {
    return ResultHelper(await _PaymentService.GetPaymentInvoiceAsync(invoiceId));
  }

  // Insert a new payment Record.
  [HttpPost("insert-payment")]
  public async Task<ActionResult<ServiceResponse<PaymentDto>>> InsertPayment([FromBody] PaymentDto paymentDto)
  {
    return ResultHelper(await _PaymentService.InsertPaymentAsync(paymentDto));
  }
}