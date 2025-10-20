namespace AccountsAPIs.Controllers;

[Route("payment-histories")]
[ApiController]
[Authorize]
public class PaymentHistoryController : BaseApiController
{
    private readonly IPaymentHistoryService _paymentHistoryService;

    public PaymentHistoryController(IPaymentHistoryService paymentHistoryService)
    {
        _paymentHistoryService = paymentHistoryService;
    }

    // Retrieve a specific payment history record by ID.
    [HttpGet("{paymentHistoryId}")]
    public async Task<ActionResult<ServiceResponse<PaymentHistoryDto>>> GetPaymentHistoryById(Guid paymentHistoryId)
    {
        return ResultHelper(await _paymentHistoryService.GetPaymentHistoryAsync(paymentHistoryId));
    }

    // Retrieve all payment history records.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<PaymentHistoryDto>>>> GetAllPaymentHistories()
    {
        return ResultHelper(await _paymentHistoryService.GetPaymentHistoriesAsync());
    }

    // Insert a new payment history record.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<PaymentHistoryDto>>> CreatePaymentHistory([FromBody] PaymentHistoryDto paymentHistoryDto)
    {
        return ResultHelper(await _paymentHistoryService.CreatePaymentHistoryAsync(paymentHistoryDto));
    }

    // Update an existing payment history record.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<PaymentHistoryDto>>> UpdatePaymentHistory([FromBody] PaymentHistoryDto paymentHistoryDto)
    {
        return ResultHelper(await _paymentHistoryService.UpdatePaymentHistoryAsync(paymentHistoryDto));
    }

    // Delete a specific payment history record by ID.
    [HttpDelete("{paymentHistoryId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeletePaymentHistory(Guid paymentHistoryId)
    {
        return ResultHelper(await _paymentHistoryService.DeletePaymentHistoryAsync(paymentHistoryId));
    }

    // Delete multiple payment history records by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultiplePaymentHistories([FromBody] IEnumerable<Guid> ids)
    {
        return ResultHelper(await _paymentHistoryService.DeleteMultiplePaymentHistoriesAsync(ids));
    }
}
