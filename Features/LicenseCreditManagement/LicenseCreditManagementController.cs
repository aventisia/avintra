namespace AccountsAPIs.Controllers;

[Route("manage-license-credit")]
[ApiController]
[Authorize]
public class LicenseCreditManagementController : BaseApiController
{
    private readonly ILicenseCreditManagementService _licenseCreditManagementService;

    public LicenseCreditManagementController(ILicenseCreditManagementService licenseCreditManagementService)
    {
        _licenseCreditManagementService = licenseCreditManagementService;
    }

    // Retrieves all license credits created by the user.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ManageLicenseCreditDto>>>> GetLicenseCredits(Guid? id)
    {
        return ResultHelper(await _licenseCreditManagementService.GetAllLicenseCreditsAsync(id));
    }

    // Retrieves a list of license credit options for the current user.
    [HttpGet("license-to-select/{tenantId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOptionDto>>>> GetLicenseCreditOptionListAsync(Guid tenantId)
    {
        return ResultHelper(await _licenseCreditManagementService.GetLicenseCreditOptionsAsync(tenantId));
    }

    // Retrieves a license credit by its ID.
    [HttpGet("{licenseCreditId}")]
    public async Task<ActionResult<ServiceResponse<ManageLicenseCreditDto>>> GetLicenseCreditByIdAsync(Guid licenseCreditId)
    {
        return ResultHelper(await _licenseCreditManagementService.GetLicenseCreditByIdAsync(licenseCreditId));
    }

    // Inserts a new license credit.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<ManageLicenseCreditDto>>> InsertLicenseCredit([FromBody] ManageLicenseCreditDto licenseCreditDto)
    {
        return ResultHelper(await _licenseCreditManagementService.CreateLicenseCreditAsync(licenseCreditDto));
    }

    // Request a new license credit.
    [HttpPost("request")]
    public async Task<ActionResult<ServiceResponse<ManageLicenseCreditDto>>> RequestLicenseCredit([FromBody] RequestLicenseCreditDto licenseCreditDto)
    {
        return ResultHelper(await _licenseCreditManagementService.SubmitLicenseCreditRequestAsync(licenseCreditDto));
    }

    // Approve a new license credit.
    [HttpPost("approve")]
    public async Task<ActionResult<ServiceResponse<ManageLicenseCreditDto>>> ApproveLicenseCredit([FromBody] RequestLicenseCreditDto licenseCreditDto)
    {
        return ResultHelper(await _licenseCreditManagementService.ApproveLicenseCreditRequestAsync(licenseCreditDto));
    }

    // Record a new license credit.
    [HttpPost("record")]
    public async Task<ActionResult<ServiceResponse<ManageLicenseCreditDto>>> RecordLicenseCredit([FromBody] RecordLicenseCreditDto licenseCreditDto)
    {
        return ResultHelper(await _licenseCreditManagementService.RecordLicenseCreditTransactionAsync(licenseCreditDto));
    }

    // Updates an existing license credit.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<ManageLicenseCreditDto>>> UpdateLicenseCredit([FromBody] ManageLicenseCreditDto licenseCreditDto)
    {
        return ResultHelper(await _licenseCreditManagementService.UpdateLicenseCreditAsync(licenseCreditDto));
    }

    // Deletes a license credit by its ID.
    [HttpDelete("{licenseCreditId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteLicenseCredit(Guid licenseCreditId)
    {
        return ResultHelper(await _licenseCreditManagementService.DeleteLicenseCreditByIdAsync(licenseCreditId));
    }

    // Deletes multiple license credits by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteLicenseCredits([FromBody] List<Guid> licenseCreditIds)
    {
        return ResultHelper(await _licenseCreditManagementService.DeleteMultipleLicenseCreditsAsync(licenseCreditIds));
    }
}