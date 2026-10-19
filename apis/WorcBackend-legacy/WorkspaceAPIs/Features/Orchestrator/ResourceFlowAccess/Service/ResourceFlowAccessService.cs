namespace WorkspaceAPIs.Services;

public class ResourceFlowAccessService : IResourceFlowAccessService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ResourceFlowAccessService> _logger;
    private readonly IResourceShareService _resourceShareService;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IUserManagementGuardService _userManagementGuardService;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

    private const int MaxFlowsPerAssignment = 100;

    public ResourceFlowAccessService(
        IUnitOfWork unitOfWork,
        ILogger<ResourceFlowAccessService> logger,
        IHttpContextAccessor httpContextAccessor,
        IResourceShareService resourceShareService,
        ICurrentTenantService currentTenantService,
        IUserManagementGuardService userManagementGuardService)
    {
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _tenantId = currentTenantService.CurrentTenantId;

        _unitOfWork = unitOfWork;
        _logger = logger;
        _resourceShareService = resourceShareService;
        _currentTenantService = currentTenantService;
        _userManagementGuardService = userManagementGuardService;
    }

    public async Task<ServiceResponse<AssignResourceFlowsResultDto>> AssignFlowsAsync(ResourceTypeEnum resourceType, Guid resourceId, IEnumerable<Guid> flowIds)
    {
        var serviceResponse = ServiceResponse<AssignResourceFlowsResultDto>.Create("Failed to assign flows", 500);

        try
        {
            var flowIdList = flowIds.ToList();

            if (resourceId == Guid.Empty)
            {
                return serviceResponse.Update("Resource identifier is invalid", 400);
            }

            if (flowIdList.Any(id => id == Guid.Empty))
            {
                return serviceResponse.Update("Flow identifiers cannot contain empty values", 400);
            }

            if (flowIdList.Count != flowIdList.Distinct().Count())
            {
                return serviceResponse.Update("Flow IDs cannot contain duplicates", 400);
            }

            if (flowIdList.Count > MaxFlowsPerAssignment)
            {
                return serviceResponse.Update($"Cannot assign more than {MaxFlowsPerAssignment} flows at a time", 400);
            }

            if (resourceType != ResourceTypeEnum.Tool)
            {
                return serviceResponse.Update($"Resource type '{resourceType}' is not enabled for flow access", 400);
            }

            var tool = await GetToolAsync(resourceId);
            if (tool == null)
            {
                return serviceResponse.Update("The tool does not exist", 404);
            }

            if (tool.Type == ComponentTypeEnum.Platform)
            {
                return serviceResponse.Update("Flow access cannot be configured for platform tools", 400);
            }

            var prodUpdateBlock = ProdResourceUpdateGuard.Validate<AssignResourceFlowsResultDto>(
                tool.EnvType,
                _userManagementGuardService.HasRole(CustomRolesEnum.OM.ToString()),
                "tool");
            if (prodUpdateBlock != null)
            {
                return prodUpdateBlock;
            }

            var (canEdit, _) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                tool.Id,
                ResourceTypeEnum.Tool,
                tool.CreatedByUserId ?? Guid.Empty,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                });

            if (!canEdit)
            {
                return serviceResponse.Update("You do not have access to update this tool", 403);
            }

            var isRestricted = flowIdList.Count > 0;
            var newIds = new List<Guid>();
            var removedIds = new List<Guid>();
            ServiceResponse<AssignResourceFlowsResultDto>? earlyExit = null;

            try
            {
                await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    // IMPORTANT NOTE: serialize concurrent bulk replaces for the same resource. The advisory lock is
                    // transaction-scoped, so the loser re-reads the winner's committed rows instead of hitting a unique violation.
                    await _unitOfWork.AcquireAdvisoryLockAsync($"resource-flow-access:{resourceType}:{resourceId}");

                    var existing = await _unitOfWork.ResourceFlowAccessRepo
                        .GetByConditionAsync(w => w.ResourceType == ResourceTypeEnum.Tool && w.ResourceId == resourceId)
                        .ToListAsync();

                    var existingIds = existing.Select(e => e.FlowId).ToList();
                    newIds = flowIdList.Except(existingIds).ToList();
                    removedIds = existingIds.Except(flowIdList).ToList();

                    var assignableFlows = await _unitOfWork.FlowRepo
                        .GetByConditionAsync(w =>
                            flowIdList.Contains(w.Id) &&
                            w.TenantId == _tenantId &&
                            w.Type != FlowTypesEnum.Block)
                        .IgnoreQueryFilters()
                        .Select(w => new
                        {
                            w.Id,
                            IsMember = w.CreatedByUserId == _userId || (w.FlowUsers != null && w.FlowUsers.Any(a => a.UserId == _userId))
                        })
                        .ToListAsync();

                    var validIds = assignableFlows
                        .Where(w => existingIds.Contains(w.Id) || w.IsMember)
                        .Select(w => w.Id)
                        .ToHashSet();

                    var invalidFlowIds = flowIdList.Where(id => !validIds.Contains(id)).ToList();
                    if (invalidFlowIds.Any())
                    {
                        earlyExit = serviceResponse.Update($"The following flow IDs are invalid: {string.Join(", ", invalidFlowIds)}", 400);
                        return;
                    }

                    if (newIds.Count == 0 && removedIds.Count == 0 && tool.IsResourceAccessRestricted == isRestricted)
                    {
                        earlyExit = serviceResponse.Update("No changes made to the tool assignments", 200, null);
                        return;
                    }

                    var toAdd = newIds.Select(id => new ResourceFlowAccess
                    {
                        TenantId = _tenantId,
                        ResourceType = ResourceTypeEnum.Tool,
                        ResourceId = resourceId,
                        FlowId = id,
                        CreatedByUserId = _userId
                    }).ToList();

                    var toRemove = existing.Where(e => removedIds.Contains(e.FlowId)).ToList();

                    if (toAdd.Count > 0)
                    {
                        await _unitOfWork.ResourceFlowAccessRepo.InsertAsync(toAdd);
                    }

                    if (toRemove.Count > 0)
                    {
                        _unitOfWork.ResourceFlowAccessRepo.Delete(toRemove);
                    }

                    if (tool.IsResourceAccessRestricted != isRestricted)
                    {
                        tool.IsResourceAccessRestricted = isRestricted;
                        _unitOfWork.ToolRepo.Update(tool);
                    }

                    if (!await _unitOfWork.SaveAsync())
                    {
                        earlyExit = serviceResponse.Update("Failed to update flow assignments for the tool", 500);
                    }
                });
            }
            catch (DbUpdateException ex) when (ex.InnerException is Npgsql.PostgresException { SqlState: Npgsql.PostgresErrorCodes.UniqueViolation })
            {
                return serviceResponse.Update("Flow assignments changed concurrently; reload and retry", 409);
            }

            if (earlyExit != null)
            {
                return earlyExit;
            }

            var unassignedPublishedFlows = isRestricted
                ? await GetPublishedFlowsOutsideAccessAsync(tool, flowIdList)
                : new List<string>();

            var message = $"{ResourceFlowAccessHelpers.Pluralize(newIds.Count, "flow")} assigned, {ResourceFlowAccessHelpers.Pluralize(removedIds.Count, "flow")} removed";

            return serviceResponse.Update(message, 200, new AssignResourceFlowsResultDto
            {
                AssignedCount = newIds.Count,
                RemovedCount = removedIds.Count,
                UnassignedPublishedFlows = unassignedPublishedFlows
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to assign flows to resource {ResourceId}.", resourceId);
            return serviceResponse;
        }
    }

    public async Task<ServiceResponse<IEnumerable<ResourceAssignedFlowDto>>> GetAssignedFlowsAsync(ResourceTypeEnum resourceType, Guid resourceId)
    {
        var serviceResponse = ServiceResponse<IEnumerable<ResourceAssignedFlowDto>>.Create("Failed to retrieve flows", 500);

        try
        {
            if (resourceType != ResourceTypeEnum.Tool)
            {
                return serviceResponse.Update($"Resource type '{resourceType}' is not enabled for flow access", 400);
            }

            var tool = await GetToolAsync(resourceId);
            if (tool == null)
            {
                return serviceResponse.Update("The tool does not exist", 404);
            }

            var (canAccess, _) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                tool.Id,
                ResourceTypeEnum.Tool,
                tool.CreatedByUserId ?? Guid.Empty,
                tool.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                    ResourceAccessTypeEnum.View,
                });

            if (!canAccess)
            {
                return serviceResponse.Update("You do not have access to view this tool", 403);
            }

            var assignedIds = await _unitOfWork.ResourceFlowAccessRepo
                .GetByConditionAsync(w => w.ResourceType == ResourceTypeEnum.Tool && w.ResourceId == resourceId)
                .Select(w => w.FlowId)
                .ToListAsync();

            var flows = await _unitOfWork.FlowRepo
                .GetByConditionAsync(w => assignedIds.Contains(w.Id) && w.TenantId == _tenantId && w.Type != FlowTypesEnum.Block)
                .IgnoreQueryFilters()
                .ProjectToType<ResourceAssignedFlowDto>()
                .ToListAsync();

            return serviceResponse.Update(null, 200, flows);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve assigned flows for resource {ResourceId}.", resourceId);
            return serviceResponse;
        }
    }

    public async Task<Dictionary<Guid, HashSet<Guid>>> GetAssignedFlowIdsAsync(ResourceTypeEnum resourceType, IEnumerable<Guid> resourceIds)
    {
        var idList = resourceIds.ToList();
        var rows = await _unitOfWork.ResourceFlowAccessRepo
            .GetByConditionAsync(w => w.ResourceType == resourceType && idList.Contains(w.ResourceId))
            .Select(w => new { w.ResourceId, w.FlowId })
            .ToListAsync();

        return rows
            .GroupBy(w => w.ResourceId)
            .ToDictionary(g => g.Key, g => g.Select(w => w.FlowId).ToHashSet());
    }

    public async Task DeleteResourceFlowAccessesAsync(ResourceTypeEnum resourceType, Guid resourceId)
    {
        await DeleteResourceFlowAccessesAsync(resourceType, new[] { resourceId });
    }

    public async Task DeleteResourceFlowAccessesAsync(ResourceTypeEnum resourceType, IEnumerable<Guid> resourceIds)
    {
        var idList = resourceIds.ToList();
        var accesses = await _unitOfWork.ResourceFlowAccessRepo
            .GetByConditionAsync(w => w.ResourceType == resourceType && idList.Contains(w.ResourceId))
            .ToListAsync();

        if (!accesses.Any())
        {
            return;
        }

        _unitOfWork.ResourceFlowAccessRepo.Delete(accesses);
    }

    public async Task DeleteFlowAccessesIfArchivedAsync(Guid flowId, Guid archivingVersionId)
    {
        var hasActiveVersion = await _unitOfWork.FlowVersionRepo
            .GetByConditionAsync(w => w.FlowId == flowId && w.Id != archivingVersionId && !w.IsArchived)
            .AnyAsync();

        if (hasActiveVersion)
        {
            return;
        }

        await DeleteFlowAccessesAsync(flowId);
    }

    private async Task DeleteFlowAccessesAsync(Guid flowId)
    {
        var accesses = await _unitOfWork.ResourceFlowAccessRepo
            .GetByConditionAsync(w => w.FlowId == flowId)
            .ToListAsync();

        if (!accesses.Any())
        {
            return;
        }

        _unitOfWork.ResourceFlowAccessRepo.Delete(accesses);
    }

    private async Task<List<string>> GetPublishedFlowsOutsideAccessAsync(Tool tool, List<Guid> allowedFlowIds)
    {
        var quotedName = System.Text.Json.JsonSerializer.Serialize(tool.Name);
        var candidates = await _unitOfWork.FlowVersionRepo
            .GetByConditionAsync(w =>
                w.TenantId == _tenantId &&
                w.IsPublished &&
                !w.IsArchived &&
                !allowedFlowIds.Contains(w.FlowId) &&
                w.ResourceReferences != null &&
                w.ResourceReferences.Contains(quotedName))
            .IgnoreQueryFilters()
            .Select(w => new { w.FlowId, w.SpaceId, FlowName = w.Flow!.Name, w.ResourceReferences })
            .ToListAsync();

        var sameNameTools = await _unitOfWork.ToolRepo
            .GetByConditionAsync(w =>
                w.Name == tool.Name &&
                w.Type == ComponentTypeEnum.Custom &&
                w.TenantId == _tenantId &&
                w.EnvType == tool.EnvType)
            .IgnoreQueryFilters()
            .ToListAsync();

        return candidates
            .Where(w =>
                ResourceFlowAccessHelpers.TryReadReferencedToolNames(w.ResourceReferences)?.Contains(tool.Name) == true &&
                ResourceFlowAccessHelpers.PickResolvedTool(sameNameTools, w.SpaceId)?.Id == tool.Id)
            .Select(w => w.FlowName)
            .Distinct()
            .ToList();
    }

    private async Task<Tool?> GetToolAsync(Guid resourceId)
    {
        return await _unitOfWork.ToolRepo
            .GetByConditionAsync(w => w.Id == resourceId && w.EnvType == _currentTenantService.CurrentEnvType)
            .FirstOrDefaultAsync();
    }
}
