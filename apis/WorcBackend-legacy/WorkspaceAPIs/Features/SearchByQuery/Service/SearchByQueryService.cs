namespace WorkspaceAPIs.Services;

public class SearchByQueryService : ISearchByQueryService
{
    private readonly ILogger<SearchByQueryService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IClientStatusStore _clientStatusStore;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly Guid _userId;

    public SearchByQueryService(
        ILogger<SearchByQueryService> logger,
        IUnitOfWork unitOfWork,
        IClientStatusStore clientStatusStore,
        ICurrentTenantService currentTenantService,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _clientStatusStore = clientStatusStore;
        _currentTenantService = currentTenantService;
    }

    // Searches flow versions
    public async Task<ServiceResponse<IEnumerable<SelectOption>>> SearchFlowVersionAsync(
        string searchKey,
        FlowTypesEnum type,
        bool includePublishedOnly,
        Guid? machineId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = ServiceResponse<IEnumerable<SelectOption>>.Create("Failed to search agents", 500);

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
                                        .Include(i => i.FlowVersionMachines)
                                        .OrderBy(o => o.Flow.Name)
                                        .ThenBy(o => o.VersionNumber)
                                        .AsQueryable();

            // If the machineId has a value, filter the query to include only flow versions associated with that machine
            if (machineId.HasValue)
            {
                flowVersionsQuery = flowVersionsQuery.Where(w => w.FlowVersionMachines != null && w.FlowVersionMachines.Any(a => a.MachineId == machineId.Value));
            }

            // If the search key is null or empty, retrieve top 10 accessible flow versions
            if (string.IsNullOrWhiteSpace(trimmedSearchKey))
            {
                var topFlowVersions = await flowVersionsQuery
                                        .Take(10)
                                        .ProjectToType<SelectOption>()
                                        .AsNoTracking()
                                        .ToListAsync();

                return serviceResponse.Update(null, 200, topFlowVersions);
            }

            // Retrieve matching flow versions accessible to the current user
            var flowVersions = await flowVersionsQuery
                                .Where(w => EF.Functions.ILike(w.Flow.Name, $"%{trimmedSearchKey}%"))
                                .ProjectToType<SelectOption>()
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

    // Searches machines by unique name and optional flow version identifier
    public async Task<ServiceResponse<IEnumerable<SelectOption>>> SearchMachineAsync(
        string? searchKey,
        Guid? flowVersionId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = ServiceResponse<IEnumerable<SelectOption>>.Create("Failed to search machines", 500);

        try
        {
            // Trim the search key
            var trimmedSearchKey = searchKey?.Trim() ?? string.Empty;

            // Both search key and flowVersionId cannot be empty/null
            if (string.IsNullOrWhiteSpace(trimmedSearchKey) && !flowVersionId.HasValue)
                return serviceResponse.Update("Either machine name or agent identifier is required", 400);

            // Build base query from machines
            var machinesQuery = _unitOfWork.MachineRepo
                .GetAllAsync()
                .OrderBy(o => o.Name)
                .AsQueryable();

            // Apply machine name filter only when search key is provided
            if (!string.IsNullOrWhiteSpace(trimmedSearchKey))
                machinesQuery = machinesQuery.Where(w => EF.Functions.ILike(w.Name, $"%{trimmedSearchKey}%"));

            // Apply flow version filter only when FlowVersionId has a value
            if (flowVersionId.HasValue)
                machinesQuery = machinesQuery
                    .Where(w => w.MachineFlowVersions != null && w.MachineFlowVersions.Any(a => a.FlowVersionId == flowVersionId.Value));

            // Retrieve matching machines projected to select options
            var machines = await machinesQuery
                .ProjectToType<SelectOption>()
                .AsNoTracking()
                .ToListAsync();

            // Get current machine statuses
            var clientStatusDtos = await _clientStatusStore.GetMachineStatusesAsync(_currentTenantService.CurrentTenantId);

            // Map live status into the option description
            foreach (var machine in machines)
            {
                var clientStatusDto = clientStatusDtos.FirstOrDefault(status => status.ClientId.ToString() == machine.Value);
                machine.Description = clientStatusDto != null ? clientStatusDto.Status.ToString() : MachineStatusEnum.Offline.ToString();
            }

            // Task complete
            return serviceResponse.Update(null, 200, machines);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while searching machines.");
            return serviceResponse;
        }
    }
}
