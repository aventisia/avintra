using WorkspaceAPIs.Features.CloudConnectors.Camel.Services;
using WorkspaceAPIs.Features.Corsair;
using WorkspaceAPIs.Features.Tools.Helpers;

namespace WorkspaceAPIs.Services;

public class ToolCatalogService : IToolCatalogService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ToolCatalogService> _logger;
    private readonly IResourceUserAccessService _resourceUserAccessService;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly CorsairConfigRepository _corsairConfigRepository;
    private readonly CamelConnectorCatalogRepository _camelConnectorCatalogRepository;
    private readonly CorsairIntegrationCatalogRepository _corsairIntegrationCatalogRepository;
    private readonly IPlatformToolTenantService _platformToolTenantService;

    public ToolCatalogService(
        IUnitOfWork unitOfWork,
        ILogger<ToolCatalogService> logger,
        IResourceUserAccessService resourceUserAccessService,
        ICurrentTenantService currentTenantService,
        CorsairConfigRepository corsairConfigRepository,
        CamelConnectorCatalogRepository camelConnectorCatalogRepository,
        CorsairIntegrationCatalogRepository corsairIntegrationCatalogRepository,
        IPlatformToolTenantService platformToolTenantService)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _resourceUserAccessService = resourceUserAccessService;
        _currentTenantService = currentTenantService;
        _corsairConfigRepository = corsairConfigRepository;
        _camelConnectorCatalogRepository = camelConnectorCatalogRepository;
        _corsairIntegrationCatalogRepository = corsairIntegrationCatalogRepository;
        _platformToolTenantService = platformToolTenantService;
    }

    public async Task<ServiceResponse<IEnumerable<UsableToolDto>>> GetUsableToolsAsync()
    {
        var serviceResponse = ServiceResponse<IEnumerable<UsableToolDto>>.Create(
            "Failed to fetch usable tools.",
            500);

        try
        {
            await _platformToolTenantService.EnsureCurrentTenantMaterializedAsync();

            var resourceAccessMap = await GetUsableToolsResourceAccessAsync();

            var iconLookup = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            ToolIconHelpers.AddCamelIcons(iconLookup, _camelConnectorCatalogRepository.GetCatalog());
            ToolIconHelpers.AddCorsairIcons(iconLookup, _corsairIntegrationCatalogRepository.GetIconMap());

            var customTools = await _unitOfWork.ToolRepo
                .GetByConditionAsync(BuildCustomToolsPredicate(resourceAccessMap))
                .IgnoreQueryFilters()
                .Select(w => new UsableToolDto
                {
                    Id = w.Id,
                    Name = w.Name,
                    Description = w.Description,
                    IconUrl = w.IconUrl,
                    Type = w.Type,
                    AuthenticationType = w.AuthenticationType,
                    CredentialName = w.CredentialName,
                    IsActive = w.IsActive,
                    IsVerified = w.IsVerified,
                    IsDisabled = w.IsDisabled,
                })
                .ToListAsync();

            var platformTools = (await GetEnabledPlatformToolsAsync())
                .Select(w => new UsableToolDto
                {
                    Id = w.Id,
                    Name = w.Name,
                    Description = w.Description,
                    Type = ComponentTypeEnum.Platform,
                    IsActive = true,
                    IsVerified = true,
                    IsDisabled = false,
                });

            var usableTools = customTools
                .Concat(platformTools)
                .OrderBy(o => o.Name)
                .ToList();

            foreach (var tool in usableTools)
            {
                tool.Icon = ToolIconHelpers.ResolveIcon(tool.Name, iconLookup);
            }

            return serviceResponse.Update(
                "Usable tools retrieved successfully.",
                200,
                usableTools);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch usable tools.");
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<UsableToolOperationsDto>> GetUsableToolOperationsAsync(Guid toolId)
    {
        var serviceResponse = ServiceResponse<UsableToolOperationsDto>.Create(
            "Failed to fetch usable tool operations.",
            500);

        try
        {
            await _platformToolTenantService.EnsureCurrentTenantMaterializedAsync();

            var resourceAccessMap = await GetUsableToolsResourceAccessAsync();

            var tool = await _unitOfWork.ToolRepo
                .GetByConditionAsync(BuildCustomToolsPredicate(resourceAccessMap))
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(w => w.Id == toolId);

            if (tool is not null)
            {
                return serviceResponse.Update(
                    "Usable tool operations retrieved successfully.",
                    200,
                    new UsableToolOperationsDto
                    {
                        CredentialType = ResolveCredentialType(tool.Type, tool.ParsedSchema),
                        Operations = ToolOperationHelpers.ExtractOperations(tool.ParsedSchema, tool.IsVerified),
                    });
            }

            var platformTool = await _unitOfWork.PlatformToolRepo
                .GetByConditionAsync(w => w.Id == toolId && !w.IsDisabled)
                .FirstOrDefaultAsync();

            if (platformTool is null || !await _platformToolTenantService.IsEnabledAsync(toolId))
            {
                return serviceResponse.Update("Tool not found.", 404);
            }

            return serviceResponse.Update(
                "Usable tool operations retrieved successfully.",
                200,
                new UsableToolOperationsDto
                {
                    CredentialType = ResolveCredentialType(ComponentTypeEnum.Platform, platformTool.ParsedSchema),
                    Operations = ToolOperationHelpers.ExtractOperations(platformTool.ParsedSchema, true),
                });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch operations for tool {ToolId}.", toolId);
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<IEnumerable<UsableToolCatalogItemDto>>> GetUsableToolCatalogAsync()
    {
        var serviceResponse = ServiceResponse<IEnumerable<UsableToolCatalogItemDto>>.Create(
            "Failed to fetch usable tool catalog.",
            500);

        try
        {
            await _platformToolTenantService.EnsureCurrentTenantMaterializedAsync();

            var resourceAccessMap = await GetUsableToolsResourceAccessAsync();

            var iconLookup = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            ToolIconHelpers.AddCamelIcons(iconLookup, _camelConnectorCatalogRepository.GetCatalog());
            ToolIconHelpers.AddCorsairIcons(iconLookup, _corsairIntegrationCatalogRepository.GetIconMap());

            var customTools = await _unitOfWork.ToolRepo
                .GetByConditionAsync(BuildCustomToolsPredicate(resourceAccessMap))
                .OrderByDescending(o => o.CreatedOn)
                .IgnoreQueryFilters()
                .Select(w => new UsableToolCatalogItemDto
                {
                    Id = w.Id,
                    Name = w.Name,
                    Description = w.Description,
                    IconUrl = w.IconUrl,
                    Type = w.Type,
                    AuthenticationType = w.AuthenticationType,
                    CredentialName = w.CredentialName,
                    IsActive = w.IsActive,
                    IsVerified = w.IsVerified,
                    IsDisabled = w.IsDisabled,
                    Operations = w.ParsedSchema == null
                        ? new List<UsableToolOperationDto>()
                        : ToolOperationHelpers.ExtractOperations(w.ParsedSchema, w.IsVerified)
                })
                .ToListAsync();

            var platformTools = (await GetEnabledPlatformToolsAsync())
                .Select(w => new UsableToolCatalogItemDto
                {
                    Id = w.Id,
                    Name = w.Name,
                    Description = w.Description,
                    Type = ComponentTypeEnum.Platform,
                    IsActive = true,
                    IsVerified = true,
                    IsDisabled = false,
                    Operations = ToolOperationHelpers.ExtractOperations(w.ParsedSchema, true),
                });

            var usableTools = customTools.Concat(platformTools).ToList();

            foreach (var tool in usableTools)
            {
                tool.Icon = ToolIconHelpers.ResolveIcon(tool.Name, iconLookup);
            }

            return serviceResponse.Update(
                "Usable tool catalog retrieved successfully.",
                200,
                usableTools);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch usable tool catalog.");
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<IEnumerable<ToolDto>>> GetPlatformToolsAsync()
    {
        var serviceResponse = ServiceResponse<IEnumerable<ToolDto>>.Create(
            "Failed to fetch platform tools.",
            500);

        try
        {
            await _platformToolTenantService.EnsureCurrentTenantMaterializedAsync();

            var enabledToolIds = await _platformToolTenantService.GetEnabledToolIdsAsync();

            var platformTools = await _unitOfWork.PlatformToolRepo
                .GetAllAsync()
                .OrderBy(o => o.Name)
                .ToListAsync();

            var mappedTools = platformTools
                .Select(tool => ToolsHelpers.ToToolDto(
                    tool,
                    enabledToolIds.Contains(tool.Id),
                    includeSchema: false)
                )
                .OrderByDescending(o => o.IsPopular)
                .ToList();

            return serviceResponse.Update(
                "Platform tools retrieved successfully.",
                200,
                mappedTools);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch platform tools.");
        }

        return serviceResponse;
    }

    private Task<Dictionary<Guid, ResourceAccessTypeEnum>> GetUsableToolsResourceAccessAsync() =>
        _resourceUserAccessService.GetAccessibleResourcesWithAccessAsync(
            _currentTenantService.CurrentUserId,
            ResourceTypeEnum.Tool,
            new[]
            {
                ResourceAccessTypeEnum.Owner,
                ResourceAccessTypeEnum.View,
                ResourceAccessTypeEnum.Edit,
            });

    private async Task<List<PlatformTool>> GetEnabledPlatformToolsAsync()
    {
        var enabledToolIds = await _platformToolTenantService.GetEnabledToolIdsAsync();
        if (enabledToolIds.Count == 0)
        {
            return new List<PlatformTool>();
        }

        var toolIds = enabledToolIds.ToList();
        return await _unitOfWork.PlatformToolRepo
            .GetByConditionAsync(w => toolIds.Contains(w.Id) && !w.IsDisabled)
            .OrderBy(o => o.Name)
            .ToListAsync();
    }

    private Expression<Func<Tool, bool>> BuildCustomToolsPredicate(
        Dictionary<Guid, ResourceAccessTypeEnum> resourceAccessMap)
    {
        var currentUserId = _currentTenantService.CurrentUserId;
        var currentTenantId = _currentTenantService.CurrentTenantId;
        var currentEnvType = _currentTenantService.CurrentEnvType;

        Guid? targetSpaceId = _currentTenantService.CurrentSpaceId == Guid.Empty
            ? null
            : _currentTenantService.CurrentSpaceId;

        return w =>
            w.IsActive &&
            !w.IsDisabled &&
            w.Type == ComponentTypeEnum.Custom &&
            w.TenantId == currentTenantId &&
            w.EnvType == currentEnvType &&
            w.SpaceId == targetSpaceId &&
            (w.IsTenantWideAccess ||
             (w.CreatedByUserId == currentUserId && !w.IsTenantWideAccess) ||
             resourceAccessMap.Keys.Contains(w.Id));
    }

    private string? ResolveCredentialType(ComponentTypeEnum? type, JsonDocument? parsedSchema)
    {
        if (type == ComponentTypeEnum.Custom)
        {
            return VaultCredentialTypesEnum.CustomApiTool.ToString();
        }

        var pluginId = ToolOperationHelpers.TryGetCorsairPluginId(parsedSchema);
        return string.IsNullOrWhiteSpace(pluginId)
            ? null
            : _corsairConfigRepository.GetVaultCredentialTypeForPluginId(pluginId);
    }
}
