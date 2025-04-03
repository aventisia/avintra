namespace AccountsAPIs.Controllers;

[Route("license-credit")]
[ApiController]
[Authorize]
public class LicenseCreditController : BaseApiController
{
    private readonly ILicenseCreditService _licenseCreditService;

    public LicenseCreditController(ILicenseCreditService licenseCreditService)
    {
        _licenseCreditService = licenseCreditService;
    }

    // Retrieves all license credits created by the user.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<LicenseCreditDto>>>> GetLicenseCredits()
    {
        return ResultHelper(await _licenseCreditService.GetLicenseCreditsAsync());
    }

    // Retrieves all license credits created by the user.
    [HttpGet("my")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<MyLicenseCreditDto>>>> GetMyLicenseCredits()
    {
        return ResultHelper(await _licenseCreditService.GetMyLicenseCreditsAsync());
    }

    // Retrieves a license credit by its ID.
    [HttpGet("{licenseCreditId}")]
    public async Task<ActionResult<ServiceResponse<LicenseCreditDto>>> GetLicenseCreditByIdAsync(Guid licenseCreditId)
    {
        return ResultHelper(await _licenseCreditService.GetLicenseCreditByIdAsync(licenseCreditId));
    }

    // Inserts a new license credit.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<LicenseCreditDto>>> InsertLicenseCredit([FromBody] LicenseCreditDto licenseCreditDto)
    {
        return ResultHelper(await _licenseCreditService.InsertLicenseCreditAsync(licenseCreditDto));
    }

    // Request a new license credit.
    [HttpPost("request")]
    public async Task<ActionResult<ServiceResponse<LicenseCreditDto>>> RequestLicenseCredit([FromBody] RequestLicenseCreditDto licenseCreditDto)
    {
        return ResultHelper(await _licenseCreditService.RequestLicenseCreditAsync(licenseCreditDto));
    }

    // Approve a new license credit.
    [HttpPost("approve")]
    public async Task<ActionResult<ServiceResponse<LicenseCreditDto>>> ApproveLicenseCredit([FromBody] RequestLicenseCreditDto licenseCreditDto)
    {
        return ResultHelper(await _licenseCreditService.ApproveLicenseCreditAsync(licenseCreditDto));
    }

    // Updates an existing license credit.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<LicenseCreditDto>>> UpdateLicenseCredit([FromBody] LicenseCreditDto licenseCreditDto)
    {
        return ResultHelper(await _licenseCreditService.UpdateLicenseCreditAsync(licenseCreditDto));
    }

    // Deletes a license credit by its ID.
    [HttpDelete("{licenseCreditId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteLicenseCredit(Guid licenseCreditId)
    {
        return ResultHelper(await _licenseCreditService.DeleteLicenseCreditAsync(licenseCreditId));
    }

    // Deletes multiple license credits by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteLicenseCredits([FromBody] List<Guid> licenseCreditIds)
    {
        return ResultHelper(await _licenseCreditService.DeleteLicenseCreditsAsync(licenseCreditIds));
    }
}