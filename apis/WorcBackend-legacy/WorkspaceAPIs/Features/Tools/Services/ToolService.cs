using WorkspaceAPIs.Features.CloudConnectors.Camel.Services;
using WorkspaceAPIs.Features.Corsair;
using WorkspaceAPIs.Features.Tools.Helpers;

namespace WorkspaceAPIs.Services;

public class ToolService : IToolService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ToolService> _logger;
    private readonly IResourceShareService _resourceShareService;
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
        ICurrentTenantService currentTenantService,
        IUserManagementGuardService userManagementGuardService,
        CorsairConfigRepository corsairConfigRepository,
        CamelConnectorCatalogRepository camelConnectorCatalogRepository,
        CorsairIntegrationCatalogRepository corsairIntegrationCatalogRepository)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _resourceShareService = resourceShareService;
        _currentTenantService = currentTenantService;
        _userManagementGuardService = userManagementGuardService;
        _corsairConfigRepository = corsairConfigRepository;
        _camelConnectorCatalogRepository = camelConnectorCatalogRepository;
        _corsairIntegrationCatalogRepository = corsairIntegrationCatalogRepository;
        _currentUserId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _accessToken = GetJwtOfRequestUtil.GetJwtOfRequest(httpContextAccessor.HttpContext) ?? string.Empty;
    }

    public async Task<ServiceResponse<IEnumerable<ToolDto>>> GetToolsAsync(bool isPersonal)
    {
        var serviceResponse = ServiceResponse<IEnumerable<ToolDto>>.Create("Failed to fetch tools.", 500);

        try
        {
            List<Tool> toolList;
            Dictionary<Guid, ResourceAccessTypeEnum> resourceAccessMap = new();

            if (isPersonal)
            {
                toolList = await _unitOfWork.ToolRepo
                    .GetByConditionAsync(w => w.CreatedByUserId == _currentUserId && w.EnvType == _currentTenantService.CurrentEnvType)
                    .OrderByDescending(o => o.CreatedOn)
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.LastModifiedByUser)
                    .ToListAsync();
            }
            else
            {
                resourceAccessMap = await _resourceShareService.GetAccessibleResourcesWithAccessAsync(
                    _currentUserId,
                    ResourceTypeEnum.Tool,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                    });

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
                    IconUrl = w.IconUrl,
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

        // Verification is tracked per operation, so the tool-level aggregate must
        // not hide tools that still expose verified operations. Unverified
        // operations stay visible (flagged via the operation's IsVerified) and the
        // invoke endpoint rejects them at runtime.
        return w =>
            w.IsActive &&
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
            return VaultCredentialTypesEnum.CustomApiTool.ToString();
        }

        // Platform Corsair tools map their plugin id to a vault type via the integration catalog.
        var pluginId = ToolOperationHelpers.TryGetCorsairPluginId(tool.ParsedSchema);
        return string.IsNullOrWhiteSpace(pluginId)
            ? null
            : _corsairConfigRepository.GetPluginIdForVaultCredentialType(pluginId);
    }

    // Checks whether a tool name is available for use.
    public async Task<ServiceResponse<TrueFalseResultDto>> IsToolNameAvailableAsync(CheckAvailabilityDto availabilityDto)
    {
        var serviceResponse = ServiceResponse<TrueFalseResultDto>.Create("Failed to check tool name availability.", 500);

        try
        {
            var normalizedName = availabilityDto.UserInput?.Trim();
            if (string.IsNullOrWhiteSpace(normalizedName))
            {
                return serviceResponse.Update(
                    "Tool name cannot be empty.",
                    200,
                    new TrueFalseResultDto { Result = false });
            }

            var namePattern = ToolNameMatchHelpers.ToExactMatchPattern(normalizedName.ToLowerInvariant());

            var toolNameExists = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w =>
                    (
                        w.Type == ComponentTypeEnum.Platform ||
                        (w.Type == ComponentTypeEnum.Custom &&
                        w.TenantId == _currentTenantService.CurrentTenantId)
                    ) &&
                    EF.Functions.ILike(w.Name, namePattern) &&
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

    public async Task<ServiceResponse<ToolDto>> GetToolByIdAsync(Guid toolId)
    {
        var serviceResponse = ServiceResponse<ToolDto>.Create("Failed to fetch tool.", 500);

        try
        {
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

    public async Task<ServiceResponse<ToolDto>> GetToolByNameAsync(string toolName)
    {
        var serviceResponse = ServiceResponse<ToolDto>.Create("Failed to fetch tool.", 500);

        try
        {
            if (string.IsNullOrWhiteSpace(toolName))
            {
                return serviceResponse.Update("Tool name is required.", 400);
            }

            var normalizedName = toolName.Trim().ToLowerInvariant();
            var namePattern = ToolNameMatchHelpers.ToExactMatchPattern(normalizedName);

            var toolCandidates = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w =>
                    EF.Functions.ILike(w.Name, namePattern) &&
                    w.EnvType == _currentTenantService.CurrentEnvType)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .IgnoreQueryFilters()
                .OrderBy(w => w.CreatedOn)
                .ToListAsync();

            // IMPORTANT NOTE: the unique index is TenantId + SpaceId + EnvType + Name, so resolution is
            // deterministic: the request's space first, then Central (null), then the oldest record.
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

    public async Task<ServiceResponse<ToolDto>> InsertToolAsync(ToolDto toolDto)
    {
        var serviceResponse = ServiceResponse<ToolDto>.Create("Failed to create tool.", 500);

        try
        {
            var prodBlock = CreateResourceGuard.Validate<ToolDto>(
                _currentTenantService.CurrentEnvType,
                "tool");
            if (prodBlock != null)
            {
                return prodBlock;
            }

            toolDto = TrimDtoStringPropsUtil.TrimDtoStringProps(toolDto);

            if (string.IsNullOrWhiteSpace(toolDto.IconUrl))
            {
                toolDto.IconUrl = null;
            }

            var namePattern = ToolNameMatchHelpers.ToExactMatchPattern(toolDto.Name.ToLowerInvariant());

            var toolWithSameName = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w =>
                    (
                        w.Type == ComponentTypeEnum.Platform ||
                        (w.Type == ComponentTypeEnum.Custom &&
                        w.TenantId == _currentTenantService.CurrentTenantId)
                    ) &&
                    EF.Functions.ILike(w.Name, namePattern) &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .IgnoreQueryFilters()
                .AnyAsync();

            if (toolWithSameName)
            {
                return serviceResponse.Update($"Tool '{toolDto.Name}' already exists.", 409);
            }

            var toolToCreate = toolDto.Adapt<Tool>();
            toolToCreate.IsActive = true;
            toolToCreate.Type = ComponentTypeEnum.Custom;
            toolToCreate.EnvType = _currentTenantService.CurrentEnvType;
            toolToCreate.CreatedByUserId = _currentUserId;
            toolToCreate.LastModifiedByUserId = _currentUserId;
            toolToCreate.CreatedOn = DateTimeOffset.UtcNow;
            toolToCreate.LastModifiedOn = DateTimeOffset.UtcNow;
            toolToCreate.ParsedSchema = null;

            if (!string.IsNullOrWhiteSpace(toolDto.OpenApiSpec))
            {
                var parsedSchema = OpenApiSpecHelpers.FlattenOpenApiSpec(toolDto.OpenApiSpec);
                if (parsedSchema is null)
                {
                    return serviceResponse.Update("The OpenAPI specification could not be parsed.", 400);
                }

                toolToCreate.ParsedSchema = parsedSchema;
            }
            else if (toolDto.ManualOperations is { Count: > 0 })
            {
                var synthesizedSpec = ManualOpenApiSynthesizer.Synthesize(
                    toolDto.ManualOperations,
                    toolDto.Name);
                if (synthesizedSpec is null)
                {
                    return serviceResponse.Update(
                        "At least one valid operation (method and endpoint) is required.",
                        400);
                }

                var parsedSchema = OpenApiSpecHelpers.FlattenOpenApiSpec(synthesizedSpec);
                if (parsedSchema is null)
                {
                    return serviceResponse.Update("The synthesized OpenAPI specification could not be parsed.", 400);
                }

                toolToCreate.OpenApiSpec = synthesizedSpec;
                toolToCreate.ParsedSchema = parsedSchema;
            }

            toolToCreate.IsVerified = ToolOperationHelpers.AreAllOperationsVerified(toolToCreate.ParsedSchema);

            if (!ToolOperationHelpers.HasUniqueOperationNames(toolToCreate.ParsedSchema))
            {
                return serviceResponse.Update("Method names must be unique, ignoring case.", 400);
            }

            try
            {
                await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    await _unitOfWork.ToolRepo.InsertAsync(toolToCreate);
                    if (!await _unitOfWork.SaveAsync())
                    {
                        throw new InvalidOperationException("The new tool was not persisted.");
                    }

                    if (!await _resourceShareService.AssignOwnerAsync(_currentUserId, toolToCreate.Id, ResourceTypeEnum.Tool))
                    {
                        throw new InvalidOperationException("Tool ownership assignment failed.");
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create tool '{ToolName}' with its ownership share.", toolDto.Name);
                return serviceResponse.Update("Failed to create the tool and assign its ownership.", 500);
            }

            return serviceResponse.Update(
                "Tool created successfully.",
                201,
                toolToCreate.Adapt<ToolDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create tool '{ToolName}'.", toolDto.Name);
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<ToolDto>> UpdateToolAsync(ToolDto toolDto)
    {
        var serviceResponse = ServiceResponse<ToolDto>.Create("Failed to update tool.", 500);

        try
        {
            toolDto = TrimDtoStringPropsUtil.TrimDtoStringProps(toolDto);

            if (string.IsNullOrWhiteSpace(toolDto.IconUrl))
            {
                toolDto.IconUrl = null;
            }

            var toolToUpdate = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w => w.Id == toolDto.Id && w.EnvType == _currentTenantService.CurrentEnvType)
                .SingleOrDefaultAsync();

            if (toolToUpdate == null)
            {
                return serviceResponse.Update("Tool not found.", 404);
            }

            var prodUpdateBlock = ProdResourceUpdateGuard.Validate<ToolDto>(
                toolToUpdate.EnvType,
                _userManagementGuardService.HasRole(CustomRolesEnum.OM.ToString()),
                "tool");
            if (prodUpdateBlock != null)
            {
                return prodUpdateBlock;
            }

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

            var namePattern = ToolNameMatchHelpers.ToExactMatchPattern(toolDto.Name.ToLowerInvariant());

            var otherToolWithSameName = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w =>
                    (
                        w.Type == ComponentTypeEnum.Platform ||
                        (w.Type == ComponentTypeEnum.Custom &&
                        w.TenantId == _currentTenantService.CurrentTenantId)
                    ) &&
                    EF.Functions.ILike(w.Name, namePattern) &&
                    w.EnvType == _currentTenantService.CurrentEnvType &&
                    w.Id != toolDto.Id)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            if (otherToolWithSameName != null)
            {
                return serviceResponse.Update($"Tool '{toolDto.Name}' already exists.", 409);
            }

            toolToUpdate.Description = toolDto.Description;
            toolToUpdate.IconUrl = toolDto.IconUrl;
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

            if (!string.IsNullOrWhiteSpace(toolDto.OpenApiSpec) &&
                toolToUpdate.OpenApiSpec != toolDto.OpenApiSpec)
            {
                var parsedSchema = OpenApiSpecHelpers.FlattenOpenApiSpec(toolDto.OpenApiSpec);
                if (parsedSchema is null)
                {
                    return serviceResponse.Update("The OpenAPI specification could not be parsed.", 400);
                }

                toolToUpdate.OpenApiSpec = toolDto.OpenApiSpec;
                toolToUpdate.ParsedSchema =
                    ToolOperationHelpers.CopyOperationVerification(toolToUpdate.ParsedSchema, parsedSchema);
            }
            else if (toolDto.ManualOperations is { Count: > 0 } &&
                     string.IsNullOrWhiteSpace(toolToUpdate.OpenApiSpec))
            {
                var synthesizedSpec = ManualOpenApiSynthesizer.Synthesize(
                    toolDto.ManualOperations,
                    toolDto.Name);
                if (synthesizedSpec is null)
                {
                    return serviceResponse.Update(
                        "At least one valid operation (method and endpoint) is required.",
                        400);
                }

                var parsedSchema = OpenApiSpecHelpers.FlattenOpenApiSpec(synthesizedSpec);
                if (parsedSchema is null)
                {
                    return serviceResponse.Update("The synthesized OpenAPI specification could not be parsed.", 400);
                }

                toolToUpdate.OpenApiSpec = synthesizedSpec;
                toolToUpdate.ParsedSchema =
                    ToolOperationHelpers.CopyOperationVerification(toolToUpdate.ParsedSchema, parsedSchema);
            }

            toolToUpdate.IsVerified = ToolOperationHelpers.AreAllOperationsVerified(
                toolToUpdate.ParsedSchema,
                toolToUpdate.IsVerified);

            if (!ToolOperationHelpers.HasUniqueOperationNames(toolToUpdate.ParsedSchema))
            {
                return serviceResponse.Update("Method names must be unique, ignoring case.", 400);
            }

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

    public async Task<ServiceResponse<bool>> DeleteToolAsync(Guid toolId)
    {
        var serviceResponse = ServiceResponse<bool>.Create("Failed to delete tool.", 500, false);

        try
        {
            var toolToDelete = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w => w.Id == toolId && w.EnvType == _currentTenantService.CurrentEnvType)
                .SingleOrDefaultAsync();

            if (toolToDelete == null)
            {
                return serviceResponse.Update("Tool not found.", 404);
            }

            var namePattern = ToolNameMatchHelpers.ToExactMatchPattern(toolToDelete.Name.ToLowerInvariant());
            var guardBlock = await DeleteResourceGuard.ValidateAsync(
                _unitOfWork.ToolRepo,
                toolToDelete.EnvType,
                toolToDelete.Name,
                w => EF.Functions.ILike(w.Name, namePattern) &&
                     w.EnvType == ConfigureEnvironmentType.Prod &&
                     w.TenantId == toolToDelete.TenantId &&
                     w.SpaceId == toolToDelete.SpaceId,
                "tool");
            if (guardBlock != null)
            {
                return guardBlock;
            }

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

    public async Task<ServiceResponse<int>> DeleteToolsAsync(List<Guid> toolIds)
    {
        var serviceResponse = ServiceResponse<int>.Create("Failed to delete tools.", 500, 0);

        try
        {
            var toolsToDelete = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w => toolIds.Contains(w.Id) && w.EnvType == _currentTenantService.CurrentEnvType)
                .ToListAsync();

            if (toolsToDelete.Count == 0)
            {
                return serviceResponse.Update("No tools found to delete.", 404);
            }

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

                var namePattern = ToolNameMatchHelpers.ToExactMatchPattern(tool.Name.ToLowerInvariant());
                var guardBlock = await DeleteResourceGuard.ValidateAsync(
                    _unitOfWork.ToolRepo,
                    tool.EnvType,
                    tool.Name,
                    w => EF.Functions.ILike(w.Name, namePattern) &&
                         w.EnvType == ConfigureEnvironmentType.Prod &&
                         w.TenantId == tool.TenantId &&
                         w.SpaceId == tool.SpaceId,
                    "tool");
                if (guardBlock != null)
                {
                    blockedNames.Add(tool.Name);
                }
            }

            if (blockedNames.Count > 0)
            {
                return serviceResponse.Update(
                    $"Cannot delete the following tool(s) because they are published (PROD) or have a same-name PROD version: {string.Join(", ", blockedNames)}",
                    400,
                    0);
            }

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
                toolsToDelete.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete multiple tools.");
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<ToolDto>> SetToolActiveStateAsync(Guid toolId, bool isActive)
    {
        var serviceResponse = ServiceResponse<ToolDto>.Create(
            $"Failed to {(isActive ? "activate" : "deactivate")} tool.",
            500);

        try
        {
            var toolToUpdate = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w => w.Id == toolId && w.EnvType == _currentTenantService.CurrentEnvType)
                .SingleOrDefaultAsync();

            if (toolToUpdate == null)
            {
                return serviceResponse.Update("Tool not found.", 404);
            }

            var prodUpdateBlock = ProdResourceUpdateGuard.Validate<ToolDto>(
                toolToUpdate.EnvType,
                _userManagementGuardService.HasRole(CustomRolesEnum.OM.ToString()),
                "tool");
            if (prodUpdateBlock != null)
            {
                return prodUpdateBlock;
            }

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

}
