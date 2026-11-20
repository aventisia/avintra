namespace WorkspaceAPIs.Services;

/// <summary>
/// Reads and materializes the per-tenant enabled-library-tool mappings. A tenant's
/// mapping row exists only while the tool is enabled, so row absence means disabled.
/// </summary>
public class PlatformToolTenantService : IPlatformToolTenantService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly ILogger<PlatformToolTenantService> _logger;

    public PlatformToolTenantService(
        IUnitOfWork unitOfWork,
        ICurrentTenantService currentTenantService,
        ILogger<PlatformToolTenantService> logger)
    {
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
        _logger = logger;
    }

    public async Task<IReadOnlySet<Guid>> GetEnabledToolIdsAsync()
    {
        var tenantId = _currentTenantService.CurrentTenantId;
        if (tenantId == Guid.Empty)
        {
            return new HashSet<Guid>();
        }

        var enabledIds = await _unitOfWork.TenantPlatformToolRepo
            .GetByConditionAsync(w => w.TenantId == tenantId)
            .IgnoreQueryFilters()
            .Select(w => w.PlatformToolId)
            .ToListAsync();

        return enabledIds.ToHashSet();
    }

    public async Task<bool> IsEnabledAsync(Guid platformToolId)
    {
        var tenantId = _currentTenantService.CurrentTenantId;
        if (tenantId == Guid.Empty)
        {
            return false;
        }

        return await _unitOfWork.TenantPlatformToolRepo
            .GetByConditionAsync(w => w.TenantId == tenantId && w.PlatformToolId == platformToolId)
            .IgnoreQueryFilters()
            .AnyAsync();
    }

    public async Task EnsureCurrentTenantMaterializedAsync()
    {
        var tenantId = _currentTenantService.CurrentTenantId;
        if (tenantId == Guid.Empty)
        {
            return;
        }

        try
        {
            // IMPORTANT NOTE: the tenant's mapping table is the only source of truth. Any row
            // means the tenant has already chosen, so later catalog additions are never forced
            // on it; an empty table maps the popular tools once.
            var hasMappings = await _unitOfWork.TenantPlatformToolRepo
                .GetByConditionAsync(w => w.TenantId == tenantId)
                .IgnoreQueryFilters()
                .AnyAsync();
            if (hasMappings)
            {
                return;
            }

            var actorUserId = await ResolveActorUserIdAsync(tenantId, _currentTenantService.CurrentUserId);
            if (actorUserId is null)
            {
                return;
            }

            await InsertMappingsAsync(tenantId, actorUserId.Value, await GetPopularEnabledToolIdsAsync());
            await _unitOfWork.SaveAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is Npgsql.PostgresException { SqlState: Npgsql.PostgresErrorCodes.UniqueViolation })
        {
            // IMPORTANT NOTE: concurrent first requests can race on the unique mapping index;
            // the winner materialized the tenant, so the loser only logs and continues.
            _logger.LogWarning(ex, "Concurrent materialization for tenant {TenantId} lost the race.", tenantId);
        }
    }

    private async Task<List<Guid>> GetPopularEnabledToolIdsAsync(CancellationToken cancellationToken = default) =>
        await _unitOfWork.PlatformToolRepo
            .GetByConditionAsync(w => w.IsPopular && !w.IsDisabled)
            .Select(w => w.Id)
            .ToListAsync(cancellationToken);

    private async Task<Guid?> ResolveActorUserIdAsync(Guid tenantId, Guid preferredUserId)
    {
        var tenantUserIds = await _unitOfWork.WorkspaceUserRepo
            .GetAllAsync()
            .IgnoreQueryFilters()
            .Where(w => w.TenantId == tenantId)
            .Select(w => w.Id)
            .ToListAsync();

        if (preferredUserId != Guid.Empty && tenantUserIds.Contains(preferredUserId))
        {
            return preferredUserId;
        }

        if (tenantUserIds.Count > 0)
        {
            return tenantUserIds.Min();
        }

        _logger.LogWarning("No workspace user found for tenant {TenantId}; library tools cannot be materialized.", tenantId);
        return null;
    }

    private async Task InsertMappingsAsync(
        Guid tenantId,
        Guid actorUserId,
        IReadOnlyCollection<Guid> platformToolIds)
    {
        if (platformToolIds.Count == 0)
        {
            return;
        }

        var now = DateTimeOffset.UtcNow;
        var mappings = platformToolIds
            .Select(platformToolId => new TenantPlatformTool
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                PlatformToolId = platformToolId,
                CreatedByUserId = actorUserId,
                CreatedOn = now,
            })
            .ToList();

        await _unitOfWork.TenantPlatformToolRepo.InsertAsync(mappings);
    }
}
