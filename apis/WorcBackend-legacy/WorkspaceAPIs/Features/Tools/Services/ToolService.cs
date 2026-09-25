using WorkspaceAPIs.Features.CloudConnectors.Camel.Services;
using WorkspaceAPIs.Features.Corsair;
using WorkspaceAPIs.Features.Tools.Helpers;

namespace WorkspaceAPIs.Services;

public class ToolService : IToolService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ToolService> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IResourceShareService _resourceShareService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IUserManagementGuardService _userManagementGuardService;
    private readonly CorsairConfigRepository _corsairConfigRepository;
    private readonly CamelConnectorCatalogRepository _camelConnectorCatalogRepository;
    private readonly CorsairIntegrationCatalogRepository _corsairIntegrationCatalogRepository;
    private readonly Guid _currentUserId;
    private readonly string _accessToken;

    public ToolService(
        IUnitOfWork unitOfWork,
        ILogger<ToolService> logger,
        IHttpContextAccessor httpContextAccessor,
        IResourceShareService resourceShareService,
        IHttpClientFactory httpClientFactory,
        EnvironmentConfig environmentConfig,
        ICurrentTenantService currentTenantService,
        IUserManagementGuardService userManagementGuardService,
        CorsairConfigRepository corsairConfigRepository,
        CamelConnectorCatalogRepository camelConnectorCatalogRepository,
        CorsairIntegrationCatalogRepository corsairIntegrationCatalogRepository)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
        _resourceShareService = resourceShareService;
        _httpClientFactory = httpClientFactory;
        _environmentConfig = environmentConfig;
        _currentTenantService = currentTenantService;
        _userManagementGuardService = userManagementGuardService;
        _corsairConfigRepository = corsairConfigRepository;
        _camelConnectorCatalogRepository = camelConnectorCatalogRepository;
        _corsairIntegrationCatalogRepository = corsairIntegrationCatalogRepository;
        _currentUserId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _accessToken = GetJwtOfRequestUtil.GetJwtOfRequest(httpContextAccessor.HttpContext) ?? string.Empty;
    }

    // Retrieves list of tools based on ownership scope.
    public async Task<ServiceResponse<IEnumerable<ToolDto>>> GetToolsAsync(bool isPersonal)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<ToolDto>>
        {
            Message = "Failed to fetch tools."
        };

        try
        {
            List<Tool> toolList;
            Dictionary<Guid, ResourceAccessTypeEnum> resourceAccessMap = new();

            if (isPersonal)
            {
                // Fetch tools owned by the current user.
                toolList = await _unitOfWork.ToolRepo
                    .GetByConditionAsync(w => w.CreatedByUserId == _currentUserId && w.EnvType == _currentTenantService.CurrentEnvType)
                    .OrderByDescending(o => o.CreatedOn)
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.LastModifiedByUser)
                    .ToListAsync();
            }
            else
            {
                // Resolve shared resource access for the current user.
                resourceAccessMap = await _resourceShareService.GetAccessibleResourcesWithAccessAsync(
                    _currentUserId,
                    ResourceTypeEnum.Tool,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                    });

                // Fetch shared and tenant-wide tools not owned by the current user.
                toolList = await _unitOfWork.ToolRepo
                    .GetByConditionAsync(w =>
                        w.CreatedByUserId != _currentUserId &&
                        w.EnvType == _currentTenantService.CurrentEnvType &&
                        (w.IsTenantWideAccess || resourceAccessMap.Keys.Contains(w.Id)))
                    .OrderByDescending(o => o.CreatedOn)
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.LastModifiedByUser)
                    .ToListAsync();
            }

            // Map entities to DTOs and assign effective access level.
            var mappedTools = toolList.Adapt<IEnumerable<ToolDto>>().ToList();
            mappedTools.ForEach(toolDto =>
            {
                toolDto.AccessLevel = isPersonal
                    ? ResourceAccessTypeEnum.Owner
                    : resourceAccessMap.GetValueOrDefault(toolDto.Id, ResourceAccessTypeEnum.View);
            });

            return serviceResponse.Update(
                "Tools retrieved successfully.",
                200,
                mappedTools);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch tools.");
        }

        return serviceResponse;
    }

    // Retrieves the platform, personal, shared and tenant-wide tools the current user can use,
    // within the current environment and space.
    public async Task<ServiceResponse<IEnumerable<UsableToolDto>>> GetUsableToolsAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<UsableToolDto>>
        {
            Message = "Failed to fetch usable tools."
        };

        try
        {
            // Resolve shared resource access for the current user.
            var resourceAccessMap = await GetUsableToolsResourceAccessAsync();

            // Fetch usable tools across every scope. Global tenant/space filters are bypassed so
            // tenant-agnostic platform tools (TenantId = Guid.Empty) are visible to every tenant.
            // Only slim columns are projected so the large OpenApiSpec/ParsedSchema payloads are
            // not loaded for the whole catalogue.
            // Resolve brand icons for platform tools from the Camel and Corsair
            // catalogs. Custom tools and unknown integrations fall back to null.
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
                    Type = w.Type,
                    AuthenticationType = w.AuthenticationType,
                    CredentialName = w.CredentialName,
                    IsActive = w.IsActive,
                    IsVerified = w.IsVerified,
                    IsDisabled = w.IsDisabled,
                })
                .ToListAsync();

            // Icons are resolved in memory because the catalog lookup is not translatable.
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

    // Retrieves the operations exposed by a usable tool, together with the credential
    // type required to invoke it.
    public async Task<ServiceResponse<UsableToolOperationsDto>> GetUsableToolOperationsAsync(Guid toolId)
    {
        var serviceResponse = new ServiceResponse<UsableToolOperationsDto>
        {
            Message = "Failed to fetch usable tool operations."
        };

        try
        {
            // Resolve shared resource access for the current user.
            var resourceAccessMap = await GetUsableToolsResourceAccessAsync();

            // Load the single tool using the same usability scope, including its parsed schema.
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

    // Retrieves the usable tools together with their enriched operations in a single
    // payload, for the action-selector catalog. Unverified custom tools are included
    // and flagged via IsVerified.
    public async Task<ServiceResponse<IEnumerable<UsableToolCatalogItemDto>>> GetUsableToolCatalogAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<UsableToolCatalogItemDto>>
        {
            Message = "Failed to fetch usable tool catalog."
        };

        try
        {
            // Resolve shared resource access for the current user.
            var resourceAccessMap = await GetUsableToolsResourceAccessAsync();

            var iconLookup = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            ToolIconHelpers.AddCamelIcons(iconLookup, _camelConnectorCatalogRepository.GetCatalog());
            ToolIconHelpers.AddCorsairIcons(iconLookup, _corsairIntegrationCatalogRepository.GetIconMap());

            // Fetch shared and tenant-wide tools not owned by the current user.
            var usableTools = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w =>
                    w.EnvType == _currentTenantService.CurrentEnvType &&
                    (w.IsTenantWideAccess || resourceAccessMap.Keys.Contains(w.Id)))
                .OrderByDescending(o => o.CreatedOn)
                .Select(w => new UsableToolCatalogItemDto
                {
                    Id = w.Id,
                    Name = w.Name,
                    Description = w.Description,
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

            // Icons are resolved in memory because the catalog lookup is not translatable.
            foreach (var tool in usableTools)
            {
                tool.Icon = ToolIconHelpers.ResolveIcon(tool.Name, iconLookup);
            }

            // Materialize the list so operations can be attached per tool.
            var catalog = usableTools.ToList();

            return serviceResponse.Update(
                "Usable tool catalog retrieved successfully.",
                200,
                catalog);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch usable tool catalog.");
        }

        return serviceResponse;
    }

    // Resolves the shared resource access map used to scope usable tools.
    private Task<Dictionary<Guid, ResourceAccessTypeEnum>> GetUsableToolsResourceAccessAsync() =>
        _resourceShareService.GetAccessibleResourcesWithAccessAsync(
            _currentUserId,
            ResourceTypeEnum.Tool,
            new[]
            {
                ResourceAccessTypeEnum.Owner,
                ResourceAccessTypeEnum.View,
                ResourceAccessTypeEnum.Edit,
            });

    // Builds the predicate that selects every tool the current user can use across scopes.
    private Expression<Func<Tool, bool>> BuildUsableToolsPredicate(
        Dictionary<Guid, ResourceAccessTypeEnum> resourceAccessMap)
    {
        var currentTenantId = _currentTenantService.CurrentTenantId;
        var currentEnvType = _currentTenantService.CurrentEnvType;

        // Central space is represented by a null SpaceId.
        Guid? targetSpaceId = _currentTenantService.CurrentSpaceId == Guid.Empty
            ? null
            : _currentTenantService.CurrentSpaceId;

        // Unverified custom tools stay visible (flagged via IsVerified) so they can be
        // selected in flows; the invoke endpoint rejects unverified tools at runtime.
        return w =>
            w.IsActive &&
            (!w.IsVerified || w.Type == ComponentTypeEnum.Custom) &&
            !w.IsDisabled &&
            (
                // Platform's default tools are tenant-agnostic and available in every environment.
                (w.Type == ComponentTypeEnum.Platform &&
                 w.TenantId == Guid.Empty &&
                 w.SpaceId == null &&
                 w.IsTenantWideAccess &&
                 (w.CreatedByUserId == null || w.CreatedByUserId == Guid.Empty))
                ||
                // Custom tools scoped to the current tenant, environment and space.
                (w.Type == ComponentTypeEnum.Custom &&
                 w.TenantId == currentTenantId &&
                 w.EnvType == currentEnvType &&
                 w.SpaceId == targetSpaceId &&
                 (w.IsTenantWideAccess ||
                  (w.CreatedByUserId == _currentUserId && !w.IsTenantWideAccess) ||
                  resourceAccessMap.Keys.Contains(w.Id)))
            );
    }

    // Resolves the credential (vault) type a tool is invoked with.
    private string? ResolveCredentialType(Tool tool)
    {
        // Custom tools always use the CustomApiTool credential type.
        if (tool.Type == ComponentTypeEnum.Custom)
        {
            return AppSecretTypesEnum.CustomApiTool.ToString();
        }

        // Platform Corsair tools map their plugin id to a vault type via the integration catalog.
        var pluginId = ToolOperationHelpers.TryGetCorsairPluginId(tool.ParsedSchema);
        return string.IsNullOrWhiteSpace(pluginId)
            ? null
            : _corsairConfigRepository.GetVaultTypeForPluginId(pluginId);
    }

    // Checks whether a tool name is available for use.
    public async Task<ServiceResponse<TrueFalseResultDto>> IsToolNameAvailableAsync(CheckAvailabilityDto availabilityDto)
    {
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Message = "Failed to check tool name availability."
        };

        try
        {
            // Validate and normalize the provided tool name.
            var normalizedName = availabilityDto.UserInput?.Trim();
            if (string.IsNullOrWhiteSpace(normalizedName))
            {
                return serviceResponse.Update(
                    "Tool name cannot be empty.",
                    200,
                    new TrueFalseResultDto { Result = false });
            }

            // Search for an existing tool with the same name (case-insensitive) within the current
            // environment. AnyAsync avoids a duplicate-name throw when same-name tools exist across
            // spaces (the space filter is intentionally bypassed for platform/tool uniqueness).
            var toolNameExists = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w =>
                    (
                        w.Type == ComponentTypeEnum.Platform ||
                        (w.Type == ComponentTypeEnum.Custom &&
                        w.TenantId == _currentTenantService.CurrentTenantId)
                    ) &&
                    w.Name.ToLower() == normalizedName.ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .IgnoreQueryFilters()
                .AnyAsync();

            if (toolNameExists)
            {
                return serviceResponse.Update(
                    $"Tool name '{normalizedName}' already exists.",
                    200,
                    new TrueFalseResultDto { Result = false });
            }

            return serviceResponse.Update(
                $"Tool name '{normalizedName}' is available.",
                200,
                new TrueFalseResultDto { Result = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check tool name availability.");
        }

        return serviceResponse;
    }

    // Retrieves a tool by its ID.
    public async Task<ServiceResponse<ToolDto>> GetToolByIdAsync(Guid toolId)
    {
        var serviceResponse = new ServiceResponse<ToolDto>
        {
            Message = "Failed to fetch tool."
        };

        try
        {
            // Fetch the requested tool.
            // Bypass global tenant/space filters so platform's default tools with
            // TenantId = Guid.Empty are visible to every tenant.
            var tool = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w => w.Id == toolId && w.EnvType == _currentTenantService.CurrentEnvType && (w.TenantId == _currentTenantService.CurrentTenantId || w.TenantId == Guid.Empty))
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync();

            if (tool == null)
            {
                return serviceResponse.Update("Tool not found.", 404);
            }

            // Verify the current user can view the tool.
            var (canView, _) = await _resourceShareService.GetResourceAccessAsync(
                _currentUserId,
                tool.Id,
                ResourceTypeEnum.Tool,
                tool.CreatedByUserId ?? Guid.Empty,
                tool.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                });

            if (!canView)
            {
                return serviceResponse.Update("You do not have permission to view this tool.", 403);
            }

            return serviceResponse.Update(
                "Tool retrieved successfully.",
                200,
                tool.Adapt<ToolDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch tool with ID {ToolId}.", toolId);
        }

        return serviceResponse;
    }

    // Retrieves a tool by its name within the current environment and tenant.
    public async Task<ServiceResponse<ToolDto>> GetToolByNameAsync(string toolName)
    {
        var serviceResponse = new ServiceResponse<ToolDto>
        {
            Message = "Failed to fetch tool."
        };

        try
        {
            // Validate the provided tool name.
            if (string.IsNullOrWhiteSpace(toolName))
            {
                return serviceResponse.Update("Tool name is required.", 400);
            }

            // Normalize input for case-insensitive comparison.
            var normalizedName = toolName.Trim().ToLowerInvariant();

            // Fetch the requested tool by name within the current environment.
            // Bypass global tenant/space filters so platform's default tools with
            // TenantId = Guid.Empty are visible to every tenant.
            var toolCandidates = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == normalizedName &&
                    w.EnvType == _currentTenantService.CurrentEnvType)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .IgnoreQueryFilters()
                .OrderBy(w => w.CreatedOn)
                .ToListAsync();

            // Resolve deterministically (the unique index is TenantId + SpaceId + EnvType + Name):
            // prefer the request's space, then Central (null), then the oldest record.
            var requestSpaceId = _currentTenantService.CurrentSpaceId == Guid.Empty
                ? (Guid?)null
                : _currentTenantService.CurrentSpaceId;
            var tool = toolCandidates
                .OrderBy(w => w.SpaceId == requestSpaceId ? 0 : (w.SpaceId == null ? 1 : 2))
                .ThenBy(w => w.CreatedOn)
                .FirstOrDefault();

            if (tool == null)
            {
                return serviceResponse.Update("Tool not found.", 404);
            }

            // Verify the current user can view the tool.
            var (canView, _) = await _resourceShareService.GetResourceAccessAsync(
                _currentUserId,
                tool.Id,
                ResourceTypeEnum.Tool,
                tool.CreatedByUserId ?? Guid.Empty,
                tool.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                });

            if (!canView)
            {
                return serviceResponse.Update("You do not have permission to view this tool.", 403);
            }

            return serviceResponse.Update(
                "Tool retrieved successfully.",
                200,
                tool.Adapt<ToolDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch tool with name {ToolName}.", toolName);
        }

        return serviceResponse;
    }

    // Inserts a new tool.
    public async Task<ServiceResponse<ToolDto>> InsertToolAsync(ToolDto toolDto)
    {
        var serviceResponse = new ServiceResponse<ToolDto>
        {
            Message = "Failed to create tool."
        };

        try
        {
            // Block creating new tools while in the PROD environment.
            var prodBlock = CreateResourceGuard.Validate<ToolDto>(
                _currentTenantService.CurrentEnvType,
                "tool");
            if (prodBlock != null)
            {
                return prodBlock;
            }

            // Normalize string properties to avoid case-sensitivity issues.
            toolDto = TrimDtoStringPropsUtil.TrimDtoStringProps(toolDto);

            // Ensure the tool name is unique within the current environment.
            var toolWithSameName = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w =>
                    (
                        w.Type == ComponentTypeEnum.Platform ||
                        (w.Type == ComponentTypeEnum.Custom &&
                        w.TenantId == _currentTenantService.CurrentTenantId)
                    ) &&
                    w.Name.ToLower() == toolDto.Name.ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .IgnoreQueryFilters()
                .AnyAsync();

            if (toolWithSameName)
            {
                return serviceResponse.Update($"Tool '{toolDto.Name}' already exists.", 409);
            }

            // Map DTO to entity, force custom type, and set audit fields.
            var toolToCreate = toolDto.Adapt<Tool>();
            toolToCreate.Type = ComponentTypeEnum.Custom;
            toolToCreate.EnvType = _currentTenantService.CurrentEnvType;
            toolToCreate.CreatedByUserId = _currentUserId;
            toolToCreate.LastModifiedByUserId = _currentUserId;
            toolToCreate.CreatedOn = DateTimeOffset.UtcNow;
            toolToCreate.LastModifiedOn = DateTimeOffset.UtcNow;

            // Parse OpenAPI spec into an LLM-friendly schema when provided. Retain
            // the per-operation verification flags the wizard collected before save.
            if (!string.IsNullOrWhiteSpace(toolDto.OpenApiSpec))
            {
                toolToCreate.ParsedSchema = ToolOperationHelpers.CopyOperationVerification(
                    toolDto.ParsedSchema,
                    OpenApiSpecHelpers.FlattenOpenApiSpec(toolDto.OpenApiSpec));
            }
            else if (toolDto.ManualOperations is { Count: > 0 })
            {
                // Synthesize an OpenAPI spec from manually authored operations so
                // manual tools flow through the same flatten/test/execute pipeline.
                var synthesizedSpec = ManualOpenApiSynthesizer.Synthesize(
                    toolDto.ManualOperations,
                    toolDto.Name);
                if (synthesizedSpec is not null)
                {
                    toolToCreate.OpenApiSpec = synthesizedSpec;
                    toolToCreate.ParsedSchema = ToolOperationHelpers.CopyOperationVerification(
                        toolDto.ParsedSchema,
                        OpenApiSpecHelpers.FlattenOpenApiSpec(synthesizedSpec));
                }
                else
                {
                    return serviceResponse.Update(
                        "At least one valid operation (method and endpoint) is required.",
                        400);
                }
            }

            // Derive the tool-level aggregate from the per-operation flags, keeping
            // the incoming tool-level flag as the legacy fallback.
            toolToCreate.IsVerified = ToolOperationHelpers.AreAllOperationsVerified(
                toolToCreate.ParsedSchema,
                toolToCreate.IsVerified);

            if (!HasUniqueOperationNames(toolToCreate.ParsedSchema))
            {
                return serviceResponse.Update("Method names must be unique, ignoring case.", 400);
            }

            // Persist the new tool.
            await _unitOfWork.ToolRepo.InsertAsync(toolToCreate);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save new tool '{ToolName}'.", toolDto.Name);
                return serviceResponse;
            }

            // Assign ownership for resource sharing.
            if (!await _resourceShareService.AssignOwnerAsync(_currentUserId, toolToCreate.Id, ResourceTypeEnum.Tool))
            {
                _logger.LogError("Failed to assign ownership for tool {ToolId}.", toolToCreate.Id);
                return serviceResponse.Update("Failed assigning ownership.", 500);
            }

            return serviceResponse.Update(
                "Tool created successfully.",
                200,
                toolToCreate.Adapt<ToolDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create tool '{ToolName}'.", toolDto.Name);
        }

        return serviceResponse;
    }

    // Updates an existing tool.
    public async Task<ServiceResponse<ToolDto>> UpdateToolAsync(ToolDto toolDto)
    {
        var serviceResponse = new ServiceResponse<ToolDto>
        {
            Message = "Failed to update tool."
        };

        try
        {
            // Normalize string properties.
            toolDto = TrimDtoStringPropsUtil.TrimDtoStringProps(toolDto);

            // Fetch the existing tool.
            var toolToUpdate = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w => w.Id == toolDto.Id && w.EnvType == _currentTenantService.CurrentEnvType)
                .SingleOrDefaultAsync();

            if (toolToUpdate == null)
            {
                return serviceResponse.Update("Tool not found.", 404);
            }

            // Require OM for PROD edits based on the persisted tool environment.
            var prodUpdateBlock = ProdResourceUpdateGuard.Validate<ToolDto>(
                toolToUpdate.EnvType,
                _userManagementGuardService.HasRole(CustomRolesEnum.OM.ToString()),
                "tool");
            if (prodUpdateBlock != null)
            {
                return prodUpdateBlock;
            }

            // Verify the current user can edit the tool.
            var (canEdit, _) = await _resourceShareService.GetResourceAccessAsync(
                _currentUserId,
                toolToUpdate.Id,
                ResourceTypeEnum.Tool,
                toolToUpdate.CreatedByUserId ?? Guid.Empty,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                });

            if (!canEdit)
            {
                return serviceResponse.Update("You do not have access to update this tool.", 403);
            }

            // Ensure no other tool uses the requested name within the current environment.
            var otherToolWithSameName = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == toolDto.Name.ToLower() &&
                    w.Id != toolDto.Id &&
                    w.EnvType == _currentTenantService.CurrentEnvType)
                .SingleOrDefaultAsync();

            if (otherToolWithSameName != null)
            {
                return serviceResponse.Update($"Tool '{toolDto.Name}' already exists.", 409);
            }

            // Apply scalar updates.
            toolToUpdate.Description = toolDto.Description;
            toolToUpdate.BaseUrl = toolDto.BaseUrl;
            toolToUpdate.AuthenticationType = toolDto.AuthenticationType;
            toolToUpdate.CredentialName = toolDto.CredentialName;
            toolToUpdate.IsTenantWideAccess = toolDto.IsTenantWideAccess;
            toolToUpdate.LastModifiedByUserId = _currentUserId;
            toolToUpdate.LastModifiedOn = DateTimeOffset.UtcNow;

            if (toolDto.IsDisabled.HasValue)
            {
                toolToUpdate.IsDisabled = toolDto.IsDisabled.Value;
            }

            // Keep the raw OpenAPI specification exactly as supplied. Parsed
            // method details are stored independently so they can be edited.
            // Re-flattening must retain the per-operation verification flags the
            // wizard collected, so they are copied from the incoming schema.
            if (!string.IsNullOrWhiteSpace(toolDto.OpenApiSpec) && toolToUpdate.OpenApiSpec != toolDto.OpenApiSpec)
            {
                toolToUpdate.OpenApiSpec = toolDto.OpenApiSpec;
                toolToUpdate.ParsedSchema = ToolOperationHelpers.CopyOperationVerification(
                    toolDto.ParsedSchema,
                    OpenApiSpecHelpers.FlattenOpenApiSpec(toolDto.OpenApiSpec));
            }
            else if (toolDto.ParsedSchema is not null)
            {
                toolToUpdate.ParsedSchema = toolDto.ParsedSchema;
            }

            // Derive the tool-level aggregate from the per-operation flags, keeping
            // the existing tool-level flag as the legacy fallback.
            toolToUpdate.IsVerified = ToolOperationHelpers.AreAllOperationsVerified(
                toolToUpdate.ParsedSchema,
                toolToUpdate.IsVerified);

            if (!HasUniqueOperationNames(toolToUpdate.ParsedSchema))
            {
                return serviceResponse.Update("Method names must be unique, ignoring case.", 400);
            }

            // Persist changes.
            _unitOfWork.ToolRepo.Update(toolToUpdate);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save updated tool {ToolId}.", toolDto.Id);
                return serviceResponse;
            }

            return serviceResponse.Update(
                "Tool updated successfully.",
                200,
                toolToUpdate.Adapt<ToolDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update tool {ToolId}.", toolDto.Id);
        }

        return serviceResponse;
    }

    // Deletes an existing tool.
    public async Task<ServiceResponse<bool>> DeleteToolAsync(Guid toolId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete tool."
        };

        try
        {
            // Fetch the tool to delete.
            var toolToDelete = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w => w.Id == toolId && w.EnvType == _currentTenantService.CurrentEnvType)
                .SingleOrDefaultAsync();

            if (toolToDelete == null)
            {
                return serviceResponse.Update("Tool not found.", 404);
            }

            // PROD-guard: block deletion of PROD tools or tools with a same-name PROD twin.
            var guardBlock = await DeleteResourceGuard.ValidateAsync(
                _unitOfWork.ToolRepo,
                toolToDelete.EnvType,
                toolToDelete.Name,
                w => w.Name.ToLower() == toolToDelete.Name.ToLower() &&
                     w.EnvType == ConfigureEnvironmentType.Prod &&
                     w.TenantId == toolToDelete.TenantId &&
                     w.SpaceId == toolToDelete.SpaceId,
                "tool");
            if (guardBlock != null)
            {
                return guardBlock;
            }

            // Verify the current user is the owner.
            var (canDelete, _) = await _resourceShareService.GetResourceAccessAsync(
                _currentUserId,
                toolToDelete.Id,
                ResourceTypeEnum.Tool,
                toolToDelete.CreatedByUserId ?? Guid.Empty,
                false,
                new[] { ResourceAccessTypeEnum.Owner });

            if (!canDelete)
            {
                return serviceResponse.Update("You do not have access to delete this tool.", 403);
            }

            // Remove related resource shares and delete the tool.
            await _resourceShareService.DeleteResourceSharesAsync(toolToDelete.Id, ResourceTypeEnum.Tool);
            _unitOfWork.ToolRepo.Delete(toolToDelete);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to delete tool {ToolId}.", toolId);
                return serviceResponse;
            }

            return serviceResponse.Update("Tool deleted successfully.", 200, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete tool {ToolId}.", toolId);
        }

        return serviceResponse;
    }

    // Deletes multiple tools by their IDs.
    public async Task<ServiceResponse<bool>> DeleteToolsAsync(List<Guid> toolIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete tools."
        };

        try
        {
            // Fetch all tools matching the provided identifiers.
            var toolsToDelete = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w => toolIds.Contains(w.Id) && w.EnvType == _currentTenantService.CurrentEnvType)
                .ToListAsync();

            if (toolsToDelete.Count == 0)
            {
                return serviceResponse.Update("No tools found to delete.", 404);
            }

            // Verify ownership + PROD-guard for every selected tool.
            var blockedNames = new List<string>();
            foreach (var tool in toolsToDelete)
            {
                var (canDelete, _) = await _resourceShareService.GetResourceAccessAsync(
                    _currentUserId,
                    tool.Id,
                    ResourceTypeEnum.Tool,
                    tool.CreatedByUserId ?? Guid.Empty,
                    false,
                    new[] { ResourceAccessTypeEnum.Owner });

                if (!canDelete)
                {
                    return serviceResponse.Update("You do not have access to delete one or more selected tools.", 403);
                }

                // PROD-guard: block the whole batch if any tool is PROD or has a same-name PROD twin.
                var guardBlock = await DeleteResourceGuard.ValidateAsync(
                    _unitOfWork.ToolRepo,
                    tool.EnvType,
                    tool.Name,
                    w => w.Name.ToLower() == tool.Name.ToLower() &&
                         w.EnvType == ConfigureEnvironmentType.Prod &&
                         w.TenantId == tool.TenantId &&
                         w.SpaceId == tool.SpaceId,
                    "tool");
                if (guardBlock != null)
                {
                    blockedNames.Add(tool.Name);
                }
            }

            // Reject the entire batch when any selected tool is protected by the PROD guard.
            if (blockedNames.Count > 0)
            {
                return serviceResponse.Update(
                    $"Cannot delete the following tool(s) because they are published (PROD) or have a same-name PROD version: {string.Join(", ", blockedNames)}",
                    400,
                    false);
            }

            // Remove related resource shares and delete the tools.
            await _resourceShareService.DeleteResourceSharesAsync(toolIds, ResourceTypeEnum.Tool);
            _unitOfWork.ToolRepo.Delete(toolsToDelete);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to delete {Count} tools.", toolsToDelete.Count);
                return serviceResponse;
            }

            return serviceResponse.Update(
                $"{toolsToDelete.Count} tool(s) deleted successfully.",
                200,
                true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete multiple tools.");
        }

        return serviceResponse;
    }

    // Tests a tool by executing the specified operation.
    public async Task<ServiceResponse<TestToolResponseDto>> TestToolAsync(Guid toolId, TestToolDto testToolDto)
    {
        var serviceResponse = new ServiceResponse<TestToolResponseDto>
        {
            Message = "Failed to test tool."
        };

        try
        {
            // Fetch the tool to test.
            var tool = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w => w.Id == toolId)
                .SingleOrDefaultAsync();

            if (tool == null)
            {
                return serviceResponse.Update("Tool not found.", 404);
            }

            // Verify the current user can test the tool.
            var (canView, _) = await _resourceShareService.GetResourceAccessAsync(
                _currentUserId,
                tool.Id,
                ResourceTypeEnum.Tool,
                tool.CreatedByUserId ?? Guid.Empty,
                tool.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                });

            if (!canView)
            {
                return serviceResponse.Update("You do not have permission to test this tool.", 403);
            }

            // Pass credential identity to the LLM pipeline so it can decrypt and apply auth.
            var credentialName = testToolDto.CredentialName ?? tool.CredentialName;

            // Build the test payload for the LLM pipeline.
            var testPayload = new
            {
                baseUrl = tool.BaseUrl,
                operationId = testToolDto.OperationId,
                parameters = testToolDto.Parameters,
                credentialName,
                openApiSpec = tool.OpenApiSpec,
            };

            var requestJson = System.Text.Json.JsonSerializer.Serialize(testPayload);
            var requestContent = new StringContent(requestJson, Encoding.UTF8, "application/json");

            // Execute the test request with a dedicated HttpClient instance.
            using var llmPipelineClient = new HttpClient();
            llmPipelineClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_accessToken}");
            llmPipelineClient.Timeout = TimeSpan.FromSeconds(30);

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            var llmResponse = await llmPipelineClient.PostAsync($"{_environmentConfig.LlmPipelineApiBaseUrl}/api/custom-tools/test", requestContent);
            stopwatch.Stop();

            var responseBody = await llmResponse.Content.ReadAsStringAsync();

            // Parse the Python response when it returns a successful JSON body.
            TestToolResponseDto? testResult = null;
            if (llmResponse.IsSuccessStatusCode)
            {
                try
                {
                    testResult = System.Text.Json.JsonSerializer.Deserialize<TestToolResponseDto>(responseBody, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                }
                catch (Exception parseEx)
                {
                    _logger.LogWarning(parseEx, "Failed to parse LLM pipeline test response body as JSON.");
                }
            }

            testResult ??= new TestToolResponseDto
            {
                Success = llmResponse.IsSuccessStatusCode,
                StatusCode = (int)llmResponse.StatusCode,
                Body = responseBody,
                DurationMs = stopwatch.Elapsed.TotalMilliseconds,
            };

            // Record per-operation verification (HTTP 200 only, regardless of the
            // response body) and persist immediately. The tool-level flag is kept
            // as an aggregate of its operations for the existing L2 surfaces.
            var isOperationVerified = testResult.StatusCode == 200;
            tool.ParsedSchema = ToolOperationHelpers.SetOperationVerification(
                tool.ParsedSchema,
                testToolDto.OperationId,
                isOperationVerified);
            tool.IsVerified = ToolOperationHelpers.AreAllOperationsVerified(tool.ParsedSchema, tool.IsVerified);
            tool.LastModifiedByUserId = _currentUserId;
            tool.LastModifiedOn = DateTimeOffset.UtcNow;
            _unitOfWork.ToolRepo.Update(tool);
            await _unitOfWork.SaveAsync();

            return serviceResponse.Update(
                testResult.Success ? "Tool test completed successfully." : "Tool test failed.",
                200,
                testResult);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to test tool {ToolId}.", toolId);
        }

        return serviceResponse;
    }

    // Activates or deactivates a tool for use in flows.
    public async Task<ServiceResponse<ToolDto>> SetToolActiveStateAsync(Guid toolId, bool isActive)
    {
        var serviceResponse = new ServiceResponse<ToolDto>
        {
            Message = $"Failed to {(isActive ? "activate" : "deactivate")} tool."
        };

        try
        {
            // Fetch the tool to update.
            var toolToUpdate = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w => w.Id == toolId)
                .SingleOrDefaultAsync();

            if (toolToUpdate == null)
            {
                return serviceResponse.Update("Tool not found.", 404);
            }

            // Verify the current user can edit the tool.
            var (canEdit, _) = await _resourceShareService.GetResourceAccessAsync(
                _currentUserId,
                toolToUpdate.Id,
                ResourceTypeEnum.Tool,
                toolToUpdate.CreatedByUserId ?? Guid.Empty,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                });

            if (!canEdit)
            {
                return serviceResponse.Update($"You do not have access to {(isActive ? "activate" : "deactivate")} this tool.", 403);
            }

            // Update the active state and record the modifier.
            toolToUpdate.IsActive = isActive;
            toolToUpdate.LastModifiedByUserId = _currentUserId;
            toolToUpdate.LastModifiedOn = DateTimeOffset.UtcNow;
            _unitOfWork.ToolRepo.Update(toolToUpdate);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to set active state for tool {ToolId}.", toolId);
                return serviceResponse;
            }

            return serviceResponse.Update(
                $"Tool {(isActive ? "activated" : "deactivated")} successfully.",
                200,
                toolToUpdate.Adapt<ToolDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to set active state for tool {ToolId}.", toolId);
        }

        return serviceResponse;
    }

    // Retrieves all platform's tools available to the current tenant.
    public async Task<ServiceResponse<IEnumerable<ToolDto>>> GetPlatformToolsAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<ToolDto>>
        {
            Message = "Failed to fetch platform tools."
        };

        try
        {
            // Step 1: Load platform-managed tools.
            var platformTools = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w => w.Type == ComponentTypeEnum.Platform)
                .OrderByDescending(o => o.CreatedOn)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .IgnoreQueryFilters()
                .ToListAsync();

            // Step 2: Map to DTOs and assign view access.
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

    private static bool HasUniqueOperationNames(JsonDocument? parsedSchema)
    {
        var names = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        return ToolOperationHelpers.ExtractOperations(parsedSchema)
            .All(operation => !string.IsNullOrWhiteSpace(operation.OperationId) &&
                              names.Add(operation.OperationId.Trim()));
    }


}
