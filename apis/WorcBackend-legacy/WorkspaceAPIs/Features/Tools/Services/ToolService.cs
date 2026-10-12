using WorkspaceAPIs.Features.Tools.Helpers;

namespace WorkspaceAPIs.Services;

public class ToolService : IToolService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ToolService> _logger;
    private readonly IResourceShareService _resourceShareService;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IUserManagementGuardService _userManagementGuardService;

    public ToolService(
        IUnitOfWork unitOfWork,
        ILogger<ToolService> logger,
        IResourceShareService resourceShareService,
        ICurrentTenantService currentTenantService,
        IUserManagementGuardService userManagementGuardService)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _resourceShareService = resourceShareService;
        _currentTenantService = currentTenantService;
        _userManagementGuardService = userManagementGuardService;
    }

    public async Task<ServiceResponse<IEnumerable<ToolDto>>> GetToolsAsync(bool isPersonal)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<ToolDto>>
        {
            Message = "Failed to fetch tools."
        };

        try
        {
            var currentUserId = _currentTenantService.CurrentUserId;

            List<Tool> toolList;
            Dictionary<Guid, ResourceAccessTypeEnum> resourceAccessMap = new();

            if (isPersonal)
            {
                toolList = await _unitOfWork.ToolRepo
                    .GetByConditionAsync(w => w.CreatedByUserId == currentUserId && w.EnvType == _currentTenantService.CurrentEnvType)
                    .OrderByDescending(o => o.CreatedOn)
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.LastModifiedByUser)
                    .ToListAsync();
            }
            else
            {
                resourceAccessMap = await _resourceShareService.GetAccessibleResourcesWithAccessAsync(
                    currentUserId,
                    ResourceTypeEnum.Tool,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                    });

                toolList = await _unitOfWork.ToolRepo
                    .GetByConditionAsync(w =>
                        w.CreatedByUserId != currentUserId &&
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

    public async Task<ServiceResponse<TrueFalseResultDto>> IsToolNameAvailableAsync(CheckAvailabilityDto availabilityDto)
    {
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Message = "Failed to check tool name availability."
        };

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
        var serviceResponse = new ServiceResponse<ToolDto>
        {
            Message = "Failed to fetch tool."
        };

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
                _currentTenantService.CurrentUserId,
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
        var serviceResponse = new ServiceResponse<ToolDto>
        {
            Message = "Failed to fetch tool."
        };

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

            // The unique index is TenantId + SpaceId + EnvType + Name, so resolve deterministically:
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

            var (canView, _) = await _resourceShareService.GetResourceAccessAsync(
                _currentTenantService.CurrentUserId,
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
        var serviceResponse = new ServiceResponse<ToolDto>
        {
            Message = "Failed to create tool."
        };

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

            var currentUserId = _currentTenantService.CurrentUserId;
            var toolToCreate = toolDto.Adapt<Tool>();
            toolToCreate.IsActive = true;
            toolToCreate.Type = ComponentTypeEnum.Custom;
            toolToCreate.EnvType = _currentTenantService.CurrentEnvType;
            toolToCreate.CreatedByUserId = currentUserId;
            toolToCreate.LastModifiedByUserId = currentUserId;
            toolToCreate.CreatedOn = DateTimeOffset.UtcNow;
            toolToCreate.LastModifiedOn = DateTimeOffset.UtcNow;

            if (!string.IsNullOrWhiteSpace(toolDto.OpenApiSpec))
            {
                toolToCreate.ParsedSchema = ToolOperationHelpers.CopyOperationVerification(
                    toolDto.ParsedSchema,
                    OpenApiSpecHelpers.FlattenOpenApiSpec(toolDto.OpenApiSpec));
            }
            else if (toolDto.ManualOperations is { Count: > 0 })
            {
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

            toolToCreate.IsVerified = ToolOperationHelpers.AreAllOperationsVerified(
                toolToCreate.ParsedSchema,
                toolToCreate.IsVerified);

            if (!ToolOperationHelpers.HasUniqueOperationNames(toolToCreate.ParsedSchema))
            {
                return serviceResponse.Update("Method names must be unique, ignoring case.", 400);
            }

            await _unitOfWork.ToolRepo.InsertAsync(toolToCreate);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save new tool '{ToolName}'.", toolDto.Name);
                return serviceResponse;
            }

            if (!await _resourceShareService.AssignOwnerAsync(currentUserId, toolToCreate.Id, ResourceTypeEnum.Tool))
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

    public async Task<ServiceResponse<ToolDto>> UpdateToolAsync(ToolDto toolDto)
    {
        var serviceResponse = new ServiceResponse<ToolDto>
        {
            Message = "Failed to update tool."
        };

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
                _currentTenantService.CurrentUserId,
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
                    EF.Functions.ILike(w.Name, namePattern) &&
                    w.Id != toolDto.Id &&
                    w.EnvType == _currentTenantService.CurrentEnvType)
                .SingleOrDefaultAsync();

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
            toolToUpdate.LastModifiedByUserId = _currentTenantService.CurrentUserId;
            toolToUpdate.LastModifiedOn = DateTimeOffset.UtcNow;

            if (toolDto.IsDisabled.HasValue)
            {
                toolToUpdate.IsDisabled = toolDto.IsDisabled.Value;
            }

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
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete tool."
        };

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
                _currentTenantService.CurrentUserId,
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
        var serviceResponse = new ServiceResponse<int>
        {
            Data = 0,
            Message = "Failed to delete tools."
        };

        try
        {
            var toolsToDelete = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w => toolIds.Contains(w.Id) && w.EnvType == _currentTenantService.CurrentEnvType)
                .ToListAsync();

            if (toolsToDelete.Count == 0)
            {
                return serviceResponse.Update("No tools found to delete.", 404);
            }

            var currentUserId = _currentTenantService.CurrentUserId;
            var blockedNames = new List<string>();
            foreach (var tool in toolsToDelete)
            {
                var (canDelete, _) = await _resourceShareService.GetResourceAccessAsync(
                    currentUserId,
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
        var serviceResponse = new ServiceResponse<ToolDto>
        {
            Message = $"Failed to {(isActive ? "activate" : "deactivate")} tool."
        };

        try
        {
            var toolToUpdate = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w => w.Id == toolId)
                .SingleOrDefaultAsync();

            if (toolToUpdate == null)
            {
                return serviceResponse.Update("Tool not found.", 404);
            }

            var (canEdit, _) = await _resourceShareService.GetResourceAccessAsync(
                _currentTenantService.CurrentUserId,
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
            toolToUpdate.LastModifiedByUserId = _currentTenantService.CurrentUserId;
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
