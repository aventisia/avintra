namespace AccountsAPIs.Controllers;

[Route("byok-usage")]
[ApiController]
[Authorize]
public class ByokUsageController : BaseApiController
{
    private readonly IByokUsageService _byokUsageService;

    public ByokUsageController(IByokUsageService byokUsageService)
    {
        _byokUsageService = byokUsageService;
    }

    // Retrieves a summary of BYOK consumption filtered by service type and date range.
    [Authorize(Roles = "TA")]
    [HttpGet("summary")]
    public async Task<ActionResult<ServiceResponse<ByokUsageSummaryDto>>> GetByokUsageSummary(
        [FromQuery] DateTimeOffset? startDate,
        [FromQuery] DateTimeOffset? endDate,
        [FromQuery] bool filterBySpaces = false,
        [FromQuery] string? spaceIds = null,
        [FromQuery] bool includeCentral = true
    )
    {
        var parsedSpaceIds = string.IsNullOrWhiteSpace(spaceIds)
            ? new List<Guid>()
            : spaceIds
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Where(s => Guid.TryParse(s, out _))
                .Select(Guid.Parse)
                .ToList();

        return ResultHelper(
            await _byokUsageService.GetByokUsageAsync(
                startDate,
                endDate,
                filterBySpaces,
                parsedSpaceIds,
                includeCentral
            )
        );
    }

    // Records a single BYOK consumption entry.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<RecordedByokUsageDto>>> RecordByokUsage(
        [FromBody] ByokUsageDto byokUsageDto
    )
    {
        return ResultHelper(await _byokUsageService.RecordByokUsageAsync(byokUsageDto));
    }

    // Records multiple BYOK consumption entries.
    [HttpPost("bulk")]
    public async Task<
        ActionResult<ServiceResponse<List<RecordedByokUsageDto>>>
    > RecordByokUsagesAsync(IEnumerable<ByokUsageDto> byokUsageDtos)
    {
        return ResultHelper(await _byokUsageService.RecordByokUsagesAsync(byokUsageDtos));
    }

    // Exports BYOK consumption data into a CSV file
    [HttpPost("export")]
    public async Task<ActionResult> ExportByokUsage(
        ExportByokUsageRequestDto exportByokUsageRequestDto
    )
    {
        var exportedData = await _byokUsageService.ExportByokUsageAsync(exportByokUsageRequestDto);
        if (exportedData.StatusCode == 200)
        {
            return exportedData.Data;
        }
        return ResultHelper(exportedData);
    }
}
