namespace AccountsAPIs.Controllers;

[Route("top-up")]
[ApiController]
[Authorize]
public class TopUpController : BaseApiController
{
    private readonly ITopUpService _topUpService;

    public TopUpController(ITopUpService topUpService)
    {
        _topUpService = topUpService;
    }

    // Initiates a new top-up transaction for a tenant.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<RazorpayOrderRequestDto>>> CreateTopUp(RazorpayOrderRequestDto razorpayOrderRequestDto)
    {
        return ResultHelper(await _topUpService.CreateTopUpAsync(razorpayOrderRequestDto));
    }
}
