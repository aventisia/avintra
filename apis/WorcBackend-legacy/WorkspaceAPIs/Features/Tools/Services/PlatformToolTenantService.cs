namespace WorkspaceAPIs.Services;

/// <summary>
/// Reads and materializes the per-tenant enabled-library-tool mappings. A tenant's
/// mapping row exists only while the tool is enabled, so row absence means disabled.
/// </summary>
public class PlatformToolTenantService : IPlatformToolTenantService
{
    /// <summary>
    /// Reserved config-store name whose presence marks a tenant as already materialized.
    /// </summary>
    public const string MarkerName = "__platform_tools_seeded";

    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly ILogger<PlatformToolTenantService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="PlatformToolTenantService"/> class.
    /// </summary>
    public PlatformToolTenantService(
        IUnitOfWork unitOfWork,
        ICurrentTenantService currentTenantService,
        ILogger<PlatformToolTenantService> logger)
    {
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
        _logger = logger;
    }

    /// <inheritdoc />
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

    /// <inheritdoc />
    public async Task<bool> IsEnabledAsync(Guid platformToolId) =>
        (await GetEnabledToolIdsAsync()).Contains(platformToolId);

    /// <inheritdoc />
    public async Task EnsureCurrentTenantMaterializedAsync()
    {
        var tenantId = _currentTenantService.CurrentTenantId;
        if (tenantId == Guid.Empty)
        {
            return;
        }

        try
        {
            if (await HasMarkerAsync(tenantId))
            {
                return;
            }

            var actorUserId = await ResolveActorUserIdAsync(tenantId, _currentTenantService.CurrentUserId);
            if (actorUserId is null)
            {
                return;
            }

            await InsertMappingsIfMissingAsync(tenantId, actorUserId.Value, await GetPopularEnabledToolIdsAsync());
            await InsertMarkerAsync(tenantId, actorUserId.Value);
            await _unitOfWork.SaveAsync();
        }
        catch (Exception ex)
        {
            // IMPORTANT NOTE: concurrent first requests can race on the unique mapping/marker
            // indexes; the winner materialized the tenant, so the loser only logs and continues.
            _logger.LogWarning(ex, "Failed to materialize library tools for tenant {TenantId}.", tenantId);
        }
    }

    private async Task<bool> HasMarkerAsync(Guid tenantId, CancellationToken cancellationToken = default) =>
        await _unitOfWork.ConfigStoreRepo
            .GetByConditionAsync(w => w.TenantId == tenantId && w.Name == MarkerName)
            .IgnoreQueryFilters()
            .AnyAsync(cancellationToken);

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
            return tenantUserIds[0];
        }

        _logger.LogWarning("No workspace user found for tenant {TenantId}; library tools cannot be materialized.", tenantId);
        return null;
    }

    private async Task InsertMappingsIfMissingAsync(
        Guid tenantId,
        Guid actorUserId,
        IReadOnlyCollection<Guid> platformToolIds,
        CancellationToken cancellationToken = default)
    {
        if (platformToolIds.Count == 0)
        {
            return;
        }

        var toolIds = platformToolIds.ToList();
        var existingToolIds = await _unitOfWork.TenantPlatformToolRepo
            .GetByConditionAsync(w => w.TenantId == tenantId && toolIds.Contains(w.PlatformToolId))
            .IgnoreQueryFilters()
            .Select(w => w.PlatformToolId)
            .ToListAsync(cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var mappings = toolIds
            .Except(existingToolIds)
            .Select(platformToolId => new TenantPlatformTool
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                PlatformToolId = platformToolId,
                CreatedByUserId = actorUserId,
                CreatedOn = now,
            })
            .ToList();

        if (mappings.Count > 0)
        {
            await _unitOfWork.TenantPlatformToolRepo.InsertAsync(mappings);
        }
    }

    private Task InsertMarkerAsync(Guid tenantId, Guid actorUserId) =>
        _unitOfWork.ConfigStoreRepo.InsertAsync(new ConfigStore
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            SpaceId = null,
            EnvType = ConfigureEnvironmentType.Dev,
            Name = MarkerName,
            Type = ConfigStoreTypesEnum.TEXT,
            Value = "true",
            AccessLevel = AccessLevelTypesEnum.PRIVATE,
            IsTenantWideAccess = false,
            IsResourceAccessRestricted = true,
            IsDisabled = true,
            CreatedByUserId = actorUserId,
            LastModifiedByUserId = actorUserId,
            CreatedOn = DateTimeOffset.UtcNow,
            LastModifiedOn = DateTimeOffset.UtcNow,
        });
}
