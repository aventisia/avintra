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
    [HttpGet("summary")]
    public async Task<ActionResult<ServiceResponse<CreditsUsageSummaryDto>>> GetCreditUsageSummary(
        [FromQuery] DateTimeOffset? startDate,
        [FromQuery] DateTimeOffset? endDate)
    {
        return ResultHelper(await _creditUsageService.GetCreditUsageAsync(startDate, endDate));
    }

    // Inserts a new credit usage entry.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<bool>>> InsertCreditUsage([FromBody] CreditsUsageDto creditUsageDto)
    {
        return ResultHelper(await _creditUsageService.InsertCreditUsageAsync(creditUsageDto));
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
}