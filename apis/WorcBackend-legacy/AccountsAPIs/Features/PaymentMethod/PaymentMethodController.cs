namespace AccountsAPIs.Controllers;

[Route("payment-methods")]
[ApiController]
[Authorize(Roles = "TA")]
public class PaymentMethodController : BaseApiController
{
    private readonly IPaymentMethodService _paymentMethodService;

    public PaymentMethodController(IPaymentMethodService paymentMethodService)
    {
        _paymentMethodService = paymentMethodService;
    }

    // Retrieve a specific payment method by ID.
    [HttpGet("{paymentMethodId}")]
    public async Task<ActionResult<ServiceResponse<PaymentMethodDto>>> GetPaymentMethodById(Guid paymentMethodId)
    {
        return ResultHelper(await _paymentMethodService.GetPaymentMethodAsync(paymentMethodId));
    }

    // Retrieve all payment methods.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<PaymentMethodDto>>>> GetAllPaymentMethods()
    {
        return ResultHelper(await _paymentMethodService.GetPaymentMethodsAsync());
    }

    // Insert a new payment method.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<PaymentMethodDto>>> CreatePaymentMethod([FromBody] PaymentMethodDto paymentMethodDto)
    {
        return ResultHelper(await _paymentMethodService.CreatePaymentMethodAsync(paymentMethodDto));
    }

    // Update an existing payment method.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<PaymentMethodDto>>> UpdatePaymentMethod([FromBody] PaymentMethodDto paymentMethodDto)
    {
        return ResultHelper(await _paymentMethodService.UpdatePaymentMethodAsync(paymentMethodDto));
    }

    // Delete a specific payment method by ID.
    [HttpDelete("{paymentMethodId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeletePaymentMethod(Guid paymentMethodId)
    {
        return ResultHelper(await _paymentMethodService.DeletePaymentMethodAsync(paymentMethodId));
    }

    // Delete multiple payment methods by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultiplePaymentMethods([FromBody] IEnumerable<Guid> ids)
    {
        return ResultHelper(await _paymentMethodService.DeleteMultiplePaymentMethodsAsync(ids));
    }
}
