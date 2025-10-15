namespace AccountsAPIs.Controllers;

[Route("billing-detail")]
[ApiController]
[Authorize]
public class BillingDetailController : BaseApiController
{
    private readonly IBillingDetailService _BillingDetailService;

    public BillingDetailController(IBillingDetailService BillingDetailService)
    {
        _BillingDetailService = BillingDetailService;
    }

    // Gets a list of billing accounts
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<BillingAccountDetailsDto>>>> GetBillingDetailList()
    {
        return ResultHelper(await _BillingDetailService.GetBillingDetailListAsync());
    }

    // Creates a new billing account
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<BillingDetailDto>>> InsertBillingDetail([FromBody] BillingDetailDto BillingDetailDto)
    {
        return ResultHelper(await _BillingDetailService.InsertBillingDetailAsync(BillingDetailDto));
    }

    // Updates a billing account
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<BillingDetailDto>>> UpdateBillingDetail([FromBody] BillingDetailDto BillingDetailDto)
    {
        return ResultHelper(await _BillingDetailService.UpdateBillingDetailAsync(BillingDetailDto));
    }

    // Deletes a billing account permanently
    [HttpDelete("{billingDetailId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteBillingDetail(Guid billingDetailId)
    {
        return ResultHelper(await _BillingDetailService.DeleteBillingDetailAsync(billingDetailId));
    }
}