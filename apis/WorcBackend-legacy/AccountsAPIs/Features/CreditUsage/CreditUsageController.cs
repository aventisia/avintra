namespace AccountsAPIs.Controllers;

[Route("credit-usage")]
[ApiController]
[Authorize]
public class CreditUsageController : BaseApiController
{
    private readonly ICreditUsageService _creditUsageService;

    public CreditUsageController(ICreditUsageService creditUsageService)
    {
        _creditUsageService = creditUsageService;
    }

    // Retrieves a summary of credit usage filtered by service type and date range.
    [Authorize(Roles = "TA")]
    [HttpGet("summary")]
    public async Task<ActionResult<ServiceResponse<CreditsUsageSummaryDto>>> GetCreditUsageSummary(
            [FromQuery] DateTimeOffset? startDate,
            [FromQuery] DateTimeOffset? endDate)
    {
        return ResultHelper(await _creditUsageService.GetCreditUsageAsync(startDate, endDate));
    }

    // Records credit usage entries.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<bool>>> RecordCreditUsage([FromBody] CreditsUsageDto creditUsageDto)
    {
        return ResultHelper(await _creditUsageService.RecordCreditUsageAsync(creditUsageDto));
    }

    // Records multiple credit usage entries.
    [HttpPost("bulk")]
    public async Task<ActionResult<ServiceResponse<bool>>> RecordCreditUsagesAsync(IEnumerable<CreditsUsageDto> creditUsageDtos)
    {
        return ResultHelper(await _creditUsageService.RecordCreditUsagesAsync(creditUsageDtos));
    }

    // Exports credit usage data into a CSV file
    [HttpPost("export")]
    public async Task<ActionResult> ExportCreditUsage(ExportCreditUsageRequestDto exportCreditUsageRequestDto)
    {
        var exportedData = await _creditUsageService.ExportCreditUsageAsync(exportCreditUsageRequestDto);
        if (exportedData.StatusCode == 200)
        {
            return exportedData.Data;
        }
        return ResultHelper(exportedData);
    }

    // Gets available credits for a tenant
    [HttpGet("available-credits")]
    public async Task<ActionResult<ServiceResponse<AvailableCreditDto>>> GetAvailableCredits()
    {
        return ResultHelper(await _creditUsageService.GetAvailableCreditsAsync());
    }

    // Gets the available credits summary for a tenant
    [HttpGet("available-credits-summary")]
    public async Task<ActionResult<ServiceResponse<AvailableCreditSummaryDto>>> GetCreditsSummary()
    {
        return ResultHelper(await _creditUsageService.GetAvailableCreditsSummaryAsync());
    }
}
