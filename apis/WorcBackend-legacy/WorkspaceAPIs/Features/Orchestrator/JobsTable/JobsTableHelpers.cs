namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Provides helper methods for the Jobs Table feature.
/// </summary>
public static class JobsTableHelpers
{
    /// <summary>
    /// Resolves the date range for job queries based on optional start and end date filters.
    /// If both dates are null, defaults to the last 7 days.
    /// </summary>
    /// <param name="startDate">The optional start date filter.</param>
    /// <param name="endDate">The optional end date filter.</param>
    /// <returns>A tuple containing the resolved start and end dates.</returns>
    public static (DateTimeOffset StartDate, DateTimeOffset EndDate) ResolveDateRange(
        DateTimeOffset? startDate,
        DateTimeOffset? endDate)
    {
        var end = endDate ?? DateTimeOffset.UtcNow.Date;
        var start = startDate ?? end.Date.AddDays(-6);
        return (start, end);
    }

    public static JsonDocument? ParseJsonOrNull(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return null;
        try { return JsonDocument.Parse(json); }
        catch { return null; }
    }

    /// <summary>
    /// Builds the "flow_{name}_v{version}" attribution for a job created by another flow.
    /// Returns "flow_Unknown" when the parent job or its agent cannot be resolved.
    /// </summary>
    public static async Task<string> ResolveFlowParentExecutedByAsync(IUnitOfWork unitOfWork, Guid? parentJobId, Guid tenantId)
    {
        var parentJob = parentJobId.HasValue
            ? await unitOfWork.JobRepo
                .GetByConditionAsync(w => w.Id == parentJobId.Value && w.TenantId == tenantId)
                .IgnoreQueryFilters()
                .AsNoTracking()
                .FirstOrDefaultAsync()
            : null;

        var parentAgent = parentJob == null
            ? null
            : await unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w => w.Id == parentJob.FlowVersionId)
                .IgnoreQueryFilters()
                .Include(s => s.Flow)
                .AsNoTracking()
                .FirstOrDefaultAsync();

        return parentAgent?.Flow != null
            ? $"flow_{parentAgent.Flow.Name}_v{parentAgent.VersionNumber}"
            : "flow_Unknown";
    }
}
