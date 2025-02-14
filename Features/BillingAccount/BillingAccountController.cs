namespace AccountsAPIs.Controllers;

[Route("billing-account")]
[ApiController]
[Authorize]
public class BillingAccountController(IBillingAccountService billingAccountService) : BaseApiController
{
    private readonly IBillingAccountService _billingAccountService = billingAccountService;

    // Gets a list of billing accounts
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<IEnumerable<BillingAccountDto>>>> GetBillingAccountList()
    {
        return ResultHelper(await _billingAccountService.GetBillingAccountListAsync());
    }

    // Creates a new billing account
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<BillingAccountDto>>> InsertBillingAccount([FromBody] BillingAccountDto billingAccountDto)
    {
        return ResultHelper(await _billingAccountService.InsertBillingAccountAsync(billingAccountDto));
    }

    // Updates a billing account
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<BillingAccountDto>>> UpdateBillingAccount([FromBody] BillingAccountDto billingAccountDto)
    {
        return ResultHelper(await _billingAccountService.UpdateBillingAccountAsync(billingAccountDto));
    }

    // Deletes a billing account permanently
    [HttpDelete("delete/{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteBillingAccount(Guid id)
    {
        return ResultHelper(await _billingAccountService.DeleteBillingAccountAsync(id));
    }
}