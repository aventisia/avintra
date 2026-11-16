using ExecutorLibrary.Helpers;
using ExecutorLibrary.Models;

namespace WorkspaceAPIs.Services;

public class ResourceFlowAccessService : IResourceFlowAccessService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ResourceFlowAccessService> _logger;
    private readonly IResourceUserAccessService _resourceUserAccessService;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IUserManagementGuardService _userManagementGuardService;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

    private const int MaxFlowsPerAssignment = 100;

    public ResourceFlowAccessService(
        IUnitOfWork unitOfWork,
        ILogger<ResourceFlowAccessService> logger,
        IHttpContextAccessor httpContextAccessor,
        IResourceUserAccessService resourceUserAccessService,
        ICurrentTenantService currentTenantService,
        IUserManagementGuardService userManagementGuardService)
    {
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _tenantId = currentTenantService.CurrentTenantId;

        _unitOfWork = unitOfWork;
        _logger = logger;
        _resourceUserAccessService = resourceUserAccessService;
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

            if (resourceType is not (ResourceTypeEnum.Tool or ResourceTypeEnum.Queue or ResourceTypeEnum.Skill or ResourceTypeEnum.KnowledgeBase or ResourceTypeEnum.VaultCredential or ResourceTypeEnum.ConfigStore))
            {
                return serviceResponse.Update($"Resource type '{resourceType}' is not enabled for flow access", 400);
            }

            var resourceLabel = resourceType == ResourceTypeEnum.VaultCredential
                ? "credential"
                : resourceType.ToString().ToLowerInvariant();
            Tool? tool = null;
            Queue? queue = null;
            Skill? skill = null;
            ConfigStore? configStore = null;
            KnowledgeBase? knowledgeBase = null;
            VaultCredential? vaultCredential = null;
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
            else if (resourceType == ResourceTypeEnum.Skill)
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
            else if (resourceType == ResourceTypeEnum.ConfigStore)
            {
                configStore = await GetConfigStoreAsync(resourceId);
                if (configStore == null)
                {
                    return serviceResponse.Update("The key store does not exist", 404);
                }

                resourceEnvType = configStore.EnvType;
                resourceCreatedByUserId = configStore.CreatedByUserId;
                isResourceAccessRestricted = configStore.IsResourceAccessRestricted;
            }
            else if (resourceType == ResourceTypeEnum.KnowledgeBase)
            {
                knowledgeBase = await GetKnowledgeBaseAsync(resourceId);
                if (knowledgeBase == null)
                {
                    return serviceResponse.Update("The knowledge base does not exist", 404);
                }

                resourceEnvType = knowledgeBase.EnvType;
                resourceCreatedByUserId = knowledgeBase.CreatedByUserId;
                isResourceAccessRestricted = knowledgeBase.IsResourceAccessRestricted;
            }
            else
            {
                vaultCredential = await GetVaultCredentialAsync(resourceId);
                if (vaultCredential == null)
                {
                    return serviceResponse.Update("The credential does not exist", 404);
                }

                resourceEnvType = vaultCredential.EnvType;
                resourceCreatedByUserId = vaultCredential.CreatedByUserId;
                isResourceAccessRestricted = vaultCredential.IsResourceAccessRestricted;
            }

            var prodUpdateBlock = ProdResourceUpdateGuard.Validate<AssignResourceFlowsResultDto>(
                resourceEnvType,
                _userManagementGuardService.HasRole(CustomRolesEnum.OM.ToString()),
                resourceLabel);
            if (prodUpdateBlock != null)
            {
                return prodUpdateBlock;
            }

            var (canEdit, _) = await _resourceUserAccessService.GetResourceAccessAsync(
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
                        else if (skill != null)
                        {
                            skill.IsResourceAccessRestricted = isRestricted;
                            _unitOfWork.SkillRepo.Update(skill);
                        }
                        else if (configStore != null)
                        {
                            configStore.IsResourceAccessRestricted = isRestricted;
                            _unitOfWork.ConfigStoreRepo.Update(configStore);
                        }
                        else if (knowledgeBase != null)
                        {
                            knowledgeBase.IsResourceAccessRestricted = isRestricted;
                            _unitOfWork.KnowledgeBaseRepo.Update(knowledgeBase);
                        }
                        else
                        {
                            vaultCredential!.IsResourceAccessRestricted = isRestricted;
                            _unitOfWork.VaultCredentialRepo.Update(vaultCredential);
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
            else if (isRestricted && knowledgeBase != null)
            {
                unassignedPublishedFlows = await GetPublishedFlowsOutsideAccessAsync(knowledgeBase, flowIdList);
            }
            else if (isRestricted && vaultCredential != null)
            {
                unassignedPublishedFlows = await GetPublishedFlowsOutsideAccessAsync(vaultCredential, flowIdList);
            }
            else if (isRestricted && configStore != null)
            {
                unassignedPublishedFlows = await GetPublishedFlowsOutsideAccessAsync(configStore, flowIdList);
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
            if (resourceType is not (ResourceTypeEnum.Tool or ResourceTypeEnum.Queue or ResourceTypeEnum.Skill or ResourceTypeEnum.KnowledgeBase or ResourceTypeEnum.VaultCredential or ResourceTypeEnum.ConfigStore))
            {
                return serviceResponse.Update($"Resource type '{resourceType}' is not enabled for flow access", 400);
            }

            var resourceLabel = resourceType == ResourceTypeEnum.VaultCredential
                ? "credential"
                : resourceType.ToString().ToLowerInvariant();
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
            else if (resourceType == ResourceTypeEnum.Skill)
            {
                var skill = await GetSkillAsync(resourceId);
                if (skill == null)
                {
                    return serviceResponse.Update("The skill does not exist", 404);
                }

                resourceCreatedByUserId = skill.CreatedByUserId;
                isTenantWideAccess = skill.IsTenantWideAccess;
            }
            else if (resourceType == ResourceTypeEnum.ConfigStore)
            {
                var configStore = await GetConfigStoreAsync(resourceId);
                if (configStore == null)
                {
                    return serviceResponse.Update("The key store does not exist", 404);
                }

                resourceCreatedByUserId = configStore.CreatedByUserId;
                isTenantWideAccess = configStore.IsTenantWideAccess;
            }
            else if (resourceType == ResourceTypeEnum.KnowledgeBase)
            {
                var knowledgeBase = await GetKnowledgeBaseAsync(resourceId);
                if (knowledgeBase == null)
                {
                    return serviceResponse.Update("The knowledge base does not exist", 404);
                }

                resourceCreatedByUserId = knowledgeBase.CreatedByUserId;
                isTenantWideAccess = knowledgeBase.IsTenantWideAccess;
            }
            else
            {
                var vaultCredential = await GetVaultCredentialAsync(resourceId);
                if (vaultCredential == null)
                {
                    return serviceResponse.Update("The credential does not exist", 404);
                }

                resourceCreatedByUserId = vaultCredential.CreatedByUserId;
                isTenantWideAccess = vaultCredential.IsTenantWideAccess;
            }

            var (canAccess, _) = await _resourceUserAccessService.GetResourceAccessAsync(
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

    public async Task<ServiceResponse<IEnumerable<LinkedShareCandidateDto>>> GetLinkedShareCandidatesAsync(ResourceTypeEnum resourceType, Guid resourceId, IEnumerable<Guid> userIds)
    {
        var serviceResponse = ServiceResponse<IEnumerable<LinkedShareCandidateDto>>.Create("Failed to retrieve linked share candidates", 500);

        try
        {
            if (resourceType is not (ResourceTypeEnum.Flow or ResourceTypeEnum.FlowVersion))
            {
                return serviceResponse.Update($"Resource type '{resourceType}' is not an agent", 400);
            }

            var agent = await LoadAgentRunGraphAsync(resourceType, resourceId);
            if (agent == null)
            {
                return serviceResponse.Update("The agent does not exist", 404);
            }

            var (canRead, _) = await _resourceUserAccessService.GetResourceAccessAsync(
                _userId,
                resourceId,
                resourceType,
                agent.CreatedByUserId,
                agent.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.FullAccess,
                    ResourceAccessTypeEnum.Edit,
                    ResourceAccessTypeEnum.View,
                });

            if (!canRead)
            {
                return serviceResponse.Update("You do not have access to view this agent", 403);
            }

            var recipientIds = userIds.Distinct().ToList();
            var linkedResources = await ResolveLinkedResourcesAsync(agent);
            var assignedKeys = await GetRecipientAccessKeysAsync(linkedResources, recipientIds);
            var ownerNames = await GetOwnerNamesAsync(linkedResources);
            var candidates = new List<LinkedShareCandidateDto>();

            foreach (var linkedResource in linkedResources)
            {
                candidates.Add(new LinkedShareCandidateDto
                {
                    ResourceType = linkedResource.ResourceType,
                    ResourceId = linkedResource.ResourceId,
                    Name = linkedResource.Name,
                    OwnerName = ownerNames.GetValueOrDefault(linkedResource.CreatedByUserId),
                    IsTenantWideAccess = linkedResource.IsTenantWideAccess,
                    CanShare = await _resourceUserAccessService.CanShareResourceAsync(linkedResource.ResourceId, linkedResource.ResourceType),
                    UserIdsNeedingShare = linkedResource.IsTenantWideAccess
                        ? []
                        : recipientIds
                            .Where(w => w != linkedResource.CreatedByUserId &&
                                !assignedKeys.Contains((linkedResource.ResourceType, linkedResource.ResourceId, w)))
                            .ToList(),
                });
            }

            return serviceResponse.Update(null, 200, candidates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve linked share candidates for {ResourceType} {ResourceId}.", resourceType, resourceId);
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

    private sealed record AgentRunGraph(
        Guid FlowId,
        Guid TenantId,
        Guid? SpaceId,
        Guid CreatedByUserId,
        bool IsTenantWideAccess,
        ConfigureEnvironmentType EnvType,
        string? ReactFlowObject);

    private sealed record LinkedResource(
        ResourceTypeEnum ResourceType,
        Guid ResourceId,
        string Name,
        Guid CreatedByUserId,
        bool IsTenantWideAccess);

    private async Task<AgentRunGraph?> LoadAgentRunGraphAsync(ResourceTypeEnum resourceType, Guid resourceId)
    {
        if (resourceType == ResourceTypeEnum.FlowVersion)
        {
            var flowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w => w.Id == resourceId)
                .Include(w => w.Flow)
                .SingleOrDefaultAsync();

            return flowVersion?.Flow == null
                ? null
                : new AgentRunGraph(
                    flowVersion.FlowId,
                    flowVersion.TenantId,
                    flowVersion.Flow.SpaceId,
                    flowVersion.CreatedByUserId,
                    flowVersion.IsTenantWideAccess,
                    flowVersion.IsPublished ? ConfigureEnvironmentType.Prod : ConfigureEnvironmentType.Dev,
                    flowVersion.ReactFlowObject);
        }

        var flow = await _unitOfWork.FlowRepo
            .GetByConditionAsync(w => w.Id == resourceId)
            .SingleOrDefaultAsync();

        if (flow == null)
        {
            return null;
        }

        // IMPORTANT NOTE: a Flow share covers every version, so the Dev items come from its newest
        // non-archived version, the graph a draft run of the agent executes.
        var draftVersion = await _unitOfWork.FlowVersionRepo
            .GetByConditionAsync(w => w.FlowId == flow.Id && !w.IsArchived)
            .OrderByDescending(w => w.VersionNumber)
            .ThenByDescending(w => w.CreatedOn)
            .FirstOrDefaultAsync();

        return new AgentRunGraph(
            flow.Id,
            flow.TenantId,
            flow.SpaceId,
            flow.CreatedByUserId,
            flow.IsTenantWideAccess,
            ConfigureEnvironmentType.Dev,
            draftVersion?.ReactFlowObject);
    }

    private async Task<List<LinkedResource>> ResolveLinkedResourcesAsync(AgentRunGraph agent)
    {
        var graphs = new List<(Guid FlowId, ReactFlowDataModel Graph)>();
        await CollectRunGraphsAsync(agent.TenantId, agent.FlowId, agent.ReactFlowObject, graphs, new HashSet<Guid>());

        if (graphs.Count == 0)
        {
            return [];
        }

        var references = await CollectRunReferencedNamesAsync(graphs, agent);
        var targetSpaceId = agent.SpaceId == Guid.Empty ? null : agent.SpaceId;
        var linkedResources = new List<LinkedResource>();

        linkedResources.AddRange((await ResolveRunToolsAsync(agent.TenantId, agent.EnvType, targetSpaceId, references["tools"]))
            .Values.Select(w => new LinkedResource(ResourceTypeEnum.Tool, w.Id, w.Name, w.CreatedByUserId ?? Guid.Empty, w.IsTenantWideAccess)));
        linkedResources.AddRange((await ResolveRunQueuesAsync(agent.TenantId, agent.EnvType, targetSpaceId, references["queues"]))
            .Values.Select(w => new LinkedResource(ResourceTypeEnum.Queue, w.Id, w.Name, w.CreatedByUserId, w.IsTenantWideAccess)));
        linkedResources.AddRange((await ResolveRunVaultCredentialsAsync(agent.TenantId, agent.EnvType, targetSpaceId, references["credentials"]))
            .Values.Select(w => new LinkedResource(ResourceTypeEnum.VaultCredential, w.Id, w.Name, w.CreatedByUserId, w.IsTenantWideAccess)));
        linkedResources.AddRange((await ResolveRunConfigStoresAsync(agent.TenantId, agent.EnvType, targetSpaceId, references["configStores"]))
            .Values.Select(w => new LinkedResource(ResourceTypeEnum.ConfigStore, w.Id, w.Name, w.CreatedByUserId, w.IsTenantWideAccess)));
        linkedResources.AddRange((await ResolveRunKnowledgeBasesAsync(agent.TenantId, agent.EnvType, targetSpaceId, references["knowledgeBases"]))
            .Values.Select(w => new LinkedResource(ResourceTypeEnum.KnowledgeBase, w.Id, w.Name, w.CreatedByUserId, w.IsTenantWideAccess)));
        linkedResources.AddRange((await ResolveRunSkillsAsync(agent.TenantId, agent.EnvType, targetSpaceId, references["skills"]))
            .Values.Select(w => new LinkedResource(ResourceTypeEnum.Skill, w.Id, w.Name, w.CreatedByUserId, w.IsTenantWideAccess)));

        // IMPORTANT NOTE: a trigger and a called agent are never linked items; a trigger starts a
        // published agent by itself and a run never checks the runner's access to a called agent.
        return linkedResources
            .GroupBy(w => (w.ResourceType, w.ResourceId))
            .Select(group => group.First())
            .OrderBy(w => w.ResourceType)
            .ThenBy(w => w.Name)
            .ToList();
    }

    private async Task<Dictionary<string, List<string>>> CollectRunReferencedNamesAsync(
        List<(Guid FlowId, ReactFlowDataModel Graph)> graphs,
        AgentRunGraph agent)
    {
        var references = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase);

        foreach (var (_, graph) in graphs)
        {
            foreach (var (referenceKey, names) in ResourceFlowAccessHelpers.CollectReferencedResourceNames(graph))
            {
                if (!references.TryGetValue(referenceKey, out var collectedNames))
                {
                    collectedNames = [];
                    references[referenceKey] = collectedNames;
                }

                collectedNames.AddRange(names.Where(w => !collectedNames.Contains(w, StringComparer.OrdinalIgnoreCase)));
            }
        }

        await NormalizeLegacyCredentialNamesAsync(references["credentials"], agent);

        return references;
    }

    // IMPORTANT NOTE: legacy graphs store a credential GUID where newer ones store its name, so the
    // value is resolved the same way publish resolves it before run-time resolution looks it up.
    private async Task NormalizeLegacyCredentialNamesAsync(List<string> credentialNames, AgentRunGraph agent)
    {
        if (credentialNames.Count == 0)
        {
            return;
        }

        var normalizedNames = credentialNames.Select(w => w.ToLowerInvariant()).ToList();
        var knownNames = (await _unitOfWork.VaultCredentialRepo
                .GetByConditionAsync(w => normalizedNames.Contains(w.Name.ToLower()) && w.TenantId == agent.TenantId && w.EnvType == agent.EnvType)
                .IgnoreQueryFilters()
                .Select(w => w.Name.ToLower())
                .ToListAsync())
            .ToHashSet();

        var legacyIds = credentialNames
            .Where(w => !knownNames.Contains(w.ToLowerInvariant()) && Guid.TryParse(w, out _))
            .Select(Guid.Parse)
            .ToList();

        if (legacyIds.Count == 0)
        {
            return;
        }

        var namesById = await _unitOfWork.VaultCredentialRepo
            .GetByConditionAsync(w => legacyIds.Contains(w.Id) && w.TenantId == agent.TenantId && w.EnvType == agent.EnvType)
            .IgnoreQueryFilters()
            .Select(w => new { w.Id, w.Name })
            .ToDictionaryAsync(w => w.Id, w => w.Name);

        for (var index = 0; index < credentialNames.Count; index++)
        {
            var value = credentialNames[index];
            if (knownNames.Contains(value.ToLowerInvariant()) || !Guid.TryParse(value, out var legacyId))
            {
                continue;
            }

            if (namesById.TryGetValue(legacyId, out var resolvedName))
            {
                credentialNames[index] = resolvedName;
            }
        }
    }

    private async Task<HashSet<(ResourceTypeEnum ResourceType, Guid ResourceId, Guid UserId)>> GetRecipientAccessKeysAsync(
        List<LinkedResource> linkedResources,
        List<Guid> recipientIds)
    {
        var accessKeys = new HashSet<(ResourceTypeEnum, Guid, Guid)>();

        if (linkedResources.Count == 0 || recipientIds.Count == 0)
        {
            return accessKeys;
        }

        foreach (var resourceGroup in linkedResources.GroupBy(w => w.ResourceType))
        {
            var resourceIds = resourceGroup.Select(w => w.ResourceId).ToList();
            var rows = await _unitOfWork.ResourceUserAccessRepo
                .GetByConditionAsync(w =>
                    w.ResourceType == resourceGroup.Key &&
                    resourceIds.Contains(w.ResourceId) &&
                    recipientIds.Contains(w.UserId))
                .Select(w => new { w.ResourceType, w.ResourceId, w.UserId })
                .ToListAsync();

            foreach (var row in rows)
            {
                accessKeys.Add((row.ResourceType, row.ResourceId, row.UserId));
            }
        }

        return accessKeys;
    }

    private async Task<Dictionary<Guid, string>> GetOwnerNamesAsync(List<LinkedResource> linkedResources)
    {
        var ownerIds = linkedResources
            .Select(w => w.CreatedByUserId)
            .Where(w => w != Guid.Empty)
            .Distinct()
            .ToList();

        if (ownerIds.Count == 0)
        {
            return [];
        }

        var owners = await _unitOfWork.WorkspaceUserRepo
            .GetByConditionAsync(w => ownerIds.Contains(w.Id))
            .Select(w => new { w.Id, w.UserName, w.FirstName, w.LastName })
            .ToListAsync();

        return owners.ToDictionary(w => w.Id, w =>
        {
            var name = $"{w.FirstName} {w.LastName}".Trim();
            return string.IsNullOrWhiteSpace(name) ? w.UserName : name;
        });
    }

    public async Task<ServiceResponse<bool>> ValidateRunResourceAccessAsync(Guid tenantId, ConfigureEnvironmentType envType, Guid? spaceId, Guid flowId, string? reactFlowObject)
    {
        var serviceResponse = ServiceResponse<bool>.Create("Failed to validate run resource access", 500);

        try
        {
            var targetSpaceId = spaceId == Guid.Empty ? null : spaceId;
            var graphs = new List<(Guid FlowId, ReactFlowDataModel Graph)>();
            await CollectRunGraphsAsync(tenantId, flowId, reactFlowObject, graphs, new HashSet<Guid>());

            var blocking = new List<string>();
            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var (graphFlowId, graph) in graphs)
            {
                var references = ResourceFlowAccessHelpers.CollectReferencedResourceNames(graph);

                await AppendBlockingResourcesAsync(blocking, seen, tenantId, graphFlowId,
                    ResourceTypeEnum.Tool, "tool",
                    await ResolveRunToolsAsync(tenantId, envType, targetSpaceId, references["tools"]),
                    w => w.Id, w => w.IsResourceAccessRestricted);
                await AppendBlockingResourcesAsync(blocking, seen, tenantId, graphFlowId,
                    ResourceTypeEnum.Queue, "queue",
                    await ResolveRunQueuesAsync(tenantId, envType, targetSpaceId, references["queues"]),
                    w => w.Id, w => w.IsResourceAccessRestricted);
                await AppendBlockingResourcesAsync(blocking, seen, tenantId, graphFlowId,
                    ResourceTypeEnum.VaultCredential, "credential",
                    await ResolveRunVaultCredentialsAsync(tenantId, envType, targetSpaceId, references["credentials"]),
                    w => w.Id, w => w.IsResourceAccessRestricted);
                await AppendBlockingResourcesAsync(blocking, seen, tenantId, graphFlowId,
                    ResourceTypeEnum.ConfigStore, "key store",
                    await ResolveRunConfigStoresAsync(tenantId, envType, targetSpaceId, references["configStores"]),
                    w => w.Id, w => w.IsResourceAccessRestricted);
                await AppendBlockingResourcesAsync(blocking, seen, tenantId, graphFlowId,
                    ResourceTypeEnum.KnowledgeBase, "knowledge base",
                    await ResolveRunKnowledgeBasesAsync(tenantId, envType, targetSpaceId, references["knowledgeBases"]),
                    w => w.Id, w => w.IsResourceAccessRestricted);
                await AppendBlockingResourcesAsync(blocking, seen, tenantId, graphFlowId,
                    ResourceTypeEnum.Skill, "skill",
                    await ResolveRunSkillsAsync(tenantId, envType, targetSpaceId, references["skills"]),
                    w => w.Id, w => w.IsResourceAccessRestricted);
            }

            if (blocking.Count == 0)
            {
                return serviceResponse.Update(null, 200, true);
            }

            var message = "Cannot run: this agent is not assigned to restricted resource(s): "
                + string.Join(", ", blocking)
                + ". Ask each resource owner to add the agent under Agent access → Selected agents.";
            return serviceResponse.Update(message, 403, false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to validate run resource access for flow {FlowId}.", flowId);
            return serviceResponse;
        }
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

    private async Task<List<string>> GetPublishedFlowsOutsideAccessAsync(KnowledgeBase knowledgeBase, List<Guid> allowedFlowIds)
    {
        var quotedName = System.Text.Json.JsonSerializer.Serialize(knowledgeBase.Name);
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

        var sameNameKnowledgeBases = await _unitOfWork.KnowledgeBaseRepo
            .GetByConditionAsync(w =>
                w.Name == knowledgeBase.Name &&
                w.TenantId == _tenantId &&
                w.EnvType == knowledgeBase.EnvType)
            .IgnoreQueryFilters()
            .ToListAsync();

        return candidates
            .Where(w =>
                ResourceFlowAccessHelpers.TryReadReferencedKnowledgeBaseNames(w.ResourceReferences)?.Contains(knowledgeBase.Name) == true &&
                ResourceFlowAccessHelpers.PickResolvedKnowledgeBase(sameNameKnowledgeBases, w.SpaceId)?.Id == knowledgeBase.Id)
            .Select(w => w.FlowName)
            .Distinct()
            .ToList();
    }

    private async Task<List<string>> GetPublishedFlowsOutsideAccessAsync(VaultCredential credential, List<Guid> allowedFlowIds)
    {
        var quotedName = System.Text.Json.JsonSerializer.Serialize(credential.Name);
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

        var sameNameCredentials = await _unitOfWork.VaultCredentialRepo
            .GetByConditionAsync(w =>
                w.Name == credential.Name &&
                w.TenantId == _tenantId &&
                w.EnvType == credential.EnvType)
            .IgnoreQueryFilters()
            .ToListAsync();

        return candidates
            .Where(w =>
                ResourceFlowAccessHelpers.TryReadReferencedCredentialNames(w.ResourceReferences)?.Contains(credential.Name) == true &&
                ResourceFlowAccessHelpers.PickResolvedCredential(sameNameCredentials, w.SpaceId)?.Id == credential.Id)
            .Select(w => w.FlowName)
            .Distinct()
            .ToList();
    }

    private async Task<List<string>> GetPublishedFlowsOutsideAccessAsync(ConfigStore configStore, List<Guid> allowedFlowIds)
    {
        var quotedName = System.Text.Json.JsonSerializer.Serialize(configStore.Name);
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

        var sameNameConfigStores = await _unitOfWork.ConfigStoreRepo
            .GetByConditionAsync(w =>
                w.Name == configStore.Name &&
                w.TenantId == _tenantId &&
                w.EnvType == configStore.EnvType)
            .IgnoreQueryFilters()
            .ToListAsync();

        return candidates
            .Where(w =>
                ResourceFlowAccessHelpers.TryReadReferencedConfigStoreNames(w.ResourceReferences)?.Contains(configStore.Name) == true &&
                ResourceFlowAccessHelpers.PickResolvedConfigStore(sameNameConfigStores, w.SpaceId)?.Id == configStore.Id)
            .Select(w => w.FlowName)
            .Distinct()
            .ToList();
    }

    private async Task CollectRunGraphsAsync(Guid tenantId, Guid flowId, string? reactFlowObject, List<(Guid FlowId, ReactFlowDataModel Graph)> graphs, HashSet<Guid> visitedVersionIds)
    {
        var graph = ReactFlowHelper.Parse(reactFlowObject);
        if (graph is null)
        {
            return;
        }

        graphs.Add((flowId, graph));

        var subFlowVersionIds = new HashSet<Guid>();
        foreach (var node in graph.Nodes)
        {
            var reference = string.Equals(node.Type, "callAgentNode", StringComparison.OrdinalIgnoreCase)
                ? node.Data?.SelectedAgent
                : string.Equals(node.Type, "blockNode", StringComparison.OrdinalIgnoreCase)
                    ? node.Data?.SelectedBlock
                    : null;

            if (ResourceFlowAccessHelpers.TryExtractFlowVersionId(reference, out var subFlowVersionId))
            {
                subFlowVersionIds.Add(subFlowVersionId);
            }
        }

        // IMPORTANT NOTE: a called agent or block is checked as its own agent with its own grants,
        // and the visited set stops a graph that calls itself directly or indirectly from recursing forever.
        // The root version is not pre-seeded, so a graph that calls the root re-checks it once.
        var pendingIds = subFlowVersionIds.Where(visitedVersionIds.Add).ToList();
        if (pendingIds.Count == 0)
        {
            return;
        }

        var subFlowVersions = await _unitOfWork.FlowVersionRepo
            .GetByConditionAsync(w => pendingIds.Contains(w.Id) && w.TenantId == tenantId)
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Select(w => new { w.Id, w.FlowId, w.ReactFlowObject })
            .ToListAsync();

        foreach (var subFlowVersion in subFlowVersions)
        {
            await CollectRunGraphsAsync(tenantId, subFlowVersion.FlowId, subFlowVersion.ReactFlowObject, graphs, visitedVersionIds);
        }
    }

    private async Task AppendBlockingResourcesAsync<T>(
        List<string> blocking,
        HashSet<string> seen,
        Guid tenantId,
        Guid flowId,
        ResourceTypeEnum resourceType,
        string resourceLabel,
        Dictionary<string, T> resolved,
        Func<T, Guid> idSelector,
        Func<T, bool> restrictedSelector)
    {
        var restricted = resolved.Where(w => restrictedSelector(w.Value)).ToList();
        if (restricted.Count == 0)
        {
            return;
        }

        var assignedFlowIds = await GetRunAssignedFlowIdsAsync(resourceType, restricted.Select(w => idSelector(w.Value)), tenantId);
        foreach (var (name, resource) in restricted)
        {
            if (assignedFlowIds.TryGetValue(idSelector(resource), out var flowIds) && flowIds.Contains(flowId))
            {
                continue;
            }

            var entry = $"{resourceLabel} '{name}'";
            if (seen.Add(entry))
            {
                blocking.Add(entry);
            }
        }
    }

    private async Task<Dictionary<Guid, HashSet<Guid>>> GetRunAssignedFlowIdsAsync(ResourceTypeEnum resourceType, IEnumerable<Guid> resourceIds, Guid tenantId)
    {
        var idList = resourceIds.ToList();
        if (idList.Count == 0)
        {
            return new Dictionary<Guid, HashSet<Guid>>();
        }

        // IMPORTANT NOTE: grants are tenant-scoped with no space, so the run check bypasses the
        // ambient space filter and applies the tenant explicitly, matching GetAssignedFlowNamesAsync.
        var rows = await _unitOfWork.ResourceFlowAccessRepo
            .GetByConditionAsync(w => w.ResourceType == resourceType && idList.Contains(w.ResourceId))
            .IgnoreQueryFilters()
            .Where(w => w.TenantId == tenantId)
            .Select(w => new { w.ResourceId, w.FlowId })
            .ToListAsync();

        return rows
            .GroupBy(w => w.ResourceId)
            .ToDictionary(g => g.Key, g => g.Select(w => w.FlowId).ToHashSet());
    }

    // IMPORTANT NOTE: run-time resolution is case-insensitive (queue/credential/config store/knowledge
    // base/skill compare lower-cased names, custom tools use ILike), so every resolver below must match
    // the same way; a case-sensitive match lets a differently-cased reference bypass the gate.
    private async Task<Dictionary<string, Tool>> ResolveRunToolsAsync(Guid tenantId, ConfigureEnvironmentType envType, Guid? targetSpaceId, List<string> names)
    {
        if (names.Count == 0)
        {
            return new Dictionary<string, Tool>();
        }

        var normalizedNames = names.Select(w => w.ToLowerInvariant()).ToList();
        var candidates = await _unitOfWork.ToolRepo
            .GetByConditionAsync(w => normalizedNames.Contains(w.Name.ToLower()) && w.Type == ComponentTypeEnum.Custom && w.TenantId == tenantId && w.EnvType == envType)
            .IgnoreQueryFilters()
            .ToListAsync();

        return candidates
            .GroupBy(w => w.Name)
            .ToDictionary(g => g.Key, g => ResourceFlowAccessHelpers.PickResolvedTool(g, targetSpaceId)!);
    }

    private async Task<Dictionary<string, Queue>> ResolveRunQueuesAsync(Guid tenantId, ConfigureEnvironmentType envType, Guid? targetSpaceId, List<string> names)
    {
        if (names.Count == 0)
        {
            return new Dictionary<string, Queue>();
        }

        var normalizedNames = names.Select(w => w.ToLowerInvariant()).ToList();
        var candidates = await _unitOfWork.QueueRepo
            .GetByConditionAsync(w => normalizedNames.Contains(w.Name.ToLower()) && w.TenantId == tenantId && w.EnvType == envType)
            .IgnoreQueryFilters()
            .ToListAsync();

        return candidates
            .GroupBy(w => w.Name)
            .ToDictionary(g => g.Key, g => ResourceFlowAccessHelpers.PickResolvedQueue(g, targetSpaceId)!);
    }

    private async Task<Dictionary<string, VaultCredential>> ResolveRunVaultCredentialsAsync(Guid tenantId, ConfigureEnvironmentType envType, Guid? targetSpaceId, List<string> names)
    {
        if (names.Count == 0)
        {
            return new Dictionary<string, VaultCredential>();
        }

        var normalizedNames = names.Select(w => w.ToLowerInvariant()).ToList();
        var candidates = await _unitOfWork.VaultCredentialRepo
            .GetByConditionAsync(w => normalizedNames.Contains(w.Name.ToLower()) && w.TenantId == tenantId && w.EnvType == envType)
            .IgnoreQueryFilters()
            .ToListAsync();

        return candidates
            .GroupBy(w => w.Name)
            .ToDictionary(g => g.Key, g => ResourceFlowAccessHelpers.PickResolvedCredential(g, targetSpaceId)!);
    }

    private async Task<Dictionary<string, ConfigStore>> ResolveRunConfigStoresAsync(Guid tenantId, ConfigureEnvironmentType envType, Guid? targetSpaceId, List<string> names)
    {
        if (names.Count == 0)
        {
            return new Dictionary<string, ConfigStore>();
        }

        var normalizedNames = names.Select(w => w.ToLowerInvariant()).ToList();
        var candidates = await _unitOfWork.ConfigStoreRepo
            .GetByConditionAsync(w => normalizedNames.Contains(w.Name.ToLower()) && w.TenantId == tenantId && w.EnvType == envType)
            .IgnoreQueryFilters()
            .ToListAsync();

        return candidates
            .GroupBy(w => w.Name)
            .ToDictionary(g => g.Key, g => ResourceFlowAccessHelpers.PickResolvedConfigStore(g, targetSpaceId)!);
    }

    private async Task<Dictionary<string, KnowledgeBase>> ResolveRunKnowledgeBasesAsync(Guid tenantId, ConfigureEnvironmentType envType, Guid? targetSpaceId, List<string> names)
    {
        if (names.Count == 0)
        {
            return new Dictionary<string, KnowledgeBase>();
        }

        var normalizedNames = names.Select(w => w.ToLowerInvariant()).ToList();
        var candidates = await _unitOfWork.KnowledgeBaseRepo
            .GetByConditionAsync(w => normalizedNames.Contains(w.Name.ToLower()) && w.TenantId == tenantId && w.EnvType == envType)
            .IgnoreQueryFilters()
            .ToListAsync();

        return candidates
            .GroupBy(w => w.Name)
            .ToDictionary(g => g.Key, g => ResourceFlowAccessHelpers.PickResolvedKnowledgeBase(g, targetSpaceId)!);
    }

    private async Task<Dictionary<string, Skill>> ResolveRunSkillsAsync(Guid tenantId, ConfigureEnvironmentType envType, Guid? targetSpaceId, List<string> names)
    {
        if (names.Count == 0)
        {
            return new Dictionary<string, Skill>();
        }

        var normalizedNames = names.Select(w => w.ToLowerInvariant()).ToList();
        var candidates = await _unitOfWork.SkillRepo
            .GetByConditionAsync(w => normalizedNames.Contains(w.Name.ToLower()) && w.Type == ComponentTypeEnum.Custom && w.TenantId == tenantId && w.EnvType == envType)
            .IgnoreQueryFilters()
            .ToListAsync();

        return candidates
            .GroupBy(w => w.Name)
            .ToDictionary(g => g.Key, g => ResourceFlowAccessHelpers.PickResolvedSkill(g, targetSpaceId)!);
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

    private async Task<KnowledgeBase?> GetKnowledgeBaseAsync(Guid resourceId)
    {
        return await _unitOfWork.KnowledgeBaseRepo
            .GetByConditionAsync(w => w.Id == resourceId && w.EnvType == _currentTenantService.CurrentEnvType)
            .FirstOrDefaultAsync();
    }

    private async Task<VaultCredential?> GetVaultCredentialAsync(Guid resourceId)
    {
        return await _unitOfWork.VaultCredentialRepo
            .GetByConditionAsync(w => w.Id == resourceId && w.EnvType == _currentTenantService.CurrentEnvType)
            .FirstOrDefaultAsync();
    }

    private async Task<ConfigStore?> GetConfigStoreAsync(Guid resourceId)
    {
        return await _unitOfWork.ConfigStoreRepo
            .GetByConditionAsync(w => w.Id == resourceId && w.EnvType == _currentTenantService.CurrentEnvType)
            .FirstOrDefaultAsync();
    }
}
