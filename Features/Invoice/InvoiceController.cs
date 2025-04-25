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

  // Retrieve all Invoices list.
  [HttpGet("list")]
  public async Task<ActionResult<ServiceResponse<IEnumerable<InvoiceDto>>>> GetAllInvoice()
  {
    return ResultHelper(await _invoiceService.GetAllInvoicesAsync());
  }

  //Retrieves all invoices list associated with a specific pricing plan.
  [HttpGet("list/{pricingPlanId}")]
  public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetInvoiceBySubscription (Guid pricingPlanId)
  {
    return ResultHelper(await _invoiceService.GetInvoicesByPricingPlanAsync(pricingPlanId));
  }

  // Retrieve invoice by Id
  [HttpGet("{invoiceId}")]
  public async Task<ActionResult<ServiceResponse<InvoiceDto>>> GetInvoice(Guid invoiceId)
  {
    return ResultHelper(await _invoiceService.GetInvoiceByIdAsync(invoiceId));
  }

  // Create a new Invoice
  [HttpPost]
  public async Task<ActionResult<ServiceResponse<InvoiceDto>>> InsertInvoice([FromBody] InvoiceDto invoiceDto)
  {
    return ResultHelper(await _invoiceService.CreateInvoiceAsync(invoiceDto));
  }

  // Update Invoice
  [HttpPut]
  public async Task<ActionResult<ServiceResponse<GenerateInvoiceDto>>> UpdateInvoice([FromBody] GenerateInvoiceDto invoiceDto)
  {
    return ResultHelper(await _invoiceService.UpdateInvoiceAsync(invoiceDto));
  }

  // Delete Invoice by Id
  [HttpDelete("delete/{invoiceId}")]
  public async Task<ActionResult<ServiceResponse<bool>>> DeleteInvoice (Guid invoiceId)
  {
    return ResultHelper(await _invoiceService.DeleteInvoiceAsync(invoiceId));
  }

  // Generate a new Invoice
  [HttpPost("generate-invoice")]
  public async Task<ActionResult<ServiceResponse<GenerateInvoiceDto>>> GenerateInvoice ([FromBody]GenerateInvoiceDto invoiceDto)
  {
    return ResultHelper(await _invoiceService.GenerateInvoiceAsync(invoiceDto));
  }
}