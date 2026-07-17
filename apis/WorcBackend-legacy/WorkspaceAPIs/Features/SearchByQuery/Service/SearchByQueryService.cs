namespace WorkspaceAPIs.Services;

public class SearchByQueryService : ISearchByQueryService
{
    private readonly ILogger<SearchByQueryService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public SearchByQueryService(
        ILogger<SearchByQueryService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Searches flow versions
    public async Task<ServiceResponse<IEnumerable<FlowVersionSearchResultDto>>> SearchFlowVersionAsync(
        string searchKey,
        FlowTypesEnum type,
        bool includePublishedOnly)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = ServiceResponse<IEnumerable<FlowVersionSearchResultDto>>.Create("Failed to search agents", 500);

        try
        {
            // Trim the search key
            var trimmedSearchKey = searchKey?.Trim() ?? string.Empty;

            // Create base query
            var flowVersionsQuery = _unitOfWork.FlowVersionRepo
                                        .GetByConditionAsync(w =>
                                            w.Flow.Type == type &&
                                            (!includePublishedOnly || w.IsPublished) &&
                                            (w.CreatedByUserId == _userId || (w.Flow.FlowUsers != null && w.Flow.FlowUsers.Any(a => a.UserId == _userId))))
                                        .Include(i => i.Flow)
                                        .OrderBy(o => o.Flow.Name)
                                        .ThenBy(o => o.VersionNumber)
                                        .AsQueryable();

            // If the search key is null or empty, retrieve top 10 accessible flow versions
            if (string.IsNullOrWhiteSpace(trimmedSearchKey))
            {
                var topFlowVersions = await flowVersionsQuery
                                        .Take(10)
                                        .ProjectToType<FlowVersionSearchResultDto>()
                                        .AsNoTracking()
                                        .ToListAsync();

                return serviceResponse.Update(null, 200, topFlowVersions);
            }

            // Retrieve matching flow versions accessible to the current user
            var flowVersions = await flowVersionsQuery
                                .Where(w => EF.Functions.ILike(w.Flow.Name, $"%{trimmedSearchKey}%"))
                                .ProjectToType<FlowVersionSearchResultDto>()
                                .AsNoTracking()
                                .ToListAsync();

            // Task complete
            return serviceResponse.Update(null, 200, flowVersions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while searching flow versions.");
            return serviceResponse;
        }
    }
}
