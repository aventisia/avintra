namespace AccountsAPIs.Controllers;

[Route("invoice")]
[ApiController]
[Authorize]

public class InvoiceController : BaseApiController
{
  private readonly IInvoiceService _invoiceService;
  public InvoiceController(IInvoiceService invoiceService)
  {
    _invoiceService = invoiceService;
  }

  // Retrive all Invoices list.
  [HttpGet("invoice-list")]
  public async Task<ActionResult<ServiceResponse<IEnumerable<InvoiceDto>>>> GetAllInvoice()
  {
    return ResultHelper(await _invoiceService.GetAllInvoiceAsync());
  }

  //Retrieves all invoices list associated with a specific subscription.
  [HttpGet("list/{subscriptionId}")]
  public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetInvoiceBySubscription (Guid subscriptionId)
  {
    return ResultHelper(await _invoiceService.GetInvoiceBySubscriptionAsync(subscriptionId));
  }

  // Retrive invoice by Id
  [HttpGet("{id}")]
  public async Task<ActionResult<ServiceResponse<InvoiceDto>>> GetInvoice(Guid id)
  {
    return ResultHelper(await _invoiceService.GetInvoiceAsync(id));
  }

  // Create a new Invoice
  [HttpPost("insert-invoice")]
  public async Task<ActionResult<ServiceResponse<InvoiceDto>>> InsertInvoice([FromBody] InvoiceDto invoiceDto)
  {
    return ResultHelper(await _invoiceService.InsertInvoiceAsync(invoiceDto));
  }

  // Update Invoice
  [HttpPut("update-invoice")]
  public async Task<ActionResult<ServiceResponse<GenerateInvoiceDto>>> UpdateInvoice([FromBody] GenerateInvoiceDto invoiceDto)
  {
    return ResultHelper(await _invoiceService.UpdateInvoiceAsync(invoiceDto));
  }

  // Delete Invoice by Id
  [HttpDelete("delete/{id}")]
  public async Task<ActionResult<ServiceResponse<bool>>> DeleteInvoice (Guid id)
  {
    return ResultHelper(await _invoiceService.DeleteInvoiceAsync(id));
  }

  // Generate a new Invoice
  [HttpPost("generate-invoice")]
  public async Task<ActionResult<ServiceResponse<GenerateInvoiceDto>>> GenerateInvoice ([FromBody]GenerateInvoiceDto invoiceDto)
  {
    return ResultHelper(await _invoiceService.GenerateInvoiceAsync(invoiceDto));
  }
}namespace AccountsAPIs.Controllers;

[Route("invoice")]
[ApiController]
[Authorize]

public class InvoiceController : BaseApiController
{
  private readonly IInvoiceService _invoiceService;
  public InvoiceController(IInvoiceService invoiceService)
  {
    _invoiceService = invoiceService;
  }

  // Retrive all Invoices list.
  [HttpGet("invoice-list")]
  public async Task<ActionResult<ServiceResponse<IEnumerable<InvoiceDto>>>> GetAllInvoice()
  {
    return ResultHelper(await _invoiceService.GetAllInvoiceAsync());
  }

  //Retrieves all invoices list associated with a specific subscription.
  [HttpGet("list/{subscriptionId}")]
  public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetInvoiceBySubscription (Guid subscriptionId)
  {
    return ResultHelper(await _invoiceService.GetInvoiceBySubscriptionAsync(subscriptionId));
  }

  // Retrive invoice by Id
  [HttpGet("{id}")]
  public async Task<ActionResult<ServiceResponse<InvoiceDto>>> GetInvoice(Guid id)
  {
    return ResultHelper(await _invoiceService.GetInvoiceAsync(id));
  }

  // Create a new Invoice
  [HttpPost("insert-invoice")]
  public async Task<ActionResult<ServiceResponse<InvoiceDto>>> InsertInvoice([FromBody] InvoiceDto invoiceDto)
  {
    return ResultHelper(await _invoiceService.InsertInvoiceAsync(invoiceDto));
  }

  // Update Invoice
  [HttpPut("update-invoice")]
  public async Task<ActionResult<ServiceResponse<GenerateInvoiceDto>>> UpdateInvoice([FromBody] GenerateInvoiceDto invoiceDto)
  {
    return ResultHelper(await _invoiceService.UpdateInvoiceAsync(invoiceDto));
  }

  // Delete Invoice by Id
  [HttpDelete("delete/{id}")]
  public async Task<ActionResult<ServiceResponse<bool>>> DeleteInvoice (Guid id)
  {
    return ResultHelper(await _invoiceService.DeleteInvoiceAsync(id));
  }

  // Generate a new Invoice
  [HttpPost("generate-invoice")]
  public async Task<ActionResult<ServiceResponse<GenerateInvoiceDto>>> GenerateInvoice ([FromBody]GenerateInvoiceDto invoiceDto)
  {
    return ResultHelper(await _invoiceService.GenerateInvoiceAsync(invoiceDto));
  }
}