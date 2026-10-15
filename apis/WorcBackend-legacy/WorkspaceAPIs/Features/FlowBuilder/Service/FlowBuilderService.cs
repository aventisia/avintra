using ExecutorLibrary.Models;
using ExecutorLibrary.Helpers;

namespace WorkspaceAPIs.Services;

public class FlowBuilderService : IFlowBuilderService
{
    private readonly ILogger<FlowBuilderService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserManagementGuardService _userManagementGuardService;
    private readonly IFlowVersionHistoryService _flowVersionHistoryService;
    private readonly IResourceUserAccessService _resourceUserAccessService;
    private readonly INotificationEventService _notificationEventService;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly ICollaborationStore _collaborationStore;
    private readonly IVaultCredentialService _vaultCredentialService;
    private readonly IResourceFlowAccessService _resourceFlowAccessService;
    private readonly Guid _userId;
    private readonly string _userHolderId;

    public FlowBuilderService(
        ILogger<FlowBuilderService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IUserManagementGuardService userManagementGuardService,
        IFlowVersionHistoryService flowVersionHistoryService,
        IResourceUserAccessService resourceUserAccessService,
        INotificationEventService notificationEventService,
        ICurrentTenantService currentTenantService,
        ICollaborationStore collaborationStore,
        IVaultCredentialService vaultCredentialService,
        IResourceFlowAccessService resourceFlowAccessService)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        // Collaboration locks are attributed by email (matches the studio frontend and the
        // AgentBuilderHub HolderId), so conflict checks must compare against the email.
        _userHolderId = httpContextAccessor.HttpContext?.User?.FindFirstValue("email")
            ?? httpContextAccessor.HttpContext?.User?.FindFirstValue("uname")
            ?? _userId.ToString();

        _logger = logger;
        _unitOfWork = unitOfWork;
        _userManagementGuardService = userManagementGuardService;
        _flowVersionHistoryService = flowVersionHistoryService;
        _resourceUserAccessService = resourceUserAccessService;
        _notificationEventService = notificationEventService;
        _currentTenantService = currentTenantService;
        _collaborationStore = collaborationStore;
        _vaultCredentialService = vaultCredentialService;
        _resourceFlowAccessService = resourceFlowAccessService;
    }

    // Fetch the parent flow details of given parent flow version id
    public async Task<ServiceResponse<FetchParentFlowDto>> FetchParentFlowAsync(Guid parentFlowVersionId)
    {
        var serviceResponse = new ServiceResponse<FetchParentFlowDto>
        {
            Data = null,
            Message = "Failed to fetch parent flow. Please try again.",
        };

        try
        {
            // TODO: Implement access control logic to ensure the user has permission to access the specified subFlowIds.

            // Fetch the parent flow version details based on the provided parentFlowVersionId
            // IMPORTANT: Must use .IgnoreQueryFilters() to bypass TenantId/SpaceId global filters during execution
            var parentFlowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w => w.Id == parentFlowVersionId)
                .IgnoreQueryFilters()
                .Include(i => i.Flow)
                .SingleOrDefaultAsync();

            if (parentFlowVersion == null)
            {
                serviceResponse.Message = "Parent flow not found.";
                return serviceResponse;
            }

            // Create a FetchParentFlowDto instance with the retrieved details
            var fetchParentFlowDto = new FetchParentFlowDto
            {
                FlowId = parentFlowVersion.FlowId,
                VersionId = parentFlowVersion.Id,
                FlowName = parentFlowVersion.Flow.Name,
                ReactFlowObject = parentFlowVersion.ReactFlowObject,
                InputOutputObject = parentFlowVersion.InputOutputObject
            };

            serviceResponse.Data = fetchParentFlowDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Parent flow fetched successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Fetch the reactFlowObject of given list of flow version ids
    public async Task<ServiceResponse<IEnumerable<FetchSubFlowDto>>> FetchSubFlowsAsync(IEnumerable<Guid> subFlowIds)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<FetchSubFlowDto>>
        {
            Data = null,
            Message = "Failed to fetch sub-flows. Please try again.",
        };

        try
        {
            // TODO: Implement access control logic to ensure the user has permission to access the specified subFlowIds.
            // -----------------------------
            // // Fetch the ConfigStore ResourceIds for the current user
            // var accessibleResourceIds = await _resourceUserAccessService.GetAccessibleResourceIdsAsync(_userId, ResourceTypeEnum.FlowVersion);
            // // Fetch the reactFlowObject for the specified subFlowIds that the user has access to
            // var subFlows = await _unitOfWork.FlowVersionRepo
            //     .GetByConditionAsync(w => subFlowIds.Contains(w.Id) && (w.IsTenantWideAccess || w.CreatedByUserId == _userId || accessibleResourceIds.Contains(w.Id)))
            //     .Select(s => new FetchSubFlowDto
            //     {
            //         FlowVersionId = s.Id,
            //         ReactFlowObject = s.ReactFlowObject
            //     })
            //     .ToListAsync();

            // Fetch the reactFlowObject for the specified subFlowIds (TODO: without checking the user access for now)
            // IMPORTANT: Must use .IgnoreQueryFilters() to bypass TenantId/SpaceId global filters during execution
            var subFlows = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w => subFlowIds.Contains(w.Id))
                .IgnoreQueryFilters()
                .Select(s => new FetchSubFlowDto
                {
                    FlowVersionId = s.Id,
                    ReactFlowObject = s.ReactFlowObject,
                    InputOutputObject = s.InputOutputObject,
                })
                .ToListAsync();

            serviceResponse.Data = subFlows;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = subFlows.Count > 0 ? "Sub-flows fetched successfully." : "No sub-flows found.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieves the flow version record to load when the user opens it in the studio.
    public async Task<ServiceResponse<LoadFlowDto>> GetFlowToLoadAsync(Guid flowId, Guid? versionId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<LoadFlowDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Retrieve the flow and ensure it exists.
            // A flow ID is globally unique within a tenant, so the lookup is
            // intentionally NOT scoped to the current space query filter. Space
            // access is enforced separately via GetResourceAccessAsync below.
            var flow = await _unitOfWork.FlowRepo
                .GetByConditionAsync(w => w.Id == flowId)
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync();

            if (flow == null)
            {
                serviceResponse.Message = "Flow not found.";
                return serviceResponse;
            }

            // Validate user's access permissions for viewing the flow
            var (canView, accessLevel) = await _resourceUserAccessService.GetResourceAccessAsync(
                _userId,
                flow.Id,
                ResourceTypeEnum.Flow,
                flow.CreatedByUserId,
                flow.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                });

            if (!canView)
            {
                serviceResponse.Message = "You do not have access to view this flow.";
                return serviceResponse;
            }

            // Attempt to retrieve the latest flow version based on provided conditions.
            // Like the flow, the version lookup is not scoped to the current space
            // query filter because access has already been validated above.
            var flowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    (!versionId.HasValue || w.Id == versionId) &&
                    w.FlowId == flowId &&
                    (
                        !w.IsPublished ||
                        (
                            _userManagementGuardService.HasRole(CustomRolesEnum.OM.ToString()) ||
                            _userManagementGuardService.HasRole(CustomRolesEnum.TU.ToString())
                        )
                    )
                )
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.Flow)
                .IgnoreQueryFilters()
                .OrderByDescending(o => o.CreatedOn) // Ensure the latest version is retrieved
                .FirstOrDefaultAsync();

            // No flow version found, log and return response
            if (flowVersion == null)
            {
                serviceResponse.Message = "Flow version does not exist.";
                return serviceResponse;
            }

            // Convert the flow version to a LoadFlowDto instance using the Adapt method
            var loadFlowDto = flowVersion.Adapt<LoadFlowDto>();

            // Set the user's access type in the LoadFlowDto
            // If the user is the creator of the flow, assign 'Owner' access
            // Otherwise, use the access type from FlowUsers or default to null if not found
            loadFlowDto.AccessLevel = flow.CreatedByUserId == _userId ? ResourceAccessTypeEnum.Owner : accessLevel;

            // Successfully retrieved the flow version, log and return response
            serviceResponse.Data = loadFlowDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow version retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Publishes a flow version based on the specified type (Agent, Block, VoiceAgent, Template).
    public async Task<ServiceResponse<bool>> PublishFlowVersionAsync(PublishFlowVersionDto publishFlowVersionDto)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to publish the flow version. Please try again."
        };

        try
        {
            // Fetch the flow version by ID and FlowId without applying access filters.
            // Access and ownership checks are performed separately so users get meaningful error messages.
            var flowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    w.Id == publishFlowVersionDto.Id &&
                    w.FlowId == publishFlowVersionDto.FlowId)
                .Include(fv => fv.Flow)
                .ThenInclude(flow => flow.FlowUsers)
                .OrderByDescending(fv => fv.CreatedOn)
                .SingleOrDefaultAsync();

            // If the flow version is not found, return a clear existence error.
            if (flowVersion == null)
            {
                serviceResponse.Message = "Flow version does not exist.";
                return serviceResponse;
            }

            // Collaboration guard: publishing is a flow-level action. Block if another
            // user holds a flow-action lock, or any node/edge lock, on this version.
            var publishLock = await GetConflictingLockAsync(flowVersion.Id, flowVersion.ReactFlowObject);
            if (publishLock != null)
            {
                serviceResponse.Message = $"Another user ({publishLock.HolderDisplayName ?? "someone"}) is editing this agent. Publishing is blocked until they finish.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Verify the user has any access to the flow (owner, edit, or view).
            var (canAccess, accessLevel) = await _resourceUserAccessService.GetResourceAccessAsync(
                _userId,
                flowVersion.Flow.Id,
                ResourceTypeEnum.Flow,
                flowVersion.Flow.CreatedByUserId,
                flowVersion.Flow.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                    ResourceAccessTypeEnum.View,
                });

            if (!canAccess)
            {
                _logger.LogWarning("User {UserId} does not have access to flow {FlowId}.", _userId, flowVersion.Flow.Id);
                serviceResponse.Message = "You do not have access to this flow.";
                return serviceResponse;
            }

            // Publishing requires owner-level access.
            var isFlowCreator = flowVersion.Flow.CreatedByUserId == _userId;
            var isFlowUserOwner = flowVersion.Flow.FlowUsers?.Any(w =>
                w.FlowId == flowVersion.Flow.Id &&
                w.UserId == _userId &&
                w.Type == ProjectUserAccessEnum.Owner) ?? false;
            var hasResourceOwnerAccess = accessLevel == ResourceAccessTypeEnum.Owner;

            if (!isFlowCreator && !isFlowUserOwner && !hasResourceOwnerAccess)
            {
                _logger.LogWarning("User {UserId} is not authorized to publish flow {FlowId}.", _userId, flowVersion.Flow.Id);
                serviceResponse.Message = "You do not have permission to publish this flow.";
                return serviceResponse;
            }

            // Re-publishing an already published version is allowed: it acts as an idempotent
            // repair pass that re-collects references and re-creates any missing Production clones.
            var wasAlreadyPublished = flowVersion.IsPublished == true;

            // Validate: ChatAgent versions must satisfy the single-node shape so invalid
            // client payloads (e.g. trigger/end/plus nodes, missing Chat AI node) cannot be published
            if (flowVersion.Flow.Type == FlowTypesEnum.ChatAgent)
            {
                var parsedChatFlow = ChatAgentGraphHelpers.TryParseFlow(flowVersion.ReactFlowObject);

                if (ChatAgentGraphHelpers.ValidateChatAgentGraph(parsedChatFlow) is string chatValidationError)
                    return serviceResponse.Update(chatValidationError, 400);
            }

            // TODO: Bug When there is a call block or call agent node exists then parsed flow is empty
            // Validate flow graph for unpublished flow versions
            // if (flowVersion.IsPublished == false)
            // {
            //     // Get the parsed ReactFlowObject
            //     var parsedFlow = ReactFlowHelper.Parse(flowVersion.ReactFlowObject);

            //     // Validate: Invalid react flow object, return bad request
            //     if (parsedFlow == null || parsedFlow.Nodes == null || parsedFlow.Nodes.Count == 0 || parsedFlow.Edges == null || parsedFlow.Edges.Count == 0)
            //         return serviceResponse.Update(400, "Flow is missing or invalid.");

            //     // Validate: Chat flow contains one or more executable nodes that are desktop-only
            //     if (flowVersion.Flow.Type == FlowTypesEnum.ChatAgent && FlowValidationHelper.DoesFlowContainsAnyDesktopOnlyNode(parsedFlow))
            //         return serviceResponse.Update(400, "Flow contains desktop nodes which cannot be executed via web. Please remove desktop nodes from the flow and try again.");

            //     // Validate: Reject flow execution if it contains only support/placeholder nodes
            //     if (FlowValidationHelper.IsEmptyFlow(parsedFlow))
            //         return serviceResponse.Update(400, "Flow is empty and cannot be published.");

            //     // Validate: Flow graph is invalid (e.g. missing nodes or edges, or edges connecting to non-existing nodes)
            //     if (FlowValidationHelper.IsValidFlowGraph(parsedFlow) is string flowGraphValidationError)
            //         return serviceResponse.Update(400, $"Flow graph is invalid: {flowGraphValidationError}");
            // }

            // Handle publish based on the type specified in the DTO
            switch (publishFlowVersionDto.Type)
            {
                case PublishTypesEnum.Agent:
                case PublishTypesEnum.ChatAgent:
                case PublishTypesEnum.Block:
                case PublishTypesEnum.VoiceAgent:
                    // Determine the publish type for logging and message purposes
                    var publishType = publishFlowVersionDto.Type.ToString();

                    // Adapt the DTO values into the flow version object
                    publishFlowVersionDto.Adapt(flowVersion);

                    // Collect references and clone any missing Production resources as one atomic
                    // unit: if cloning fails, the whole publish rolls back and surfaces as an error
                    // instead of leaving a half-published agent.
                    await _unitOfWork.ExecuteInTransactionAsync(async () =>
                    {
                        // Collect and store the referenced resource names (credentials, queues, KBs, tools, skills)
                        flowVersion.ResourceReferences = await CollectResourceReferencesAsync(
                            flowVersion.ReactFlowObject,
                            flowVersion.FlowId,
                            flowVersion.Flow.Name);

                        // Mark the flow version as published
                        flowVersion.IsPublished = true;
                        flowVersion.LastModifiedByUserId = _userId;
                        flowVersion.LastModifiedOn = DateTimeOffset.UtcNow;

                        // Persist the version together with every cloned Production resource.
                        _unitOfWork.FlowVersionRepo.Update(flowVersion);
                        await _unitOfWork.SaveAsync();
                    });

                    // Log success and set response message
                    serviceResponse.Message = wasAlreadyPublished
                        ? $"{publishType} is already published. Production resources were re-verified."
                        : $"{publishType} published successfully.";

                    // Notify the Orchestrator Manager(s) of the tenant that an agent is ready for use
                    if (!wasAlreadyPublished &&
                        (
                            publishFlowVersionDto.Type == PublishTypesEnum.Agent ||
                            publishFlowVersionDto.Type == PublishTypesEnum.ChatAgent ||
                            publishFlowVersionDto.Type == PublishTypesEnum.VoiceAgent)
                        )
                    {
                        await _notificationEventService.NotifyAgentPublishedAsync(
                            flowVersion.Flow.TenantId,
                            flowVersion.Flow.Id,
                            flowVersion.Flow.Name);
                    }
                    break;

                default:
                    // Log message for invalid publish type
                    _logger.LogWarning($"Invalid publish type encountered: {publishFlowVersionDto.Type}");
                    serviceResponse.Message = "Invalid publish type provided.";
                    return serviceResponse;
            }

            // Final success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
        }
        catch (ResourceFlowAccessDeniedException ex)
        {
            _logger.LogWarning(ex, "Publish blocked by flow access restriction for flow version {FlowVersionId}.", publishFlowVersionDto.Id);
            serviceResponse.Update(ex.Message, 403, false);
        }
        catch (Exception ex)
        {
            // Fail loudly: the transaction has already rolled back any partial Production clones,
            // so report a clear failure instead of silently leaving a half-published agent.
            _logger.LogError(ex, "Failed to publish flow version {FlowVersionId}.", publishFlowVersionDto.Id);
            serviceResponse.Data = false;
            serviceResponse.StatusCode = 500;
            serviceResponse.Message = "Failed to publish the flow version. No changes were applied; please resolve the reported resource error and try again.";
        }

        return serviceResponse;
    }

    // Saves the flow version nodes, edges, and viewport in the background when the user makes changes. 
    // It creates a new flow version and stores version history if changes are detected.
    public async Task<ServiceResponse<bool>> SaveFlowVersionAsync(FlowSilentUpdateDto flowSilentUpdateDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to save the flow version. Please try again."
        };

        try
        {
            // Retrieve the flow and ensure it exists
            var flow = await _unitOfWork.FlowRepo
                .GetByConditionAsync(w => w.Id == flowSilentUpdateDto.Id)
                .SingleOrDefaultAsync();

            if (flow == null)
            {
                serviceResponse.Message = "Flow not found.";
                return serviceResponse;
            }

            // Validate user's access permissions for update the flow
            var (canEidt, accessLevel) = await _resourceUserAccessService.GetResourceAccessAsync(
                _userId,
                flow.Id,
                ResourceTypeEnum.Flow,
                flow.CreatedByUserId,
                flow.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                });

            if (!canEidt)
            {
                serviceResponse.Message = "You do not have access to view this key store.";
                return serviceResponse;
            }

            // Validate that the flow version exists and is owned by the current user
            var flowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    w.Id == flowSilentUpdateDto.VersionId &&
                    w.FlowId == flowSilentUpdateDto.Id
                )
                .Include(i => i.Flow)
                .OrderByDescending(a => a.CreatedOn)
                .SingleOrDefaultAsync();

            // If no flow version is found, log and return failure
            if (flowVersion == null)
            {
                serviceResponse.Message = "Flow version does not exist.";
                return serviceResponse;
            }

            // Collaboration guard: reject the save if another user holds a lock on any
            // node/edge that is being modified, or if a flow-level action lock is held.
            var conflictingLock = await GetConflictingLockAsync(flowVersion.Id, flowSilentUpdateDto.ReactFlowObject);
            if (conflictingLock != null)
            {
                serviceResponse.Message = $"Another user ({conflictingLock.HolderDisplayName ?? "someone"}) is editing this agent. Please wait for them to finish.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            flowSilentUpdateDto.VersionId = flowVersion.Id;


            // Create a flow version history record if there are changes in the ReactFlow data
            await _flowVersionHistoryService.CreateHistoryIfReactFlowChangedAsync(flowVersion, flowSilentUpdateDto);

            // Map the updated properties from the DTO to the flow version
            flowSilentUpdateDto.Adapt(flowVersion);
            flowVersion.LastModifiedByUserId = _userId;
            flowVersion.LastModifiedOn = DateTimeOffset.UtcNow;

            // Attempt to update the flow version
            _unitOfWork.FlowVersionRepo.Update(flowVersion);
            // Save changes to the database, log failure if saving fails
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }


            // Successful save, log and return success
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow version saved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    /// <summary>
    /// Checks whether another user holds a lock that conflicts with the incoming save.
    /// A conflict exists if a flow-level action lock is held by another user, or if any
    /// node/edge in the incoming ReactFlowObject is locked by another user.
    /// </summary>
    private async Task<LockDto?> GetConflictingLockAsync(Guid flowVersionId, string? reactFlowObject)
    {
        var locks = await _collaborationStore.GetLocksForFlowAsync(flowVersionId);

        // Flow-level action lock held by another user blocks any save.
        var actionLock = locks.FirstOrDefault(l =>
            l.TargetType == LockTargetType.FlowAction && l.HolderUserId != _userHolderId);
        if (actionLock != null) return actionLock;

        // Collect the node/edge ids present in the incoming object.
        var incomingIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        try
        {
            var flow = ReactFlowHelper.Parse(reactFlowObject);
            if (flow?.Nodes != null)
                foreach (var node in flow.Nodes)
                    if (!string.IsNullOrEmpty(node.Id)) incomingIds.Add(node.Id);
            if (flow?.Edges != null)
                foreach (var edge in flow.Edges)
                    if (!string.IsNullOrEmpty(edge.Id)) incomingIds.Add(edge.Id);
        }
        catch
        {
            // If parsing fails, fall back to a conservative check on all node/edge locks.
        }

        return locks.FirstOrDefault(l =>
            (l.TargetType == LockTargetType.Node || l.TargetType == LockTargetType.Edge) &&
            l.HolderUserId != _userHolderId &&
            (incomingIds.Count == 0 || incomingIds.Contains(l.TargetId)));
    }

    /// <summary>
    /// Parses the flow's ReactFlowObject and collects the referenced resource NAMES keyed by
    /// resource type. All supported resource types are always present; unreferenced types hold
    /// an empty array. This powers publish-time Prod find-or-clone resolution.
    /// </summary>
    private async Task<string?> CollectResourceReferencesAsync(string? reactFlowObject, Guid publishingFlowId, string flowName)
    {
        Dictionary<string, List<string>> references;

        try
        {
            references = ResourceFlowAccessHelpers.CollectReferencedResourceNames(ReactFlowHelper.Parse(reactFlowObject));

            // Validate credential references: resolve any legacy GUID values to their actual
            // credential names and drop references that no longer resolve in the current env.
            await ValidateCredentialReferencesAsync(references["credentials"]);

            await ValidateFlowToolAccessAsync(publishingFlowId, references["tools"], flowName);
            await ValidateFlowQueueAccessAsync(publishingFlowId, references["queues"], flowName);
            await ValidateFlowSkillAccessAsync(publishingFlowId, references["skills"], flowName);
            await ValidateFlowConfigStoreAccessAsync(publishingFlowId, references["configStores"], flowName);
            await ValidateFlowKnowledgeBaseAccessAsync(publishingFlowId, references["knowledgeBases"], flowName);
            await ValidateFlowVaultCredentialAccessAsync(publishingFlowId, references["credentials"], flowName);

            // Ensure PROD clones exist for every referenced resource so the published agent can
            // resolve them in the Production environment. Missing resources are created with
            // EnvType = Prod and their names are retained in the ResourceReferences JSON.
            await EnsureProdClonesAsync(references);
        }
        catch (Exception ex) when (ex is not ResourceFlowAccessDeniedException)
        {
            // Log and rethrow: a failed clone/validation must abort publish (the caller wraps this
            // pass in a transaction), never publish an agent whose Prod resources are missing.
            _logger.LogError(ex, "Failed to collect resource references while publishing.");
            throw;
        }

        return System.Text.Json.JsonSerializer.Serialize(references);
    }

    /// <summary>
    /// Normalizes the collected credential references. Legacy rows may store a GUID instead of a
    /// name; those are resolved to the actual credential name. References that do not resolve to a
    /// credential in the current environment fail the publish so the published flow never points at
    /// a missing credential.
    /// </summary>
    private async Task ValidateCredentialReferencesAsync(List<string> credentialNames)
    {
        var unresolved = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var tenantId = _currentTenantService.CurrentTenantId;

        for (var i = credentialNames.Count - 1; i >= 0; i--)
        {
            var value = credentialNames[i];
            if (string.IsNullOrWhiteSpace(value))
            {
                credentialNames.RemoveAt(i);
                continue;
            }

            // IMPORTANT NOTE: a legacy value that parses as a GUID can also be a credential name;
            // the name wins so publish and the flow-access gate resolve the same credential.
            var normalizedValue = value.ToLowerInvariant();
            var byName = await _unitOfWork.VaultCredentialRepo
                .GetByConditionAsync(w => w.Name.ToLower() == normalizedValue && w.TenantId == tenantId && w.EnvType == _currentTenantService.CurrentEnvType)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();
            if (byName != null)
            {
                continue;
            }

            // Legacy GUID value -> resolve to the actual credential name.
            if (Guid.TryParse(value, out var guid))
            {
                var byId = await _unitOfWork.VaultCredentialRepo
                    .GetByConditionAsync(w => w.Id == guid && w.TenantId == tenantId && w.EnvType == _currentTenantService.CurrentEnvType)
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync();
                if (byId != null)
                {
                    credentialNames[i] = byId.Name;
                    continue;
                }
            }

            // A reference that does not resolve in the current environment must fail the publish:
            // silently dropping it would publish a flow pointing at a missing credential.
            unresolved.Add(value);
            credentialNames.RemoveAt(i);
        }

        if (unresolved.Count > 0)
            throw new InvalidOperationException(
                $"Cannot publish: the following credential(s) were not found in the {_currentTenantService.CurrentEnvType} environment: {string.Join(", ", unresolved)}.");
    }

    /// <summary>
    /// Ensures a Production (EnvType = Prod) clone exists for every referenced resource. The source
    /// is the current request environment; the target is always Prod. Existing Prod records are
    /// repaired (files, vectors, link rows) rather than duplicated. Throws when a referenced source
    /// is missing so publish fails instead of silently producing a broken agent.
    /// </summary>
    private async Task EnsureProdClonesAsync(Dictionary<string, List<string>> references)
    {
        var missing = new List<string>();

        missing.AddRange(await EnsureProdVaultCredentialsAsync(references["credentials"]));
        missing.AddRange(await EnsureProdQueuesAsync(references["queues"]));
        missing.AddRange(await EnsureProdToolsAsync(references["tools"]));
        missing.AddRange(await EnsureProdKnowledgeBasesAsync(references["knowledgeBases"]));
        missing.AddRange(await EnsureProdSkillsAsync(references["skills"]));
        missing.AddRange(await EnsureProdConfigStoresAsync(references["configStores"]));

        if (missing.Count > 0)
            throw new InvalidOperationException(
                $"Cannot publish: the following referenced resource(s) were not found in the {_currentTenantService.CurrentEnvType} environment: {string.Join(", ", missing)}.");
    }

    /// <summary>
    /// Resolves each tool name to the Dev tool a publish would use, preferring the current space,
    /// then the Central space, then any other space. Names without a custom tool are absent.
    /// </summary>
    private async Task<Dictionary<string, Tool>> ResolveDevToolsAsync(List<string> names)
    {
        var tenantId = _currentTenantService.CurrentTenantId;
        var envType = _currentTenantService.CurrentEnvType;
        var targetSpaceId = _currentTenantService.CurrentSpaceId == Guid.Empty
            ? (Guid?)null
            : _currentTenantService.CurrentSpaceId;

        var normalizedNames = names.Select(w => w.ToLowerInvariant()).ToList();
        var candidates = await _unitOfWork.ToolRepo
            .GetByConditionAsync(w =>
                normalizedNames.Contains(w.Name.ToLower()) &&
                w.Type == ComponentTypeEnum.Custom &&
                w.TenantId == tenantId &&
                w.EnvType == envType)
            .IgnoreQueryFilters()
            .ToListAsync();

        return candidates
            .GroupBy(w => w.Name)
            .ToDictionary(g => g.Key, g => ResourceFlowAccessHelpers.PickResolvedTool(g, targetSpaceId)!, StringComparer.OrdinalIgnoreCase);
    }

    private async Task ValidateFlowToolAccessAsync(Guid publishingFlowId, List<string> toolNames, string flowName)
    {
        if (toolNames.Count == 0)
        {
            return;
        }

        var devTools = await ResolveDevToolsAsync(toolNames);
        var restrictedTools = devTools.Where(w => w.Value.IsResourceAccessRestricted).ToList();
        if (restrictedTools.Count == 0)
        {
            return;
        }

        var assignedFlowIds = await _resourceFlowAccessService.GetAssignedFlowIdsAsync(
            ResourceTypeEnum.Tool,
            restrictedTools.Select(w => w.Value.Id));

        foreach (var (name, devTool) in restrictedTools)
        {
            if (!assignedFlowIds.TryGetValue(devTool.Id, out var flowIds) || !flowIds.Contains(publishingFlowId))
            {
                throw new ResourceFlowAccessDeniedException(
                    $"Cannot publish: flow '{flowName}' is not assigned to restricted tool '{name}'. Ask the tool owner to assign this flow first.");
            }
        }
    }

    /// <summary>
    /// Resolves each queue name to the Dev queue a publish would use, preferring the current space,
    /// then the Central space, then any other space. Names without a queue are absent.
    /// </summary>
    private async Task<Dictionary<string, Queue>> ResolveDevQueuesAsync(List<string> names)
    {
        var tenantId = _currentTenantService.CurrentTenantId;
        var envType = _currentTenantService.CurrentEnvType;
        var targetSpaceId = _currentTenantService.CurrentSpaceId == Guid.Empty
            ? (Guid?)null
            : _currentTenantService.CurrentSpaceId;

        var normalizedNames = names.Select(w => w.ToLowerInvariant()).ToList();
        var candidates = await _unitOfWork.QueueRepo
            .GetByConditionAsync(w =>
                normalizedNames.Contains(w.Name.ToLower()) &&
                w.TenantId == tenantId &&
                w.EnvType == envType)
            .IgnoreQueryFilters()
            .Include(q => q.QueueUsers)
            .ToListAsync();

        return candidates
            .GroupBy(w => w.Name)
            .ToDictionary(g => g.Key, g => ResourceFlowAccessHelpers.PickResolvedQueue(g, targetSpaceId)!, StringComparer.OrdinalIgnoreCase);
    }

    private async Task ValidateFlowQueueAccessAsync(Guid publishingFlowId, List<string> queueNames, string flowName)
    {
        if (queueNames.Count == 0)
        {
            return;
        }

        var devQueues = await ResolveDevQueuesAsync(queueNames);
        var restrictedQueues = devQueues.Where(w => w.Value.IsResourceAccessRestricted).ToList();
        if (restrictedQueues.Count == 0)
        {
            return;
        }

        var assignedFlowIds = await _resourceFlowAccessService.GetAssignedFlowIdsAsync(
            ResourceTypeEnum.Queue,
            restrictedQueues.Select(w => w.Value.Id));

        foreach (var (name, devQueue) in restrictedQueues)
        {
            if (!assignedFlowIds.TryGetValue(devQueue.Id, out var flowIds) || !flowIds.Contains(publishingFlowId))
            {
                throw new ResourceFlowAccessDeniedException(
                    $"Cannot publish: flow '{flowName}' is not assigned to restricted queue '{name}'. Ask the queue owner to assign this flow first.");
            }
        }
    }

    private async Task<Dictionary<string, Skill>> ResolveDevSkillsAsync(List<string> names)
    {
        var tenantId = _currentTenantService.CurrentTenantId;
        var envType = _currentTenantService.CurrentEnvType;
        var targetSpaceId = _currentTenantService.CurrentSpaceId == Guid.Empty
            ? (Guid?)null
            : _currentTenantService.CurrentSpaceId;

        var normalizedNames = names.Select(w => w.ToLowerInvariant()).ToList();
        var candidates = await _unitOfWork.SkillRepo
            .GetByConditionAsync(w =>
                normalizedNames.Contains(w.Name.ToLower()) &&
                w.Type == ComponentTypeEnum.Custom &&
                w.TenantId == tenantId &&
                w.EnvType == envType)
            .IgnoreQueryFilters()
            .ToListAsync();

        return candidates
            .GroupBy(w => w.Name)
            .ToDictionary(g => g.Key, g => ResourceFlowAccessHelpers.PickResolvedSkill(g, targetSpaceId)!, StringComparer.OrdinalIgnoreCase);
    }

    private async Task ValidateFlowSkillAccessAsync(Guid publishingFlowId, List<string> skillNames, string flowName)
    {
        if (skillNames.Count == 0)
        {
            return;
        }

        var devSkills = await ResolveDevSkillsAsync(skillNames);
        var restrictedSkills = devSkills.Where(w => w.Value.IsResourceAccessRestricted).ToList();
        if (restrictedSkills.Count == 0)
        {
            return;
        }

        var assignedFlowIds = await _resourceFlowAccessService.GetAssignedFlowIdsAsync(
            ResourceTypeEnum.Skill,
            restrictedSkills.Select(w => w.Value.Id));

        foreach (var (name, devSkill) in restrictedSkills)
        {
            if (!assignedFlowIds.TryGetValue(devSkill.Id, out var flowIds) || !flowIds.Contains(publishingFlowId))
            {
                throw new ResourceFlowAccessDeniedException(
                    $"Cannot publish: flow '{flowName}' is not assigned to restricted skill '{name}'. Ask the skill owner to assign this flow first.");
            }
        }
    }

    private async Task<Dictionary<string, KnowledgeBase>> ResolveDevKnowledgeBasesAsync(List<string> names)
    {
        var tenantId = _currentTenantService.CurrentTenantId;
        var envType = _currentTenantService.CurrentEnvType;
        var targetSpaceId = _currentTenantService.CurrentSpaceId == Guid.Empty
            ? (Guid?)null
            : _currentTenantService.CurrentSpaceId;

        var normalizedNames = names.Select(w => w.ToLowerInvariant()).ToList();
        var candidates = await _unitOfWork.KnowledgeBaseRepo
            .GetByConditionAsync(w =>
                normalizedNames.Contains(w.Name.ToLower()) &&
                w.TenantId == tenantId &&
                w.EnvType == envType)
            .IgnoreQueryFilters()
            .Include(kb => kb.Files)
            .ToListAsync();

        return candidates
            .GroupBy(w => w.Name)
            .ToDictionary(g => g.Key, g => ResourceFlowAccessHelpers.PickResolvedKnowledgeBase(g, targetSpaceId)!, StringComparer.OrdinalIgnoreCase);
    }

    private async Task ValidateFlowKnowledgeBaseAccessAsync(Guid publishingFlowId, List<string> knowledgeBaseNames, string flowName)
    {
        if (knowledgeBaseNames.Count == 0)
        {
            return;
        }

        var devKnowledgeBases = await ResolveDevKnowledgeBasesAsync(knowledgeBaseNames);
        var restrictedKnowledgeBases = devKnowledgeBases.Where(w => w.Value.IsResourceAccessRestricted).ToList();
        if (restrictedKnowledgeBases.Count == 0)
        {
            return;
        }

        var assignedFlowIds = await _resourceFlowAccessService.GetAssignedFlowIdsAsync(
            ResourceTypeEnum.KnowledgeBase,
            restrictedKnowledgeBases.Select(w => w.Value.Id));

        foreach (var (name, devKnowledgeBase) in restrictedKnowledgeBases)
        {
            if (!assignedFlowIds.TryGetValue(devKnowledgeBase.Id, out var flowIds) || !flowIds.Contains(publishingFlowId))
            {
                throw new ResourceFlowAccessDeniedException(
                    $"Cannot publish: flow '{flowName}' is not assigned to restricted knowledge base '{name}'. Ask the knowledge base owner to assign this flow first.");
            }
        }
    }

    /// <summary>
    /// Resolves each credential name to the Dev credential a publish would use, preferring the current
    /// space, then the Central space, then any other space. Names without a credential are absent.
    /// </summary>
    private async Task<Dictionary<string, VaultCredential>> ResolveDevVaultCredentialsAsync(List<string> names)
    {
        var tenantId = _currentTenantService.CurrentTenantId;
        var envType = _currentTenantService.CurrentEnvType;
        var targetSpaceId = _currentTenantService.CurrentSpaceId == Guid.Empty
            ? (Guid?)null
            : _currentTenantService.CurrentSpaceId;

        var normalizedNames = names.Select(w => w.ToLowerInvariant()).ToList();
        var candidates = await _unitOfWork.VaultCredentialRepo
            .GetByConditionAsync(w =>
                normalizedNames.Contains(w.Name.ToLower()) &&
                w.TenantId == tenantId &&
                w.EnvType == envType)
            .IgnoreQueryFilters()
            .ToListAsync();

        return candidates
            .GroupBy(w => w.Name)
            .ToDictionary(g => g.Key, g => ResourceFlowAccessHelpers.PickResolvedCredential(g, targetSpaceId)!, StringComparer.OrdinalIgnoreCase);
    }

    private async Task ValidateFlowVaultCredentialAccessAsync(Guid publishingFlowId, List<string> credentialNames, string flowName)
    {
        if (credentialNames.Count == 0)
        {
            return;
        }

        var devVaultCredentials = await ResolveDevVaultCredentialsAsync(credentialNames);
        var restrictedVaultCredentials = devVaultCredentials.Where(w => w.Value.IsResourceAccessRestricted).ToList();
        if (restrictedVaultCredentials.Count == 0)
        {
            return;
        }

        var assignedFlowIds = await _resourceFlowAccessService.GetAssignedFlowIdsAsync(
            ResourceTypeEnum.VaultCredential,
            restrictedVaultCredentials.Select(w => w.Value.Id));

        foreach (var (name, devVaultCredential) in restrictedVaultCredentials)
        {
            if (!assignedFlowIds.TryGetValue(devVaultCredential.Id, out var flowIds) || !flowIds.Contains(publishingFlowId))
            {
                throw new ResourceFlowAccessDeniedException(
                    $"Cannot publish: flow '{flowName}' is not assigned to restricted credential '{name}'. Ask the credential owner to assign this flow first.");
            }
        }
    }

    private async Task<Dictionary<string, ConfigStore>> ResolveDevConfigStoresAsync(List<string> names)
    {
        var tenantId = _currentTenantService.CurrentTenantId;
        var envType = _currentTenantService.CurrentEnvType;
        var targetSpaceId = _currentTenantService.CurrentSpaceId == Guid.Empty
            ? (Guid?)null
            : _currentTenantService.CurrentSpaceId;

        var normalizedNames = names.Select(w => w.ToLowerInvariant()).ToList();
        var candidates = await _unitOfWork.ConfigStoreRepo
            .GetByConditionAsync(w =>
                normalizedNames.Contains(w.Name.ToLower()) &&
                w.TenantId == tenantId &&
                w.EnvType == envType)
            .IgnoreQueryFilters()
            .ToListAsync();

        return candidates
            .GroupBy(w => w.Name)
            .ToDictionary(g => g.Key, g => ResourceFlowAccessHelpers.PickResolvedConfigStore(g, targetSpaceId)!, StringComparer.OrdinalIgnoreCase);
    }

    private async Task ValidateFlowConfigStoreAccessAsync(Guid publishingFlowId, List<string> configStoreNames, string flowName)
    {
        if (configStoreNames.Count == 0)
        {
            return;
        }

        var devConfigStores = await ResolveDevConfigStoresAsync(configStoreNames);
        var restrictedConfigStores = devConfigStores.Where(w => w.Value.IsResourceAccessRestricted).ToList();
        if (restrictedConfigStores.Count == 0)
        {
            return;
        }

        var assignedFlowIds = await _resourceFlowAccessService.GetAssignedFlowIdsAsync(
            ResourceTypeEnum.ConfigStore,
            restrictedConfigStores.Select(w => w.Value.Id));

        foreach (var (name, devConfigStore) in restrictedConfigStores)
        {
            if (!assignedFlowIds.TryGetValue(devConfigStore.Id, out var flowIds) || !flowIds.Contains(publishingFlowId))
            {
                throw new ResourceFlowAccessDeniedException(
                    $"Cannot publish: flow '{flowName}' is not assigned to restricted key store '{name}'. Ask the key store owner to assign this flow first.");
            }
        }
    }

    /// <summary>
    /// Finds or creates the Production clone of a vault credential, including its encrypted
    /// key-value pairs. Returns the Production vault credential ID. A Dev credential GUID is never written
    /// onto a Production record: a missing source or failed clone fails the publish.
    /// </summary>
    private async Task<Guid?> ResolveProdCredentialIdAsync(Guid? sourceCredentialId)
    {
        if (sourceCredentialId is null || sourceCredentialId == Guid.Empty)
            return null;

        var sourceSecret = await _unitOfWork.VaultCredentialRepo
            .GetByConditionAsync(w => w.Id == sourceCredentialId && w.EnvType == _currentTenantService.CurrentEnvType)
            .FirstOrDefaultAsync();
        if (sourceSecret == null)
            throw new InvalidOperationException(
                $"Cannot publish: credential '{sourceCredentialId}' referenced by a knowledge base was not found in the {_currentTenantService.CurrentEnvType} environment.");

        await AcquireProdCloneLockAsync("credential", sourceSecret.Name);
        var prodSecret = await _unitOfWork.VaultCredentialRepo
            .GetByConditionAsync(w =>
                w.Name == sourceSecret.Name &&
                w.TenantId == _currentTenantService.CurrentTenantId &&
                w.EnvType == ConfigureEnvironmentType.Prod &&
                w.SpaceId == sourceSecret.SpaceId)
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync();
        if (prodSecret != null)
        {
            await EnsureProdCredentialMirroredAsync(prodSecret);

            var pendingFlowAccesses = new List<ResourceFlowAccess>();
            var pendingUserAccesses = new List<ResourceUserAccess>();
            var hasProdCredentialChanges = await StageProdCredentialAccessSyncAsync(sourceSecret, prodSecret, pendingFlowAccesses);
            await StageProdResourceUserAccessSyncAsync(sourceSecret.Id, prodSecret.Id, ResourceTypeEnum.VaultCredential, pendingUserAccesses);
            if (pendingFlowAccesses.Count > 0)
            {
                await _unitOfWork.ResourceFlowAccessRepo.InsertAsync(pendingFlowAccesses);
            }
            if (pendingUserAccesses.Count > 0)
            {
                await _unitOfWork.ResourceUserAccessRepo.InsertAsync(pendingUserAccesses);
            }

            if (pendingFlowAccesses.Count > 0 || pendingUserAccesses.Count > 0 || hasProdCredentialChanges)
            {
                await _unitOfWork.SaveAsync();
            }

            return prodSecret.Id;
        }

        var clone = await CloneVaultCredentialToProdAsync(sourceSecret);
        var clonePendingFlowAccesses = new List<ResourceFlowAccess>();
        var clonePendingUserAccesses = new List<ResourceUserAccess>();
        await StageProdCredentialAccessSyncAsync(sourceSecret, clone, clonePendingFlowAccesses);
        await StageProdResourceUserAccessSyncAsync(sourceSecret.Id, clone.Id, ResourceTypeEnum.VaultCredential, clonePendingUserAccesses);
        if (clonePendingFlowAccesses.Count > 0)
        {
            await _unitOfWork.ResourceFlowAccessRepo.InsertAsync(clonePendingFlowAccesses);
        }
        if (clonePendingUserAccesses.Count > 0)
        {
            await _unitOfWork.ResourceUserAccessRepo.InsertAsync(clonePendingUserAccesses);
        }
        if (clonePendingFlowAccesses.Count > 0 || clonePendingUserAccesses.Count > 0)
        {
            await _unitOfWork.SaveAsync();
        }

        return clone.Id;
    }

    /// <summary>
    /// Clones a source vault credential into a new Production record, copying its encrypted key-value
    /// pairs, inheriting its space, and assigning ownership to the current user.
    /// </summary>
    private async Task<VaultCredential> CloneVaultCredentialToProdAsync(VaultCredential devSecret)
    {
        var clone = new VaultCredential
        {
            Name = devSecret.Name,
            Type = devSecret.Type,
            Description = devSecret.Description,
            Data = devSecret.Data,
            UsageCount = 0,
            IsTenantWideAccess = devSecret.IsTenantWideAccess,
            IsResourceAccessRestricted = devSecret.IsResourceAccessRestricted,
            SpaceId = devSecret.SpaceId,
            EnvType = ConfigureEnvironmentType.Prod,
            CreatedByUserId = _userId,
            LastModifiedByUserId = _userId,
        };
        await _unitOfWork.VaultCredentialRepo.InsertAsync(clone);
        await _unitOfWork.SaveAsync();

        var devKeyValues = await _unitOfWork.EncryptedKeyValueRepo
            .GetByConditionAsync(kv => kv.VaultCredentialId == devSecret.Id)
            .ToListAsync();
        foreach (var kv in devKeyValues)
        {
            await _unitOfWork.EncryptedKeyValueRepo.InsertAsync(new EncryptedKeyValue
            {
                Name = kv.Name,
                Value = kv.Value,
                VaultCredentialId = clone.Id,
            });
        }
        await _unitOfWork.SaveAsync();

        await AssignOwnerOrThrowAsync(clone.Id, ResourceTypeEnum.VaultCredential);

        // Corsair keys connections by the vault credential Id, so mirroring the clone is what makes the
        // Production credential usable by platform tool calls.
        await EnsureProdCredentialMirroredAsync(clone);
        return clone;
    }

    private async Task<List<string>> EnsureProdVaultCredentialsAsync(List<string> names)
    {
        var missing = new List<string>();
        var pendingFlowAccesses = new List<ResourceFlowAccess>();
        var pendingUserAccesses = new List<ResourceUserAccess>();
        var hasProdCredentialChanges = false;
        var tenantId = _currentTenantService.CurrentTenantId;
        var devCredentials = await ResolveDevVaultCredentialsAsync(names);

        foreach (var name in names)
        {
            await AcquireProdCloneLockAsync("credential", name);
            if (!devCredentials.TryGetValue(name, out var devSecret))
            {
                missing.Add($"credential '{name}'");
                continue;
            }

            var prodSecret = await _unitOfWork.VaultCredentialRepo
                .GetByConditionAsync(w =>
                    w.Name == devSecret.Name &&
                    w.TenantId == tenantId &&
                    w.EnvType == ConfigureEnvironmentType.Prod &&
                    w.SpaceId == devSecret.SpaceId)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            if (prodSecret == null)
            {
                prodSecret = await CloneVaultCredentialToProdAsync(devSecret);
            }
            else
            {
                // Repair a Production clone that was created before Corsair mirroring existed.
                await EnsureProdCredentialMirroredAsync(prodSecret);
            }

            // IMPORTANT NOTE: Sync is add-only: a restriction is never lifted from Dev, and Prod rows set directly by an OM are kept.
            if (await StageProdCredentialAccessSyncAsync(devSecret, prodSecret, pendingFlowAccesses))
            {
                hasProdCredentialChanges = true;
            }

            await StageProdResourceUserAccessSyncAsync(devSecret.Id, prodSecret.Id, ResourceTypeEnum.VaultCredential, pendingUserAccesses);
        }

        if (pendingFlowAccesses.Count > 0)
        {
            await _unitOfWork.ResourceFlowAccessRepo.InsertAsync(pendingFlowAccesses);
        }

        if (pendingUserAccesses.Count > 0)
        {
            await _unitOfWork.ResourceUserAccessRepo.InsertAsync(pendingUserAccesses);
        }

        if (pendingFlowAccesses.Count > 0 || pendingUserAccesses.Count > 0 || hasProdCredentialChanges)
        {
            await _unitOfWork.SaveAsync();
        }

        return missing;
    }

    private async Task<bool> StageProdCredentialAccessSyncAsync(VaultCredential sourceSecret, VaultCredential prodSecret, List<ResourceFlowAccess> pendingFlowAccesses)
    {
        // IMPORTANT NOTE: Sync is add-only: a restriction is never lifted from Dev, and Prod rows set directly by an OM are kept.
        var hasProdCredentialChanges = false;
        if (sourceSecret.IsResourceAccessRestricted && !prodSecret.IsResourceAccessRestricted)
        {
            prodSecret.IsResourceAccessRestricted = true;
            _unitOfWork.VaultCredentialRepo.Update(prodSecret);
            hasProdCredentialChanges = true;
        }

        await EnsureProdVaultCredentialFlowAccessAsync(sourceSecret.Id, prodSecret.Id, pendingFlowAccesses);
        return hasProdCredentialChanges;
    }

    private async Task EnsureProdVaultCredentialFlowAccessAsync(Guid devCredentialId, Guid prodCredentialId, List<ResourceFlowAccess> pendingFlowAccesses)
    {
        var sourceFlowAccesses = await _unitOfWork.ResourceFlowAccessRepo
            .GetByConditionAsync(w => w.ResourceType == ResourceTypeEnum.VaultCredential && w.ResourceId == devCredentialId)
            .ToListAsync();

        if (sourceFlowAccesses.Count == 0)
            return;

        var existing = await _unitOfWork.ResourceFlowAccessRepo
            .GetByConditionAsync(w => w.ResourceType == ResourceTypeEnum.VaultCredential && w.ResourceId == prodCredentialId)
            .ToListAsync();

        var existingFlowIds = existing.Select(w => w.FlowId).ToHashSet();
        pendingFlowAccesses.AddRange(sourceFlowAccesses
            .Where(w => !existingFlowIds.Contains(w.FlowId) && !pendingFlowAccesses.Any(p => p.ResourceId == prodCredentialId && p.FlowId == w.FlowId))
            .Select(w => new ResourceFlowAccess
            {
                TenantId = w.TenantId,
                ResourceType = ResourceTypeEnum.VaultCredential,
                ResourceId = prodCredentialId,
                FlowId = w.FlowId,
                CreatedByUserId = _userId
            }));
    }

    /// <summary>
    /// Mirrors a Production credential to the Corsair sidecar. Corsair keys connections by the App
    /// Secret Id, so a Production clone that is not mirrored fails at runtime when a platform tool
    /// is invoked. Publishing fails when the mirror cannot be created, so a broken clone is never
    /// persisted.
    /// </summary>
    private async Task EnsureProdCredentialMirroredAsync(VaultCredential prodSecret)
    {
        if (!await _vaultCredentialService.SyncCredentialToCorsairAsync(prodSecret.Id))
        {
            throw new InvalidOperationException(
                $"Cannot publish: failed to mirror credential '{prodSecret.Name}' to the Corsair sidecar for the {ConfigureEnvironmentType.Prod} environment.");
        }
    }

    private async Task<List<string>> EnsureProdQueuesAsync(List<string> names)
    {
        var missing = new List<string>();
        var pendingFlowAccesses = new List<ResourceFlowAccess>();
        var pendingUserAccesses = new List<ResourceUserAccess>();
        var pendingQueueUsers = new List<QueueUser>();
        var hasProdQueueChanges = false;
        var tenantId = _currentTenantService.CurrentTenantId;
        var devQueues = await ResolveDevQueuesAsync(names);
        foreach (var name in names)
        {
            await AcquireProdCloneLockAsync("queue", name);
            if (!devQueues.TryGetValue(name, out var devQueue))
            {
                missing.Add($"queue '{name}'");
                continue;
            }

            var prodQueue = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w =>
                    w.Name == devQueue.Name &&
                    w.TenantId == tenantId &&
                    w.EnvType == ConfigureEnvironmentType.Prod &&
                    w.SpaceId == devQueue.SpaceId)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            if (prodQueue == null)
            {
                prodQueue = new Queue
                {
                    Name = devQueue.Name,
                    Type = devQueue.Type,
                    ProcessingMode = devQueue.ProcessingMode,
                    RouteToQueues = devQueue.RouteToQueues,
                    Description = devQueue.Description,
                    IsUniqueReferencesEnforced = devQueue.IsUniqueReferencesEnforced,
                    IsStoredEncrypted = devQueue.IsStoredEncrypted,
                    ShouldRetryFailedItems = devQueue.ShouldRetryFailedItems,
                    ShouldRetryAbandonedItems = devQueue.ShouldRetryAbandonedItems,
                    MaximumRetryAttempts = devQueue.MaximumRetryAttempts,
                    InputSchema = devQueue.InputSchema,
                    OutputSchema = devQueue.OutputSchema,
                    Statuses = devQueue.Statuses,
                    IsTenantWideAccess = devQueue.IsTenantWideAccess,
                    IsResourceAccessRestricted = devQueue.IsResourceAccessRestricted,
                    CredentialName = devQueue.CredentialName,
                    SpaceId = devQueue.SpaceId,
                    EnvType = ConfigureEnvironmentType.Prod,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId
                };
                await _unitOfWork.QueueRepo.InsertAsync(prodQueue);
                await _unitOfWork.SaveAsync();
                await AssignOwnerOrThrowAsync(prodQueue.Id, ResourceTypeEnum.Queue);
            }

            await StageProdQueueUsersAsync(devQueue, prodQueue, pendingQueueUsers);
            await StageProdResourceUserAccessSyncAsync(devQueue.Id, prodQueue.Id, ResourceTypeEnum.Queue, pendingUserAccesses);

            // IMPORTANT NOTE: Sync is add-only: a restriction is never lifted from Dev, and Prod rows set directly by an OM are kept.
            if (devQueue.IsResourceAccessRestricted && !prodQueue.IsResourceAccessRestricted)
            {
                prodQueue.IsResourceAccessRestricted = true;
                _unitOfWork.QueueRepo.Update(prodQueue);
                hasProdQueueChanges = true;
            }

            await EnsureProdQueueFlowAccessAsync(devQueue.Id, prodQueue.Id, pendingFlowAccesses);
        }

        if (pendingFlowAccesses.Count > 0)
        {
            await _unitOfWork.ResourceFlowAccessRepo.InsertAsync(pendingFlowAccesses);
        }

        if (pendingUserAccesses.Count > 0)
        {
            await _unitOfWork.ResourceUserAccessRepo.InsertAsync(pendingUserAccesses);
        }

        if (pendingQueueUsers.Count > 0)
        {
            await _unitOfWork.QueueUserRepo.InsertAsync(pendingQueueUsers);
        }

        if (pendingFlowAccesses.Count > 0 || pendingUserAccesses.Count > 0 || pendingQueueUsers.Count > 0 || hasProdQueueChanges)
        {
            await _unitOfWork.SaveAsync();
        }

        return missing;
    }

    private async Task StageProdQueueUsersAsync(Queue devQueue, Queue prodQueue, List<QueueUser> pendingQueueUsers)
    {
        var sourceUsers = devQueue.QueueUsers?.ToList() ?? new List<QueueUser>();
        if (sourceUsers.Count == 0)
            return;

        var existingUserIds = await _unitOfWork.QueueUserRepo
            .GetByConditionAsync(qu => qu.QueueId == prodQueue.Id)
            .Select(qu => qu.UserId)
            .ToListAsync();

        pendingQueueUsers.AddRange(sourceUsers
            .Where(qu => !existingUserIds.Contains(qu.UserId) && !pendingQueueUsers.Any(p => p.QueueId == prodQueue.Id && p.UserId == qu.UserId))
            .Select(qu => new QueueUser
            {
                QueueId = prodQueue.Id,
                UserId = qu.UserId,
                AccessType = qu.AccessType,
                TenantId = qu.TenantId,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId
            }));
    }

    private async Task EnsureProdQueueFlowAccessAsync(Guid devQueueId, Guid prodQueueId, List<ResourceFlowAccess> pendingFlowAccesses)
    {
        var sourceFlowAccesses = await _unitOfWork.ResourceFlowAccessRepo
            .GetByConditionAsync(w => w.ResourceType == ResourceTypeEnum.Queue && w.ResourceId == devQueueId)
            .ToListAsync();

        if (sourceFlowAccesses.Count == 0)
            return;

        var existing = await _unitOfWork.ResourceFlowAccessRepo
            .GetByConditionAsync(w => w.ResourceType == ResourceTypeEnum.Queue && w.ResourceId == prodQueueId)
            .ToListAsync();

        var existingFlowIds = existing.Select(w => w.FlowId).ToHashSet();
        pendingFlowAccesses.AddRange(sourceFlowAccesses
            .Where(w => !existingFlowIds.Contains(w.FlowId) && !pendingFlowAccesses.Any(p => p.ResourceId == prodQueueId && p.FlowId == w.FlowId))
            .Select(w => new ResourceFlowAccess
            {
                TenantId = w.TenantId,
                ResourceType = ResourceTypeEnum.Queue,
                ResourceId = prodQueueId,
                FlowId = w.FlowId,
                CreatedByUserId = _userId
            }));
    }

    private async Task<List<string>> EnsureProdToolsAsync(List<string> names)
    {
        var missing = new List<string>();
        var tenantId = _currentTenantService.CurrentTenantId;
        var devTools = await ResolveDevToolsAsync(names);
        var pendingFlowAccesses = new List<ResourceFlowAccess>();
        var pendingUserAccesses = new List<ResourceUserAccess>();
        var hasProdToolChanges = false;

        foreach (var name in names)
        {
            var normalizedName = name.ToLowerInvariant();
            devTools.TryGetValue(name, out var devTool);

            if (devTool == null)
            {
                // Platform's default tools are tenant-agnostic (TenantId = Guid.Empty, SpaceId = null)
                // and available in every environment, so they never need a Production clone.
                var platformToolExists = await _unitOfWork.ToolRepo
                    .GetByConditionAsync(w =>
                        w.Name.ToLower() == normalizedName &&
                        w.Type == ComponentTypeEnum.Platform &&
                        w.TenantId == Guid.Empty &&
                        w.SpaceId == null)
                    .IgnoreQueryFilters()
                    .AnyAsync();
                if (platformToolExists)
                    continue;

                missing.Add($"tool '{name}'");
                continue;
            }

            await AcquireProdCloneLockAsync("tool", name);

            var prodTool = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w =>
                    w.Name == devTool.Name &&
                    w.Type == ComponentTypeEnum.Custom &&
                    w.TenantId == tenantId &&
                    w.EnvType == ConfigureEnvironmentType.Prod &&
                    w.SpaceId == devTool.SpaceId)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();
            if (prodTool == null)
            {
                prodTool = new Tool
                {
                    Name = devTool.Name,
                    Description = devTool.Description,
                    Type = devTool.Type,
                    BaseUrl = devTool.BaseUrl,
                    OpenApiSpec = devTool.OpenApiSpec,
                    ParsedSchema = devTool.ParsedSchema,
                    AuthenticationType = devTool.AuthenticationType,
                    CredentialName = devTool.CredentialName,
                    IsTenantWideAccess = devTool.IsTenantWideAccess,
                    IsActive = devTool.IsActive,
                    IsVerified = devTool.IsVerified,
                    IsResourceAccessRestricted = devTool.IsResourceAccessRestricted,
                    SpaceId = devTool.SpaceId,
                    EnvType = ConfigureEnvironmentType.Prod,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId,
                };
                await _unitOfWork.ToolRepo.InsertAsync(prodTool);
                await _unitOfWork.SaveAsync();
                await AssignOwnerOrThrowAsync(prodTool.Id, ResourceTypeEnum.Tool);
            }

            // IMPORTANT NOTE: Sync is add-only: a restriction is never lifted from Dev, and Prod rows set directly by an OM are kept.
            if (devTool.IsResourceAccessRestricted && !prodTool.IsResourceAccessRestricted)
            {
                prodTool.IsResourceAccessRestricted = true;
                _unitOfWork.ToolRepo.Update(prodTool);
                hasProdToolChanges = true;
            }

            await EnsureProdToolFlowAccessAsync(devTool.Id, prodTool.Id, pendingFlowAccesses);
            await StageProdResourceUserAccessSyncAsync(devTool.Id, prodTool.Id, ResourceTypeEnum.Tool, pendingUserAccesses);
        }

        if (pendingFlowAccesses.Count > 0)
        {
            await _unitOfWork.ResourceFlowAccessRepo.InsertAsync(pendingFlowAccesses);
        }

        if (pendingUserAccesses.Count > 0)
        {
            await _unitOfWork.ResourceUserAccessRepo.InsertAsync(pendingUserAccesses);
        }

        if (pendingFlowAccesses.Count > 0 || pendingUserAccesses.Count > 0 || hasProdToolChanges)
        {
            await _unitOfWork.SaveAsync();
        }

        return missing;
    }

    private async Task EnsureProdToolFlowAccessAsync(Guid devToolId, Guid prodToolId, List<ResourceFlowAccess> pendingFlowAccesses)
    {
        var sourceFlowAccesses = await _unitOfWork.ResourceFlowAccessRepo
            .GetByConditionAsync(w => w.ResourceType == ResourceTypeEnum.Tool && w.ResourceId == devToolId)
            .ToListAsync();

        if (sourceFlowAccesses.Count == 0)
            return;

        var existing = await _unitOfWork.ResourceFlowAccessRepo
            .GetByConditionAsync(w => w.ResourceType == ResourceTypeEnum.Tool && w.ResourceId == prodToolId)
            .ToListAsync();

        var existingFlowIds = existing.Select(w => w.FlowId).ToHashSet();
        pendingFlowAccesses.AddRange(sourceFlowAccesses
            .Where(w => !existingFlowIds.Contains(w.FlowId) && !pendingFlowAccesses.Any(p => p.ResourceId == prodToolId && p.FlowId == w.FlowId))
            .Select(w => new ResourceFlowAccess
            {
                TenantId = w.TenantId,
                ResourceType = ResourceTypeEnum.Tool,
                ResourceId = prodToolId,
                FlowId = w.FlowId,
                CreatedByUserId = _userId
            }));
    }

    private async Task<List<string>> EnsureProdKnowledgeBasesAsync(List<string> names)
    {
        var missing = new List<string>();
        var pendingFlowAccesses = new List<ResourceFlowAccess>();
        var pendingUserAccesses = new List<ResourceUserAccess>();
        var hasProdKnowledgeBaseChanges = false;
        var tenantId = _currentTenantService.CurrentTenantId;
        var devKnowledgeBases = await ResolveDevKnowledgeBasesAsync(names);
        foreach (var name in names)
        {
            await AcquireProdCloneLockAsync("knowledge-base", name);
            if (!devKnowledgeBases.TryGetValue(name, out var devKb))
            {
                missing.Add($"knowledge base '{name}'");
                continue;
            }

            // External vector stores (e.g. qdrant) keep their vectors outside Postgres and cannot be
            // copied into Prod. Fail the publish instead of pointing the agent at an empty
            // Production knowledge base.
            if (devKb.VectorStore != VectorStoreEnum.pgvector)
                throw new InvalidOperationException(
                    $"Cannot publish: knowledge base '{devKb.Name}' uses the '{devKb.VectorStore}' vector store, whose vectors cannot be copied to Production. Switch it to pgvector or remove it from the flow.");

            var prodKb = await _unitOfWork.KnowledgeBaseRepo
                .GetByConditionAsync(w =>
                    w.Name == devKb.Name &&
                    w.TenantId == tenantId &&
                    w.EnvType == ConfigureEnvironmentType.Prod &&
                    w.SpaceId == devKb.SpaceId)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            // Create the Production header when missing; otherwise repair its files/vectors below.
            if (prodKb == null)
            {
                prodKb = new KnowledgeBase
                {
                    Name = devKb.Name,
                    Description = devKb.Description,
                    VectorStore = devKb.VectorStore,
                    EmbeddingProvider = devKb.EmbeddingProvider,
                    EmbeddingModel = devKb.EmbeddingModel,
                    EmbeddingCredentialId = await ResolveProdCredentialIdAsync(devKb.EmbeddingCredentialId),
                    StoreCredentialId = await ResolveProdCredentialIdAsync(devKb.StoreCredentialId),
                    CollectionName = devKb.CollectionName,
                    VectorStoreConfig = devKb.VectorStoreConfig,
                    IsTenantWideAccess = devKb.IsTenantWideAccess,
                    IsResourceAccessRestricted = devKb.IsResourceAccessRestricted,
                    SpaceId = devKb.SpaceId,
                    EnvType = ConfigureEnvironmentType.Prod,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId,
                };
                await _unitOfWork.KnowledgeBaseRepo.InsertAsync(prodKb);
                await _unitOfWork.SaveAsync();
                await AssignOwnerOrThrowAsync(prodKb.Id, ResourceTypeEnum.KnowledgeBase);
            }

            // IMPORTANT NOTE: Sync is add-only: a restriction is never lifted from Dev, and Prod rows set directly by an OM are kept.
            if (devKb.IsResourceAccessRestricted && !prodKb.IsResourceAccessRestricted)
            {
                prodKb.IsResourceAccessRestricted = true;
                _unitOfWork.KnowledgeBaseRepo.Update(prodKb);
                hasProdKnowledgeBaseChanges = true;
            }

            await EnsureProdKnowledgeBaseFlowAccessAsync(devKb.Id, prodKb.Id, pendingFlowAccesses);
            await StageProdResourceUserAccessSyncAsync(devKb.Id, prodKb.Id, ResourceTypeEnum.KnowledgeBase, pendingUserAccesses);

            // Mirror file metadata and vectors so the Production KB is usable (idempotent repair).
            await EnsureProdKnowledgeBaseFilesAsync(devKb, prodKb);
            await EnsureProdKnowledgeBaseVectorsAsync(devKb, prodKb);
        }

        if (pendingFlowAccesses.Count > 0)
        {
            await _unitOfWork.ResourceFlowAccessRepo.InsertAsync(pendingFlowAccesses);
        }

        if (pendingUserAccesses.Count > 0)
        {
            await _unitOfWork.ResourceUserAccessRepo.InsertAsync(pendingUserAccesses);
        }

        if (pendingFlowAccesses.Count > 0 || pendingUserAccesses.Count > 0 || hasProdKnowledgeBaseChanges)
        {
            await _unitOfWork.SaveAsync();
        }

        return missing;
    }

    private async Task EnsureProdKnowledgeBaseFlowAccessAsync(Guid devKnowledgeBaseId, Guid prodKnowledgeBaseId, List<ResourceFlowAccess> pendingFlowAccesses)
    {
        var sourceFlowAccesses = await _unitOfWork.ResourceFlowAccessRepo
            .GetByConditionAsync(w => w.ResourceType == ResourceTypeEnum.KnowledgeBase && w.ResourceId == devKnowledgeBaseId)
            .ToListAsync();

        if (sourceFlowAccesses.Count == 0)
            return;

        var existing = await _unitOfWork.ResourceFlowAccessRepo
            .GetByConditionAsync(w => w.ResourceType == ResourceTypeEnum.KnowledgeBase && w.ResourceId == prodKnowledgeBaseId)
            .ToListAsync();

        var existingFlowIds = existing.Select(w => w.FlowId).ToHashSet();
        pendingFlowAccesses.AddRange(sourceFlowAccesses
            .Where(w => !existingFlowIds.Contains(w.FlowId) && !pendingFlowAccesses.Any(p => p.ResourceId == prodKnowledgeBaseId && p.FlowId == w.FlowId))
            .Select(w => new ResourceFlowAccess
            {
                TenantId = w.TenantId,
                ResourceType = ResourceTypeEnum.KnowledgeBase,
                ResourceId = prodKnowledgeBaseId,
                FlowId = w.FlowId,
                CreatedByUserId = _userId
            }));
    }

    /// <summary>
    /// Copies the source knowledge base's file metadata onto its Production twin. File content is
    /// never stored, so only metadata/status is mirrored; names already present are skipped.
    /// </summary>
    private async Task EnsureProdKnowledgeBaseFilesAsync(KnowledgeBase devKb, KnowledgeBase prodKb)
    {
        var sourceFiles = devKb.Files?.ToList() ?? new List<KnowledgeBaseFile>();
        if (sourceFiles.Count == 0)
            return;

        var existingNames = await _unitOfWork.KnowledgeBaseFileRepo
            .GetByConditionAsync(f => f.KnowledgeBaseId == prodKb.Id)
            .Select(f => f.FileName)
            .ToListAsync();
        var existing = existingNames.ToHashSet(StringComparer.OrdinalIgnoreCase);

        var newFiles = sourceFiles
            .Where(f => !existing.Contains(f.FileName))
            .Select(f => new KnowledgeBaseFile
            {
                TenantId = f.TenantId,
                SpaceId = f.SpaceId,
                KnowledgeBaseId = prodKb.Id,
                FileName = f.FileName,
                Extension = f.Extension,
                ContentType = f.ContentType,
                SizeInBytes = f.SizeInBytes,
                ChunksCount = f.ChunksCount,
                Status = f.Status,
                VectorizationErrorMessage = f.VectorizationErrorMessage,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId,
            })
            .ToList();

        if (newFiles.Count == 0)
            return;

        await _unitOfWork.KnowledgeBaseFileRepo.InsertAsync(newFiles);
        await _unitOfWork.SaveAsync();
    }

    /// <summary>
    /// Copies the source knowledge base's pgvector rows into Production. Vectors are keyed by the
    /// kb_name stored in Metadata (there is no KB foreign key) and re-embedding is impossible because
    /// the source file content is discarded, so the rows are physically duplicated with
    /// Metadata.env_type rewritten to "prod".
    /// </summary>
    private async Task EnsureProdKnowledgeBaseVectorsAsync(KnowledgeBase devKb, KnowledgeBase prodKb)
    {
        var sourceVectors = await _unitOfWork.VectorStoreRepo
            .GetByConditionAsync(vs => vs.Metadata != null)
            .ToListAsync();

        var devEnv = _currentTenantService.CurrentEnvType.ToString().ToLowerInvariant();
        var devVectors = sourceVectors
            .Where(vs => VectorStoreMetadataHelpers.IsForKnowledgeBase(vs, devKb.Name) &&
                         string.Equals(VectorStoreMetadataHelpers.GetEnvType(vs), devEnv, StringComparison.OrdinalIgnoreCase))
            .ToList();
        if (devVectors.Count == 0)
            return;

        // Skip vectors already mirrored into Prod so republishing stays idempotent.
        var prodKeys = sourceVectors
            .Where(vs => VectorStoreMetadataHelpers.IsForKnowledgeBase(vs, prodKb.Name) &&
                         string.Equals(VectorStoreMetadataHelpers.GetEnvType(vs), "prod", StringComparison.OrdinalIgnoreCase))
            .Select(BuildVectorKey)
            .ToHashSet(StringComparer.Ordinal);

        var newVectors = new List<VectorStore>();
        foreach (var vector in devVectors)
        {
            if (prodKeys.Contains(BuildVectorKey(vector)))
                continue;

            newVectors.Add(new VectorStore
            {
                Id = Guid.NewGuid(),
                TenantId = vector.TenantId,
                Content = vector.Content,
                Embedding = new Vector(vector.Embedding.ToArray()),
                Metadata = CloneMetadataWithEnvType(vector.Metadata, "prod"),
            });
        }

        if (newVectors.Count == 0)
            return;

        await _unitOfWork.VectorStoreRepo.InsertAsync(newVectors);
        await _unitOfWork.SaveAsync();
    }

    // Identifies a vector within a knowledge base: document name + chunk content.
    private static string BuildVectorKey(VectorStore vectorStore)
    {
        var docName = string.Empty;
        if (vectorStore.Metadata?.RootElement.ValueKind == JsonValueKind.Object &&
            vectorStore.Metadata.RootElement.TryGetProperty("doc_name", out var docNameElement))
        {
            docName = docNameElement.GetString() ?? string.Empty;
        }

        return $"{docName}\u0000{vectorStore.Content}";
    }

    // Copies a vector's metadata JSON and stamps the target environment.
    private static JsonDocument CloneMetadataWithEnvType(JsonDocument? metadata, string envType)
    {
        var node = (metadata is null
            ? null
            : JsonNode.Parse(metadata.RootElement.GetRawText()) as JsonObject) ?? new JsonObject();
        node["env_type"] = envType;
        return JsonDocument.Parse(node.ToJsonString());
    }

    private async Task<List<string>> EnsureProdSkillsAsync(List<string> names)
    {
        var missing = new List<string>();
        var tenantId = _currentTenantService.CurrentTenantId;
        var envType = _currentTenantService.CurrentEnvType;
        var targetSpaceId = _currentTenantService.CurrentSpaceId == Guid.Empty
            ? (Guid?)null
            : _currentTenantService.CurrentSpaceId;
        var pendingFlowAccesses = new List<ResourceFlowAccess>();
        var pendingUserAccesses = new List<ResourceUserAccess>();
        var hasProdSkillChanges = false;

        foreach (var name in names)
        {
            var normalizedName = name.ToLowerInvariant();
            var devSkillCandidates = await _unitOfWork.SkillRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == normalizedName &&
                    w.Type == ComponentTypeEnum.Custom &&
                    w.TenantId == tenantId &&
                    w.EnvType == envType)
                .IgnoreQueryFilters()
                .Include(i => i.Files)
                .OrderBy(w => w.CreatedOn)
                .ThenBy(w => w.Id)
                .ToListAsync();

            var devSkill = ResourceFlowAccessHelpers.PickResolvedSkill(devSkillCandidates, targetSpaceId);

            if (devSkill == null)
            {
                var platformSkillExists = await _unitOfWork.SkillRepo
                    .GetByConditionAsync(w => w.Name.ToLower() == normalizedName && w.Type == ComponentTypeEnum.Platform)
                    .IgnoreQueryFilters()
                    .AnyAsync();
                if (platformSkillExists)
                    continue;

                missing.Add($"skill '{name}'");
                continue;
            }

            if (devSkill.IsGlobal)
                continue;

            await AcquireProdCloneLockAsync("skill", name);

            var prodSkill = await _unitOfWork.SkillRepo
                .GetByConditionAsync(w =>
                    w.Name == devSkill.Name &&
                    w.Type == ComponentTypeEnum.Custom &&
                    w.TenantId == tenantId &&
                    w.EnvType == ConfigureEnvironmentType.Prod &&
                    w.SpaceId == devSkill.SpaceId)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            // Create the Production skill when missing; otherwise repair its files below.
            if (prodSkill == null)
            {
                prodSkill = new Skill
                {
                    Name = devSkill.Name,
                    Description = devSkill.Description,
                    Type = devSkill.Type,
                    IsGlobal = devSkill.IsGlobal,
                    IsTenantWideAccess = devSkill.IsTenantWideAccess,
                    IsResourceAccessRestricted = devSkill.IsResourceAccessRestricted,
                    IsActive = devSkill.IsActive,
                    SpaceId = devSkill.SpaceId,
                    EnvType = ConfigureEnvironmentType.Prod,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId,
                };
                await _unitOfWork.SkillRepo.InsertAsync(prodSkill);
                await _unitOfWork.SaveAsync();
                await AssignOwnerOrThrowAsync(prodSkill.Id, ResourceTypeEnum.Skill);
            }

            // IMPORTANT NOTE: Sync is add-only: a restriction is never lifted from Dev, and Prod rows set directly by an OM are kept.
            if (devSkill.IsResourceAccessRestricted && !prodSkill.IsResourceAccessRestricted)
            {
                prodSkill.IsResourceAccessRestricted = true;
                _unitOfWork.SkillRepo.Update(prodSkill);
                hasProdSkillChanges = true;
            }

            await EnsureProdSkillFlowAccessAsync(devSkill.Id, prodSkill.Id, pendingFlowAccesses);
            await StageProdResourceUserAccessSyncAsync(devSkill.Id, prodSkill.Id, ResourceTypeEnum.Skill, pendingUserAccesses);

            await EnsureProdSkillFilesAsync(devSkill, prodSkill);
        }

        if (pendingFlowAccesses.Count > 0)
        {
            await _unitOfWork.ResourceFlowAccessRepo.InsertAsync(pendingFlowAccesses);
        }

        if (pendingUserAccesses.Count > 0)
        {
            await _unitOfWork.ResourceUserAccessRepo.InsertAsync(pendingUserAccesses);
        }

        if (pendingFlowAccesses.Count > 0 || pendingUserAccesses.Count > 0 || hasProdSkillChanges)
        {
            await _unitOfWork.SaveAsync();
        }

        return missing;
    }

    private async Task EnsureProdSkillFlowAccessAsync(Guid devSkillId, Guid prodSkillId, List<ResourceFlowAccess> pendingFlowAccesses)
    {
        var sourceFlowAccesses = await _unitOfWork.ResourceFlowAccessRepo
            .GetByConditionAsync(w => w.ResourceType == ResourceTypeEnum.Skill && w.ResourceId == devSkillId)
            .ToListAsync();

        if (sourceFlowAccesses.Count == 0)
            return;

        var existing = await _unitOfWork.ResourceFlowAccessRepo
            .GetByConditionAsync(w => w.ResourceType == ResourceTypeEnum.Skill && w.ResourceId == prodSkillId)
            .ToListAsync();

        var existingFlowIds = existing.Select(w => w.FlowId).ToHashSet();
        pendingFlowAccesses.AddRange(sourceFlowAccesses
            .Where(w => !existingFlowIds.Contains(w.FlowId) && !pendingFlowAccesses.Any(p => p.ResourceId == prodSkillId && p.FlowId == w.FlowId))
            .Select(w => new ResourceFlowAccess
            {
                TenantId = w.TenantId,
                ResourceType = ResourceTypeEnum.Skill,
                ResourceId = prodSkillId,
                FlowId = w.FlowId,
                CreatedByUserId = _userId
            }));
    }

    /// <summary>
    /// Copies the source skill's files onto its Production twin, skipping file names already present.
    /// </summary>
    private async Task EnsureProdSkillFilesAsync(Skill devSkill, Skill prodSkill)
    {
        var sourceFiles = devSkill.Files?.ToList() ?? new List<SkillFile>();
        if (sourceFiles.Count == 0)
            return;

        var existingNames = await _unitOfWork.SkillFileRepo
            .GetByConditionAsync(f => f.SkillId == prodSkill.Id)
            .Select(f => f.FileName)
            .ToListAsync();
        var existing = existingNames.ToHashSet(StringComparer.OrdinalIgnoreCase);

        var newFiles = sourceFiles
            .Where(f => !existing.Contains(f.FileName))
            .Select(f => new SkillFile
            {
                TenantId = f.TenantId,
                SpaceId = f.SpaceId,
                SkillId = prodSkill.Id,
                FileName = f.FileName,
                Content = f.Content,
                FileType = f.FileType,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId,
            })
            .ToList();

        if (newFiles.Count == 0)
            return;

        await _unitOfWork.SkillFileRepo.InsertAsync(newFiles);
        await _unitOfWork.SaveAsync();
    }

    private async Task<List<string>> EnsureProdConfigStoresAsync(List<string> names)
    {
        var missing = new List<string>();
        var pendingFlowAccesses = new List<ResourceFlowAccess>();
        var pendingUserAccesses = new List<ResourceUserAccess>();
        var hasProdConfigStoreChanges = false;
        var tenantId = _currentTenantService.CurrentTenantId;
        var devConfigStores = await ResolveDevConfigStoresAsync(names);
        foreach (var name in names)
        {
            await AcquireProdCloneLockAsync("config-store", name);
            if (!devConfigStores.TryGetValue(name, out var devConfigStore))
            {
                missing.Add($"key store '{name}'");
                continue;
            }

            var prodConfigStore = await _unitOfWork.ConfigStoreRepo
                .GetByConditionAsync(w =>
                    w.Name == devConfigStore.Name &&
                    w.TenantId == tenantId &&
                    w.EnvType == ConfigureEnvironmentType.Prod &&
                    w.SpaceId == devConfigStore.SpaceId)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            if (prodConfigStore == null)
            {
                prodConfigStore = new ConfigStore
                {
                    Name = devConfigStore.Name,
                    Description = devConfigStore.Description,
                    Type = devConfigStore.Type,
                    Value = devConfigStore.Value,
                    IsEncrypted = devConfigStore.IsEncrypted,
                    AccessLevel = devConfigStore.AccessLevel,
                    IsTenantWideAccess = devConfigStore.IsTenantWideAccess,
                    IsResourceAccessRestricted = devConfigStore.IsResourceAccessRestricted,
                    SpaceId = devConfigStore.SpaceId,
                    EnvType = ConfigureEnvironmentType.Prod,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId,
                };
                await _unitOfWork.ConfigStoreRepo.InsertAsync(prodConfigStore);
                await _unitOfWork.SaveAsync();
                await AssignOwnerOrThrowAsync(prodConfigStore.Id, ResourceTypeEnum.ConfigStore);
            }

            // IMPORTANT NOTE: Sync is add-only: a restriction is never lifted from Dev, and Prod rows set directly by an OM are kept.
            if (devConfigStore.IsResourceAccessRestricted && !prodConfigStore.IsResourceAccessRestricted)
            {
                prodConfigStore.IsResourceAccessRestricted = true;
                _unitOfWork.ConfigStoreRepo.Update(prodConfigStore);
                hasProdConfigStoreChanges = true;
            }

            await EnsureProdConfigStoreFlowAccessAsync(devConfigStore.Id, prodConfigStore.Id, pendingFlowAccesses);
            await StageProdResourceUserAccessSyncAsync(devConfigStore.Id, prodConfigStore.Id, ResourceTypeEnum.ConfigStore, pendingUserAccesses);
        }

        if (pendingFlowAccesses.Count > 0)
        {
            await _unitOfWork.ResourceFlowAccessRepo.InsertAsync(pendingFlowAccesses);
        }

        if (pendingUserAccesses.Count > 0)
        {
            await _unitOfWork.ResourceUserAccessRepo.InsertAsync(pendingUserAccesses);
        }

        if (pendingFlowAccesses.Count > 0 || pendingUserAccesses.Count > 0 || hasProdConfigStoreChanges)
        {
            await _unitOfWork.SaveAsync();
        }

        return missing;
    }

    private async Task EnsureProdConfigStoreFlowAccessAsync(Guid devConfigStoreId, Guid prodConfigStoreId, List<ResourceFlowAccess> pendingFlowAccesses)
    {
        var sourceFlowAccesses = await _unitOfWork.ResourceFlowAccessRepo
            .GetByConditionAsync(w => w.ResourceType == ResourceTypeEnum.ConfigStore && w.ResourceId == devConfigStoreId)
            .ToListAsync();

        if (sourceFlowAccesses.Count == 0)
            return;

        var existing = await _unitOfWork.ResourceFlowAccessRepo
            .GetByConditionAsync(w => w.ResourceType == ResourceTypeEnum.ConfigStore && w.ResourceId == prodConfigStoreId)
            .ToListAsync();

        var existingFlowIds = existing.Select(w => w.FlowId).ToHashSet();
        pendingFlowAccesses.AddRange(sourceFlowAccesses
            .Where(w => !existingFlowIds.Contains(w.FlowId) && !pendingFlowAccesses.Any(p => p.ResourceId == prodConfigStoreId && p.FlowId == w.FlowId))
            .Select(w => new ResourceFlowAccess
            {
                TenantId = w.TenantId,
                ResourceType = ResourceTypeEnum.ConfigStore,
                ResourceId = prodConfigStoreId,
                FlowId = w.FlowId,
                CreatedByUserId = _userId
            }));
    }

    // Copies the Dev resource's people-sharing rows onto its Prod clone. Add-only: existing
    // Prod rows are kept, and Dev access levels are never used to change them.
    private async Task StageProdResourceUserAccessSyncAsync(
        Guid devResourceId,
        Guid prodResourceId,
        ResourceTypeEnum resourceType,
        List<ResourceUserAccess> pendingUserAccesses)
    {
        var sourceAccesses = await _unitOfWork.ResourceUserAccessRepo
            .GetByConditionAsync(w => w.ResourceType == resourceType && w.ResourceId == devResourceId)
            .ToListAsync();

        if (sourceAccesses.Count == 0)
            return;

        var existingUserIds = await _unitOfWork.ResourceUserAccessRepo
            .GetByConditionAsync(w => w.ResourceType == resourceType && w.ResourceId == prodResourceId)
            .IgnoreQueryFilters()
            .Select(w => w.UserId)
            .ToListAsync();

        pendingUserAccesses.AddRange(sourceAccesses
            .Where(w => !existingUserIds.Contains(w.UserId) &&
                        !pendingUserAccesses.Any(p => p.ResourceType == resourceType && p.ResourceId == prodResourceId && p.UserId == w.UserId))
            .Select(w => new ResourceUserAccess
            {
                TenantId = w.TenantId,
                ResourceType = resourceType,
                ResourceId = prodResourceId,
                UserId = w.UserId,
                AccessLevel = w.AccessLevel
            }));
    }

    /// <summary>
    /// Assigns ownership to a newly cloned resource and aborts publishing when the share cannot be
    /// persisted. The caller's transaction then rolls back the resource clone as well.
    /// </summary>
    private async Task AssignOwnerOrThrowAsync(Guid resourceId, ResourceTypeEnum resourceType)
    {
        if (!await _resourceUserAccessService.AssignOwnerAsync(_userId, resourceId, resourceType))
        {
            throw new InvalidOperationException(
                $"Cannot publish: failed to assign ownership for the cloned {resourceType} '{resourceId}'.");
        }
    }

    private Task AcquireProdCloneLockAsync(string resourceType, string name)
    {
        var space = _currentTenantService.CurrentSpaceId == Guid.Empty
            ? "central"
            : _currentTenantService.CurrentSpaceId.ToString("N");
        var key = $"prod-clone:{_currentTenantService.CurrentTenantId:N}:{space}:{resourceType}:{name.Trim().ToUpperInvariant()}";
        return _unitOfWork.AcquireAdvisoryLockAsync(key);
    }
}
