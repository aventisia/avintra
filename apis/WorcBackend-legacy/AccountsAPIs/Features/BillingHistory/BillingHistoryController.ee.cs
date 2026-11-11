namespace AccountsAPIs.Controllers;

[Route("billing-detail")]
[ApiController]
[Authorize(Roles = "TA")]
public class BillingHistoryController : BaseApiController
{
    private readonly IBillingHistoryService _billingHistoryService;

    public BillingHistoryController(IBillingHistoryService billingHistoryService)
    {
        _billingHistoryService = billingHistoryService;
    }

    // Gets a list of billing history records for the tenant
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<BillingHistoryDto>>>> GetBillingHistoryList()
    {
        var result = await _billingHistoryService.GetBillingHistoryListAsync();
        return ResultHelper(result);
    }

    // Creates a new billing history record
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<BillingHistoryDto>>> InsertBillingHistory([FromBody] BillingHistoryDto billingHistoryDto)
    {
        var result = await _billingHistoryService.InsertBillingHistoryAsync(billingHistoryDto);
        return ResultHelper(result);
    }

    // Updates an existing billing history record
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<BillingHistoryDto>>> UpdateBillingHistory([FromBody] BillingHistoryDto billingHistoryDto)
    {
        var result = await _billingHistoryService.UpdateBillingHistoryAsync(billingHistoryDto);
        return ResultHelper(result);
    }

    // Deletes a billing history record permanently by ID
    [HttpDelete("{billingHistoryId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteBillingHistory(Guid billingHistoryId)
    {
        var result = await _billingHistoryService.DeleteBillingHistoryAsync(billingHistoryId);
        return ResultHelper(result);
    }
}
