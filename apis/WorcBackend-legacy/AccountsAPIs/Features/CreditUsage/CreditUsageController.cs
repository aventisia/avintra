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
            [FromQuery] DateTimeOffset? endDate,
            [FromQuery] bool filterBySpaces = false,
            [FromQuery] string? spaceIds = null,
            [FromQuery] bool includeCentral = true)
    {
        var parsedSpaceIds = string.IsNullOrWhiteSpace(spaceIds)
            ? new List<Guid>()
            : spaceIds
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Where(s => Guid.TryParse(s, out _))
                .Select(Guid.Parse)
                .ToList();

        return ResultHelper(await _creditUsageService.GetCreditUsageAsync(
            startDate, endDate, filterBySpaces, parsedSpaceIds, includeCentral));
    }

    // Records a single credit usage entry and returns the calculated credits used.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<RecordedCreditUsageDto>>> RecordCreditUsage([FromBody] CreditsUsageDto creditUsageDto)
    {
        return ResultHelper(await _creditUsageService.RecordCreditUsageAsync(creditUsageDto));
    }

    // Records multiple credit usage entries and returns the calculated credits used per service type.
    [HttpPost("bulk")]
    public async Task<ActionResult<ServiceResponse<List<RecordedCreditUsageDto>>>> RecordCreditUsagesAsync(IEnumerable<CreditsUsageDto> creditUsageDtos)
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
