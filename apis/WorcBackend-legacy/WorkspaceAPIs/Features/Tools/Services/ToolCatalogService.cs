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

    public ToolCatalogService(
        IUnitOfWork unitOfWork,
        ILogger<ToolCatalogService> logger,
        IResourceUserAccessService resourceUserAccessService,
        ICurrentTenantService currentTenantService,
        CorsairConfigRepository corsairConfigRepository,
        CamelConnectorCatalogRepository camelConnectorCatalogRepository,
        CorsairIntegrationCatalogRepository corsairIntegrationCatalogRepository)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _resourceUserAccessService = resourceUserAccessService;
        _currentTenantService = currentTenantService;
        _corsairConfigRepository = corsairConfigRepository;
        _camelConnectorCatalogRepository = camelConnectorCatalogRepository;
        _corsairIntegrationCatalogRepository = corsairIntegrationCatalogRepository;
    }

    public async Task<ServiceResponse<IEnumerable<UsableToolDto>>> GetUsableToolsAsync()
    {
        var serviceResponse = ServiceResponse<IEnumerable<UsableToolDto>>.Create(
            "Failed to fetch usable tools.",
            500);

        try
        {
            var resourceAccessMap = await GetUsableToolsResourceAccessAsync();

            var iconLookup = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            ToolIconHelpers.AddCamelIcons(iconLookup, _camelConnectorCatalogRepository.GetCatalog());
            ToolIconHelpers.AddCorsairIcons(iconLookup, _corsairIntegrationCatalogRepository.GetIconMap());

            var usableTools = await _unitOfWork.ToolRepo
                .GetByConditionAsync(BuildUsableToolsPredicate(resourceAccessMap))
                .OrderBy(o => o.Name)
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
            var resourceAccessMap = await GetUsableToolsResourceAccessAsync();

            var tool = await _unitOfWork.ToolRepo
                .GetByConditionAsync(BuildUsableToolsPredicate(resourceAccessMap))
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(w => w.Id == toolId);

            if (tool is null)
            {
                return serviceResponse.Update("Tool not found.", 404);
            }

            return serviceResponse.Update(
                "Usable tool operations retrieved successfully.",
                200,
                new UsableToolOperationsDto
                {
                    CredentialType = ResolveCredentialType(tool),
                    Operations = ToolOperationHelpers.ExtractOperations(tool.ParsedSchema, tool.IsVerified),
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
            var resourceAccessMap = await GetUsableToolsResourceAccessAsync();

            var iconLookup = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            ToolIconHelpers.AddCamelIcons(iconLookup, _camelConnectorCatalogRepository.GetCatalog());
            ToolIconHelpers.AddCorsairIcons(iconLookup, _corsairIntegrationCatalogRepository.GetIconMap());

            var usableTools = await _unitOfWork.ToolRepo
                .GetByConditionAsync(BuildUsableToolsPredicate(resourceAccessMap))
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
            var platformTools = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w => w.Type == ComponentTypeEnum.Platform)
                .OrderByDescending(o => o.CreatedOn)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .IgnoreQueryFilters()
                .ToListAsync();

            var mappedTools = platformTools.Adapt<IEnumerable<ToolDto>>().ToList();
            mappedTools.ForEach(toolDto => toolDto.AccessLevel = ResourceAccessTypeEnum.View);

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

    private Expression<Func<Tool, bool>> BuildUsableToolsPredicate(
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
            (
                (w.Type == ComponentTypeEnum.Platform &&
                 w.TenantId == Guid.Empty &&
                 w.SpaceId == null &&
                 w.IsTenantWideAccess &&
                 (w.CreatedByUserId == null || w.CreatedByUserId == Guid.Empty))
                ||
                (w.Type == ComponentTypeEnum.Custom &&
                 w.TenantId == currentTenantId &&
                 w.EnvType == currentEnvType &&
                 w.SpaceId == targetSpaceId &&
                 (w.IsTenantWideAccess ||
                  (w.CreatedByUserId == currentUserId && !w.IsTenantWideAccess) ||
                  resourceAccessMap.Keys.Contains(w.Id)))
            );
    }

    private string? ResolveCredentialType(Tool tool)
    {
        if (tool.Type == ComponentTypeEnum.Custom)
        {
            return VaultCredentialTypesEnum.CustomApiTool.ToString();
        }

        var pluginId = ToolOperationHelpers.TryGetCorsairPluginId(tool.ParsedSchema);
        return string.IsNullOrWhiteSpace(pluginId)
            ? null
            : _corsairConfigRepository.GetVaultCredentialTypeForPluginId(pluginId);
    }
}
