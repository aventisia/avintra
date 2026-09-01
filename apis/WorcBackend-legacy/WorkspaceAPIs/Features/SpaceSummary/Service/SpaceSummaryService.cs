namespace WorkspaceAPIs.Services;

public class SpaceSummaryService : ISpaceSummaryService
{
    private readonly ILogger<SpaceSummaryService> _logger;
    private readonly WorkspaceInternalDbContext _workspaceInternalDbContext;
    private readonly Guid _tenantId;

    public SpaceSummaryService(
        ILogger<SpaceSummaryService> logger,
        IHttpContextAccessor httpContextAccessor,
        WorkspaceInternalDbContext workspaceInternalDbContext)
    {
        _logger = logger;

        // Set _tenantId from the HTTP context (the "tntid" JWT claim).
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

        _workspaceInternalDbContext = workspaceInternalDbContext;
    }

    // Retrieves aggregated usage metrics (published agents, execution time, machines) grouped by space
    // for the current tenant. Central space is represented by SpaceId == null.
    public async Task<ServiceResponse<IEnumerable<SpaceSummaryDto>>> GetSpaceSummariesAsync()
    {
        // Initialize the response with a default failure state
        var serviceResponse = new ServiceResponse<IEnumerable<SpaceSummaryDto>>
        {
            Data = null,
            Message = "Failed to retrieve space summaries. Please try again later."
        };

        try
        {
            // Count published agents per space. Only published, non-archived, non-block agents count.
            var publishedAgentData = await _workspaceInternalDbContext.FlowVersions
                .Where(w =>
                    w.TenantId == _tenantId &&
                    w.IsPublished &&
                    !w.IsArchived &&
                    w.Flow != null &&
                    w.Flow.Type != FlowTypesEnum.Block)
                .GroupBy(g => g.SpaceId)
                .Select(s => new
                {
                    SpaceId = s.Key,
                    Count = s.Count()
                })
                .ToListAsync();

            // Sum execution time (in seconds) for completed jobs per space over the last 30 days.
            var thirtyDaysAgo = DateTimeOffset.UtcNow.AddDays(-30);
            var executionData = await _workspaceInternalDbContext.Jobs
                .Where(w =>
                    w.TenantId == _tenantId &&
                    w.EndTime != null &&
                    w.StartTime != null &&
                    w.EndTime >= thirtyDaysAgo)
                .GroupBy(g => g.SpaceId)
                .Select(s => new
                {
                    SpaceId = s.Key,
                    ExecutionTime = s.Sum(sm => (sm.EndTime!.Value - sm.StartTime!.Value).TotalSeconds)
                })
                .ToListAsync();

            // Machines are a tenant-global pool (not scoped by space); every space summary
            // reports the tenant-wide machine count.
            var totalMachines = await _workspaceInternalDbContext.Machine
                .CountAsync(w => w.TenantId == _tenantId);

            // Build the unified list of space IDs across all datasets.
            var spaceIds = publishedAgentData.Select(x => x.SpaceId)
                .Concat(executionData.Select(x => x.SpaceId))
                .Distinct()
                .ToList();

            // Merge the datasets into a single summary per space.
            var summaries = spaceIds
                .Select(spaceId =>
                {
                    var published = publishedAgentData.FirstOrDefault(x => x.SpaceId == spaceId);
                    var execution = executionData.FirstOrDefault(x => x.SpaceId == spaceId);

                    return new SpaceSummaryDto
                    {
                        SpaceId = spaceId,
                        TotalPublishedAgents = published?.Count ?? 0,
                        TotalExecutionTime = execution?.ExecutionTime ?? 0,
                        TotalMachinesAttached = totalMachines
                    };
                })
                .ToList();

            serviceResponse.Data = summaries;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Space summaries retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving space summaries for tenant {TenantId}.", _tenantId);
        }

        return serviceResponse;
    }
}
