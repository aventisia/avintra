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

            if (resourceType is not (ResourceTypeEnum.Tool or ResourceTypeEnum.Queue or ResourceTypeEnum.Skill))
            {
                return serviceResponse.Update($"Resource type '{resourceType}' is not enabled for flow access", 400);
            }

            var resourceLabel = resourceType.ToString().ToLowerInvariant();
            Tool? tool = null;
            Queue? queue = null;
            Skill? skill = null;
            ConfigureEnvironmentType resourceEnvType;
            Guid resourceCreatedByUserId;
            bool isResourceAccessRestricted;

            if (resourceType == ResourceTypeEnum.Tool)
            {
                tool = await GetToolAsync(resourceId);
                if (tool == null)
                {
                    return serviceResponse.Update("The tool does not exist", 404);
                }

                if (tool.Type == ComponentTypeEnum.Platform)
                {
                    return serviceResponse.Update("Flow access cannot be configured for platform tools", 400);
                }

                resourceEnvType = tool.EnvType;
                resourceCreatedByUserId = tool.CreatedByUserId ?? Guid.Empty;
                isResourceAccessRestricted = tool.IsResourceAccessRestricted;
            }
            else if (resourceType == ResourceTypeEnum.Queue)
            {
                queue = await GetQueueAsync(resourceId);
                if (queue == null)
                {
                    return serviceResponse.Update("The queue does not exist", 404);
                }

                resourceEnvType = queue.EnvType;
                resourceCreatedByUserId = queue.CreatedByUserId;
                isResourceAccessRestricted = queue.IsResourceAccessRestricted;
            }
            else
            {
                skill = await GetSkillAsync(resourceId);
                if (skill == null)
                {
                    return serviceResponse.Update("The skill does not exist", 404);
                }

                if (skill.Type == ComponentTypeEnum.Platform || skill.IsGlobal)
                {
                    return serviceResponse.Update("Flow access cannot be configured for platform skills", 400);
                }

                resourceEnvType = skill.EnvType;
                resourceCreatedByUserId = skill.CreatedByUserId;
                isResourceAccessRestricted = skill.IsResourceAccessRestricted;
            }

            var prodUpdateBlock = ProdResourceUpdateGuard.Validate<AssignResourceFlowsResultDto>(
                resourceEnvType,
                _userManagementGuardService.HasRole(CustomRolesEnum.OM.ToString()),
                resourceLabel);
            if (prodUpdateBlock != null)
            {
                return prodUpdateBlock;
            }

            var (canEdit, _) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                resourceId,
                resourceType,
                resourceCreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                });

            if (!canEdit)
            {
                return serviceResponse.Update($"You do not have access to update this {resourceLabel}", 403);
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
                        .GetByConditionAsync(w => w.ResourceType == resourceType && w.ResourceId == resourceId)
                        .ToListAsync();

                    var existingIds = existing.Select(e => e.FlowId).ToList();
                    newIds = flowIdList.Except(existingIds).ToList();
                    removedIds = existingIds.Except(flowIdList).ToList();

                    // IMPORTANT NOTE: grants are tenant-scoped with no space on the relation,
                    // but new picks must come from the current space; already-assigned flows
                    // stay valid so cross-space grants survive a re-save.
                    var currentSpaceId = _currentTenantService.CurrentSpaceId;
                    var candidates = await _unitOfWork.FlowRepo
                        .GetByConditionAsync(w =>
                            flowIdList.Contains(w.Id) &&
                            w.TenantId == _tenantId &&
                            w.Type != FlowTypesEnum.Block)
                        .IgnoreQueryFilters()
                        .Select(w => new
                        {
                            w.Id,
                            w.SpaceId,
                            IsMember = w.CreatedByUserId == _userId || (w.FlowUsers != null && w.FlowUsers.Any(a => a.UserId == _userId))
                        })
                        .ToListAsync();

                    bool InCurrentSpace(Guid? spaceId) =>
                        currentSpaceId == Guid.Empty ? spaceId == null : spaceId == currentSpaceId;

                    var validIds = candidates
                        .Where(w => existingIds.Contains(w.Id) || (InCurrentSpace(w.SpaceId) && w.IsMember))
                        .Select(w => w.Id)
                        .ToHashSet();

                    var invalidFlowIds = flowIdList.Where(id => !validIds.Contains(id)).ToList();
                    if (invalidFlowIds.Any())
                    {
                        var outsideSpaceIds = candidates
                            .Where(w => invalidFlowIds.Contains(w.Id) && !existingIds.Contains(w.Id) && !InCurrentSpace(w.SpaceId))
                            .Select(w => w.Id)
                            .ToList();
                        var message = outsideSpaceIds.Count > 0
                            ? $"The following flows are outside the current space: {string.Join(", ", outsideSpaceIds)}"
                            : $"The following flow IDs are invalid: {string.Join(", ", invalidFlowIds)}";
                        earlyExit = serviceResponse.Update(message, 400);
                        return;
                    }

                    if (newIds.Count == 0 && removedIds.Count == 0 && isResourceAccessRestricted == isRestricted)
                    {
                        earlyExit = serviceResponse.Update($"No changes made to the {resourceLabel} assignments", 200, null);
                        return;
                    }

                    var toAdd = newIds.Select(id => new ResourceFlowAccess
                    {
                        TenantId = _tenantId,
                        ResourceType = resourceType,
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

                    if (isResourceAccessRestricted != isRestricted)
                    {
                        if (tool != null)
                        {
                            tool.IsResourceAccessRestricted = isRestricted;
                            _unitOfWork.ToolRepo.Update(tool);
                        }
                        else if (queue != null)
                        {
                            queue.IsResourceAccessRestricted = isRestricted;
                            _unitOfWork.QueueRepo.Update(queue);
                        }
                        else
                        {
                            skill!.IsResourceAccessRestricted = isRestricted;
                            _unitOfWork.SkillRepo.Update(skill);
                        }
                    }

                    if (!await _unitOfWork.SaveAsync())
                    {
                        earlyExit = serviceResponse.Update($"Failed to update flow assignments for the {resourceLabel}", 500);
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

            var unassignedPublishedFlows = new List<string>();
            if (isRestricted && tool != null)
            {
                unassignedPublishedFlows = await GetPublishedFlowsOutsideAccessAsync(tool, flowIdList);
            }
            else if (isRestricted && queue != null)
            {
                unassignedPublishedFlows = await GetPublishedFlowsOutsideAccessAsync(queue, flowIdList);
            }
            else if (isRestricted && skill != null)
            {
                unassignedPublishedFlows = await GetPublishedFlowsOutsideAccessAsync(skill, flowIdList);
            }

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
            if (resourceType is not (ResourceTypeEnum.Tool or ResourceTypeEnum.Queue or ResourceTypeEnum.Skill))
            {
                return serviceResponse.Update($"Resource type '{resourceType}' is not enabled for flow access", 400);
            }

            var resourceLabel = resourceType.ToString().ToLowerInvariant();
            Guid resourceCreatedByUserId;
            bool isTenantWideAccess;

            if (resourceType == ResourceTypeEnum.Tool)
            {
                var tool = await GetToolAsync(resourceId);
                if (tool == null)
                {
                    return serviceResponse.Update("The tool does not exist", 404);
                }

                resourceCreatedByUserId = tool.CreatedByUserId ?? Guid.Empty;
                isTenantWideAccess = tool.IsTenantWideAccess;
            }
            else if (resourceType == ResourceTypeEnum.Queue)
            {
                var queue = await GetQueueAsync(resourceId);
                if (queue == null)
                {
                    return serviceResponse.Update("The queue does not exist", 404);
                }

                resourceCreatedByUserId = queue.CreatedByUserId;
                isTenantWideAccess = queue.IsTenantWideAccess;
            }
            else
            {
                var skill = await GetSkillAsync(resourceId);
                if (skill == null)
                {
                    return serviceResponse.Update("The skill does not exist", 404);
                }

                resourceCreatedByUserId = skill.CreatedByUserId;
                isTenantWideAccess = skill.IsTenantWideAccess;
            }

            var (canAccess, _) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                resourceId,
                resourceType,
                resourceCreatedByUserId,
                isTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                    ResourceAccessTypeEnum.View,
                });

            if (!canAccess)
            {
                return serviceResponse.Update($"You do not have access to view this {resourceLabel}", 403);
            }

            var assignedIds = await _unitOfWork.ResourceFlowAccessRepo
                .GetByConditionAsync(w => w.ResourceType == resourceType && w.ResourceId == resourceId)
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

    public async Task<Dictionary<Guid, HashSet<Guid>>> GetAssignedResourceIdsAsync(ResourceTypeEnum resourceType, IEnumerable<Guid> flowIds)
    {
        var idList = flowIds.ToList();
        var rows = await _unitOfWork.ResourceFlowAccessRepo
            .GetByConditionAsync(w => w.ResourceType == resourceType && idList.Contains(w.FlowId))
            .Select(w => new { w.ResourceId, w.FlowId })
            .ToListAsync();

        return rows
            .GroupBy(w => w.FlowId)
            .ToDictionary(g => g.Key, g => g.Select(w => w.ResourceId).ToHashSet());
    }

    public async Task<Dictionary<Guid, List<string>>> GetAssignedFlowNamesAsync(ResourceTypeEnum resourceType, IEnumerable<Guid> resourceIds)
    {
        var idList = resourceIds.ToList();
        // IMPORTANT NOTE: grants are tenant-scoped, so this mirrors GetAssignedFlowsAsync:
        // filters are bypassed and the tenant is applied explicitly instead of inheriting
        // the current space, which would silently drop cross-space flows from the names.
        var rows = await _unitOfWork.ResourceFlowAccessRepo
            .GetByConditionAsync(w => w.ResourceType == resourceType && idList.Contains(w.ResourceId))
            .IgnoreQueryFilters()
            .Where(w => w.TenantId == _tenantId)
            .Select(w => new { w.ResourceId, w.Flow!.Name })
            .ToListAsync();

        return rows
            .GroupBy(w => w.ResourceId)
            .ToDictionary(g => g.Key, g => g.Select(w => w.Name).Distinct().ToList());
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

    private async Task<List<string>> GetPublishedFlowsOutsideAccessAsync(Queue queue, List<Guid> allowedFlowIds)
    {
        var quotedName = System.Text.Json.JsonSerializer.Serialize(queue.Name);
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

        var sameNameQueues = await _unitOfWork.QueueRepo
            .GetByConditionAsync(w =>
                w.Name == queue.Name &&
                w.TenantId == _tenantId &&
                w.EnvType == queue.EnvType)
            .IgnoreQueryFilters()
            .ToListAsync();

        return candidates
            .Where(w =>
                ResourceFlowAccessHelpers.TryReadReferencedQueueNames(w.ResourceReferences)?.Contains(queue.Name) == true &&
                ResourceFlowAccessHelpers.PickResolvedQueue(sameNameQueues, w.SpaceId)?.Id == queue.Id)
            .Select(w => w.FlowName)
            .Distinct()
            .ToList();
    }

    private async Task<List<string>> GetPublishedFlowsOutsideAccessAsync(Skill skill, List<Guid> allowedFlowIds)
    {
        var quotedName = System.Text.Json.JsonSerializer.Serialize(skill.Name);
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

        var sameNameSkills = await _unitOfWork.SkillRepo
            .GetByConditionAsync(w =>
                w.Name == skill.Name &&
                w.Type == ComponentTypeEnum.Custom &&
                w.TenantId == _tenantId &&
                w.EnvType == skill.EnvType)
            .IgnoreQueryFilters()
            .ToListAsync();

        return candidates
            .Where(w =>
                ResourceFlowAccessHelpers.TryReadReferencedSkillNames(w.ResourceReferences)?.Contains(skill.Name) == true &&
                ResourceFlowAccessHelpers.PickResolvedSkill(sameNameSkills, w.SpaceId)?.Id == skill.Id)
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

    private async Task<Queue?> GetQueueAsync(Guid resourceId)
    {
        return await _unitOfWork.QueueRepo
            .GetByConditionAsync(w => w.Id == resourceId && w.EnvType == _currentTenantService.CurrentEnvType)
            .FirstOrDefaultAsync();
    }

    private async Task<Skill?> GetSkillAsync(Guid resourceId)
    {
        return await _unitOfWork.SkillRepo
            .GetByConditionAsync(w => w.Id == resourceId && w.EnvType == _currentTenantService.CurrentEnvType)
            .FirstOrDefaultAsync();
    }
}
