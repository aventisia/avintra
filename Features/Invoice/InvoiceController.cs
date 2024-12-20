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

   // Create a new Invoice
   [HttpPost]
   public async Task<ActionResult<ServiceResponse<InvoiceDto>>> InsertInvoice([FromBody] InvoiceDto invoiceDto)
   {
    return ResultHelper(await _invoiceService.InsertInvoiceAsync(invoiceDto));
   }

   // Update Invoice
   [HttpPut]
   public async Task<ActionResult<ServiceResponse<InvoiceDto>>> UpdateInvoice([FromBody]InvoiceDto invoiceDto)
   {
    return ResultHelper(await _invoiceService.UpdateInvoiceAsync(invoiceDto));
   }
}