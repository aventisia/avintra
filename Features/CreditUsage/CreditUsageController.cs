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
        [FromQuery] CreditServiceTypesEnum? serviceType,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        return ResultHelper(await _creditUsageService.GetCreditUsageAsync(serviceType, startDate, endDate));
    }

    // Inserts a new credit usage entry.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<bool>>> InsertCreditUsage([FromBody] CreditsUsageDto creditUsageDto)
    {
        return ResultHelper(await _creditUsageService.InsertCreditUsageAsync(creditUsageDto));
    }

    // Exports credit usage data into a CSV file
    [HttpGet("export")]
    public async Task<ActionResult> ExportCreditUsage([FromQuery] CreditServiceTypesEnum? serviceType, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var exportedData = await _creditUsageService.ExportCreditUsageAsync(serviceType, startDate, endDate);
        if (exportedData.StatusCode == 200)
        {
            return exportedData.Data;
        }
        return ResultHelper(exportedData);
    }
}