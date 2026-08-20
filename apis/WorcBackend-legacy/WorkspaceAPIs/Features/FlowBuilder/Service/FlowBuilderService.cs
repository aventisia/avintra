using ExecutorLibrary.Models;
using ExecutorLibrary.Helpers;

namespace WorkspaceAPIs.Services;

public class FlowBuilderService : IFlowBuilderService
{
    private readonly ILogger<FlowBuilderService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserManagementGuardService _userManagementGuardService;
    private readonly IFlowVersionHistoryService _flowVersionHistoryService;
    private readonly IResourceShareService _resourceShareService;
    private readonly INotificationEventService _notificationEventService;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly Guid _userId;

    public FlowBuilderService(
        ILogger<FlowBuilderService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IUserManagementGuardService userManagementGuardService,
        IFlowVersionHistoryService flowVersionHistoryService,
        IResourceShareService resourceShareService,
        INotificationEventService notificationEventService,
        ICurrentTenantService currentTenantService)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _userManagementGuardService = userManagementGuardService;
        _flowVersionHistoryService = flowVersionHistoryService;
        _resourceShareService = resourceShareService;
        _notificationEventService = notificationEventService;
        _currentTenantService = currentTenantService;
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
            var parentFlowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w => w.Id == parentFlowVersionId)
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
            // var accessibleResourceIds = await _resourceShareService.GetAccessibleResourceIdsAsync(_userId, ResourceTypeEnum.FlowVersion);
            // var accessToPublishedFlowVersionIds = await _unitOfWork.FlowVersionUserRepo
            //     .GetByConditionAsync(w => w.UserId == _userId)
            //     .Select(s => s.FlowVersionId)
            //     .ToListAsync();

            // // Merge the accessible resource IDs with the published flow version IDs
            // accessibleResourceIds.AddRange(accessToPublishedFlowVersionIds);

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
            var subFlows = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w => subFlowIds.Contains(w.Id))
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
            var (canView, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
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
                _logger.LogInformation($"No unpublished flow version found for FlowId {flowId}. VersionId: {versionId}.");
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

    // Publishes a flow version based on the specified type (Agent, Block, Template).
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
                _logger.LogInformation("No flow version found for FlowId {FlowId} with VersionId {VersionId}.", publishFlowVersionDto.FlowId, publishFlowVersionDto.Id);
                serviceResponse.Message = "Flow version does not exist.";
                return serviceResponse;
            }

            // Verify the user has any access to the flow (owner, edit, or view).
            var (canAccess, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
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

            // Validate: Flow version is already published
            if (flowVersion.IsPublished == true)
                return serviceResponse.Update("Flow is already published.", 400);

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
                    // Determine the publish type for logging and message purposes
                    var publishType = publishFlowVersionDto.Type.ToString();

                    // Log the start of publishing
                    _logger.LogInformation($"Publishing flow version as {publishType}. FlowVersionId: {publishFlowVersionDto.Id}, FlowId: {publishFlowVersionDto.Id}");

                    // Adapt the DTO values into the flow version object
                    publishFlowVersionDto.Adapt(flowVersion);

                    // Collect and store the referenced resource names (credentials, queues, KBs, tools, skills)
                    flowVersion.ResourceReferences = await CollectResourceReferencesAsync(flowVersion.ReactFlowObject);

                    // Mark the flow version as published
                    flowVersion.IsPublished = true;
                    flowVersion.LastModifiedByUserId = _userId;
                    flowVersion.LastModifiedOn = DateTimeOffset.UtcNow;

                    // Update and persist changes
                    _unitOfWork.FlowVersionRepo.Update(flowVersion);
                    if (!await _unitOfWork.SaveAsync())
                    {
                        _logger.LogError($"Failed to save changes while publishing the flow version as {publishType}.");
                        return serviceResponse;
                    }

                    // Log success and set response message
                    _logger.LogInformation($"Flow version successfully published as {publishType}.");
                    serviceResponse.Message = $"{publishType} published successfully.";

                    // Notify the Orchestrator Manager(s) of the tenant that an agent is ready for use
                    if (publishFlowVersionDto.Type == PublishTypesEnum.Agent || publishFlowVersionDto.Type == PublishTypesEnum.ChatAgent)
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
        catch (Exception ex)
        {
            // Log any exceptions that occur
            _logger.LogError($"Exception occurred in PublishFlowVersionAsync: {ex.Message}");
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
            var (canEidt, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
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
                _logger.LogInformation($"No flow version found for Id {flowSilentUpdateDto.VersionId}. The flow version could not be saved.");
                serviceResponse.Message = "Flow version does not exist.";
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
                _logger.LogInformation("Failed to save changes while saving flow version silently.");
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
    /// Parses the flow's ReactFlowObject and collects the referenced resource NAMES keyed by
    /// resource type. All supported resource types are always present; unreferenced types hold
    /// an empty array. This powers publish-time Prod find-or-clone resolution.
    /// </summary>
    private async Task<string?> CollectResourceReferencesAsync(string? reactFlowObject)
    {
        var references = new Dictionary<string, List<string>>
        {
            ["credentials"] = new(),
            ["queues"] = new(),
            ["knowledgeBases"] = new(),
            ["tools"] = new(),
            ["skills"] = new(),
            ["keyStores"] = new(),
        };

        try
        {
            var flow = ReactFlowHelper.Parse(reactFlowObject);
            if (flow?.Nodes is null || flow.Nodes.Count == 0)
                return System.Text.Json.JsonSerializer.Serialize(references);

            foreach (var node in flow.Nodes)
            {
                if (node?.Data?.Inputs is null)
                    continue;

                // Build a key/value map from the node inputs.
                var configObj = new JsonObject();
                foreach (var input in node.Data.Inputs)
                {
                    if (string.IsNullOrWhiteSpace(input.Key) || input.Value is null)
                        continue;
                    configObj[input.Key] = input.Value is JsonElement je
                        ? JsonNode.Parse(je.GetRawText())
                        : JsonNode.Parse(System.Text.Json.JsonSerializer.Serialize(input.Value));
                }

                // Credentials: any key containing __CredentialName__ (value is the credential name)
                foreach (var kvp in configObj)
                {
                    if (kvp.Key.Contains("__CredentialName__") && kvp.Value is not null)
                        AddIfNotPresent(references["credentials"], kvp.Value.ToString());
                }

                // Credentials: __ModelConfig__* -> credential_id / credential_name
                foreach (var kvp in configObj)
                {
                    if (!kvp.Key.Contains("__ModelConfig__") || kvp.Value is not JsonObject mc)
                        continue;
                    var credId = ReadCredentialReference(mc);
                    if (credId is not null && !IsEmptyCredential(credId))
                        AddIfNotPresent(references["credentials"], credId);
                }

                // Tools: __ToolsConfig__* -> array of { tool, credential_id / credential_name }
                foreach (var kvp in configObj)
                {
                    if (!kvp.Key.Contains("__ToolsConfig__") || kvp.Value is not JsonArray toolsArr)
                        continue;
                    foreach (var item in toolsArr)
                    {
                        if (item is not JsonObject toolObj)
                            continue;
                        if (toolObj.TryGetPropertyValue("tool", out var toolNode) && toolNode is not null)
                            AddIfNotPresent(references["tools"], toolNode.ToString());
                        var toolCred = ReadCredentialReference(toolObj);
                        if (toolCred is not null && !IsEmptyCredential(toolCred))
                            AddIfNotPresent(references["credentials"], toolCred);
                    }
                }

                // Knowledge bases: __KbConfig__* -> knowledgeBase[] names
                foreach (var kvp in configObj)
                {
                    if (!kvp.Key.Contains("__KbConfig__") || kvp.Value is not JsonObject kb)
                        continue;
                    if (kb.TryGetPropertyValue("knowledgeBase", out var kbNode) && kbNode is JsonArray kbArr)
                    {
                        foreach (var name in kbArr.Where(x => x is not null))
                            AddIfNotPresent(references["knowledgeBases"], name!.ToString());
                    }
                }

                // Skills: __SkillsConfig__* -> skills[] names
                foreach (var kvp in configObj)
                {
                    if (!kvp.Key.Contains("__SkillsConfig__") || kvp.Value is not JsonObject sc)
                        continue;
                    if (sc.TryGetPropertyValue("skills", out var skillsNode) && skillsNode is JsonArray skillsArr)
                    {
                        foreach (var name in skillsArr.Where(x => x is not null))
                            AddIfNotPresent(references["skills"], name!.ToString());
                    }
                }

                // Queues: QueueName / QueueId node fields (persisted value is the queue name)
                foreach (var kvp in configObj)
                {
                    if (kvp.Key.Equals("QueueName", StringComparison.OrdinalIgnoreCase) && kvp.Value is not null)
                        AddIfNotPresent(references["queues"], kvp.Value.ToString());
                }
            }

            // Validate credential references: resolve any legacy GUID values to their actual
            // credential names and drop references that no longer resolve in the current env.
            await ValidateCredentialReferencesAsync(references["credentials"]);

            // Ensure PROD clones exist for every referenced resource so the published agent can
            // resolve them in the Production environment. Missing resources are created with
            // EnvType = Prod and their names are retained in the ResourceReferences JSON.
            await EnsureProdClonesAsync(references);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to collect resource references while publishing.");
        }

        return System.Text.Json.JsonSerializer.Serialize(references);
    }

    /// <summary>
    /// Normalizes the collected credential references. Legacy rows may store a GUID instead of a
    /// name; those are resolved to the actual credential name. References that do not resolve to a
    /// credential in the current environment are removed so the published flow never points at a
    /// missing credential.
    /// </summary>
    private async Task ValidateCredentialReferencesAsync(List<string> credentialNames)
    {
        for (var i = credentialNames.Count - 1; i >= 0; i--)
        {
            var value = credentialNames[i];
            if (string.IsNullOrWhiteSpace(value))
            {
                credentialNames.RemoveAt(i);
                continue;
            }

            // Legacy GUID value -> resolve to the actual credential name.
            if (Guid.TryParse(value, out var guid))
            {
                var byId = await _unitOfWork.AppSecretRepo
                    .GetByConditionAsync(w => w.Id == guid && w.EnvType == _currentTenantService.CurrentEnvType)
                    .FirstOrDefaultAsync();
                if (byId != null)
                {
                    credentialNames[i] = byId.Name;
                    continue;
                }
            }

            // Verify the name resolves in the current environment; otherwise drop it.
            var byName = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Name == value && w.EnvType == _currentTenantService.CurrentEnvType)
                .FirstOrDefaultAsync();
            if (byName == null)
                credentialNames.RemoveAt(i);
        }
    }

    /// <summary>
    /// Ensures a Production (EnvType = Prod) clone exists for every referenced resource. The source
    /// is the current request environment; the target is always Prod. Existing Prod records are left
    /// untouched (find-or-clone).
    /// </summary>
    private async Task EnsureProdClonesAsync(Dictionary<string, List<string>> references)
    {
        if (references["credentials"].Count > 0)
            await EnsureProdAppSecretsAsync(references["credentials"]);
        if (references["queues"].Count > 0)
            await EnsureProdQueuesAsync(references["queues"]);
        if (references["tools"].Count > 0)
            await EnsureProdToolsAsync(references["tools"]);
        if (references["knowledgeBases"].Count > 0)
            await EnsureProdKnowledgeBasesAsync(references["knowledgeBases"]);
        if (references["skills"].Count > 0)
            await EnsureProdSkillsAsync(references["skills"]);
        if (references["keyStores"].Count > 0)
            await EnsureProdKeyStoresAsync(references["keyStores"]);
    }

    /// <summary>
    /// Finds or creates the Production clone of a credential (App Secret), including its encrypted
    /// key-value pairs. Returns the Production App Secret ID, or the original ID when no source
    /// credential exists.
    /// </summary>
    private async Task<Guid?> ResolveProdCredentialIdAsync(Guid? devCredentialId)
    {
        if (devCredentialId is null || devCredentialId == Guid.Empty)
            return devCredentialId;

        var devSecret = await _unitOfWork.AppSecretRepo
            .GetByConditionAsync(w => w.Id == devCredentialId && w.EnvType == _currentTenantService.CurrentEnvType)
            .FirstOrDefaultAsync();
        if (devSecret == null)
            return devCredentialId;

        var prodSecret = await _unitOfWork.AppSecretRepo
            .GetByConditionAsync(w => w.Name == devSecret.Name && w.EnvType == ConfigureEnvironmentType.Prod)
            .FirstOrDefaultAsync();
        if (prodSecret != null)
            return prodSecret.Id;

        var clone = await CloneAppSecretToProdAsync(devSecret);
        return clone?.Id ?? devCredentialId;
    }

    /// <summary>
    /// Clones a source App Secret into a new Production record, copying its encrypted key-value
    /// pairs and assigning ownership to the current user.
    /// </summary>
    private async Task<AppSecret?> CloneAppSecretToProdAsync(AppSecret devSecret)
    {
        var clone = new AppSecret
        {
            Name = devSecret.Name,
            Type = devSecret.Type,
            Description = devSecret.Description,
            Data = devSecret.Data,
            UsageCount = 0,
            IsTenantWideAccess = devSecret.IsTenantWideAccess,
            EnvType = ConfigureEnvironmentType.Prod,
            CreatedByUserId = _userId,
            LastModifiedByUserId = _userId,
        };
        await _unitOfWork.AppSecretRepo.InsertAsync(clone);
        await _unitOfWork.SaveAsync();

        var devKeyValues = await _unitOfWork.EncryptedKeyValueRepo
            .GetByConditionAsync(kv => kv.AppSecretId == devSecret.Id)
            .ToListAsync();
        foreach (var kv in devKeyValues)
        {
            await _unitOfWork.EncryptedKeyValueRepo.InsertAsync(new EncryptedKeyValue
            {
                Name = kv.Name,
                Value = kv.Value,
                AppSecretId = clone.Id,
            });
        }
        await _unitOfWork.SaveAsync();

        await _resourceShareService.AssignOwnerAsync(_userId, clone.Id, ResourceTypeEnum.AppSecret);
        return clone;
    }

    private async Task EnsureProdAppSecretsAsync(List<string> names)
    {
        foreach (var name in names)
        {
            var devSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Name == name && w.EnvType == _currentTenantService.CurrentEnvType)
                .FirstOrDefaultAsync();
            if (devSecret == null)
                continue;

            var prodSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Name == name && w.EnvType == ConfigureEnvironmentType.Prod)
                .FirstOrDefaultAsync();
            if (prodSecret != null)
                continue;

            await CloneAppSecretToProdAsync(devSecret);
        }
    }

    private async Task EnsureProdQueuesAsync(List<string> names)
    {
        foreach (var name in names)
        {
            var devQueue = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w => w.Name == name && w.EnvType == _currentTenantService.CurrentEnvType)
                .FirstOrDefaultAsync();
            if (devQueue == null)
                continue;

            var prodQueue = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w => w.Name == name && w.EnvType == ConfigureEnvironmentType.Prod)
                .FirstOrDefaultAsync();
            if (prodQueue != null)
                continue;

            var clone = new Queue
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
                CredentialId = await ResolveProdCredentialIdAsync(devQueue.CredentialId),
                EnvType = ConfigureEnvironmentType.Prod,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId,
            };
            await _unitOfWork.QueueRepo.InsertAsync(clone);
            await _unitOfWork.SaveAsync();
            await _resourceShareService.AssignOwnerAsync(_userId, clone.Id, ResourceTypeEnum.Queue);
        }
    }

    private async Task EnsureProdToolsAsync(List<string> names)
    {
        foreach (var name in names)
        {
            var devTool = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w => w.Name == name && w.EnvType == _currentTenantService.CurrentEnvType)
                .FirstOrDefaultAsync();
            if (devTool == null)
                continue;

            var prodTool = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w => w.Name == name && w.EnvType == ConfigureEnvironmentType.Prod)
                .FirstOrDefaultAsync();
            if (prodTool != null)
                continue;

            var clone = new Tool
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
                EnvType = ConfigureEnvironmentType.Prod,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId,
            };
            await _unitOfWork.ToolRepo.InsertAsync(clone);
            await _unitOfWork.SaveAsync();
            await _resourceShareService.AssignOwnerAsync(_userId, clone.Id, ResourceTypeEnum.Tool);
        }
    }

    private async Task EnsureProdKnowledgeBasesAsync(List<string> names)
    {
        foreach (var name in names)
        {
            var devKb = await _unitOfWork.KnowledgeBaseRepo
                .GetByConditionAsync(w => w.Name == name && w.EnvType == _currentTenantService.CurrentEnvType)
                .FirstOrDefaultAsync();
            if (devKb == null)
                continue;

            var prodKb = await _unitOfWork.KnowledgeBaseRepo
                .GetByConditionAsync(w => w.Name == name && w.EnvType == ConfigureEnvironmentType.Prod)
                .FirstOrDefaultAsync();
            if (prodKb != null)
                continue;

            var clone = new KnowledgeBase
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
                EnvType = ConfigureEnvironmentType.Prod,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId,
            };
            await _unitOfWork.KnowledgeBaseRepo.InsertAsync(clone);
            await _unitOfWork.SaveAsync();
            await _resourceShareService.AssignOwnerAsync(_userId, clone.Id, ResourceTypeEnum.KnowledgeBase);
        }
    }

    private async Task EnsureProdSkillsAsync(List<string> names)
    {
        foreach (var name in names)
        {
            var devSkill = await _unitOfWork.SkillRepo
                .GetByConditionAsync(w => w.Name == name && w.EnvType == _currentTenantService.CurrentEnvType)
                .Include(i => i.Files)
                .FirstOrDefaultAsync();
            if (devSkill == null)
                continue;

            var prodSkill = await _unitOfWork.SkillRepo
                .GetByConditionAsync(w => w.Name == name && w.EnvType == ConfigureEnvironmentType.Prod)
                .FirstOrDefaultAsync();
            if (prodSkill != null)
                continue;

            var clone = new Skill
            {
                Name = devSkill.Name,
                Description = devSkill.Description,
                Type = devSkill.Type,
                IsGlobal = devSkill.IsGlobal,
                IsTenantWideAccess = devSkill.IsTenantWideAccess,
                IsActive = devSkill.IsActive,
                EnvType = ConfigureEnvironmentType.Prod,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId,
            };
            await _unitOfWork.SkillRepo.InsertAsync(clone);
            await _unitOfWork.SaveAsync();

            foreach (var file in devSkill.Files ?? new List<SkillFile>())
            {
                await _unitOfWork.SkillFileRepo.InsertAsync(new SkillFile
                {
                    SkillId = clone.Id,
                    FileName = file.FileName,
                    Content = file.Content,
                    FileType = file.FileType,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId,
                });
            }
            await _unitOfWork.SaveAsync();

            await _resourceShareService.AssignOwnerAsync(_userId, clone.Id, ResourceTypeEnum.Skill);
        }
    }

    private async Task EnsureProdKeyStoresAsync(List<string> names)
    {
        foreach (var name in names)
        {
            var devKeyStore = await _unitOfWork.KeyStoreRepo
                .GetByConditionAsync(w => w.Name == name && w.EnvType == _currentTenantService.CurrentEnvType)
                .FirstOrDefaultAsync();
            if (devKeyStore == null)
                continue;

            var prodKeyStore = await _unitOfWork.KeyStoreRepo
                .GetByConditionAsync(w => w.Name == name && w.EnvType == ConfigureEnvironmentType.Prod)
                .FirstOrDefaultAsync();
            if (prodKeyStore != null)
                continue;

            var clone = new KeyStore
            {
                Name = devKeyStore.Name,
                Description = devKeyStore.Description,
                Type = devKeyStore.Type,
                Value = devKeyStore.Value,
                IsEncrypted = devKeyStore.IsEncrypted,
                AccessLevel = devKeyStore.AccessLevel,
                IsTenantWideAccess = devKeyStore.IsTenantWideAccess,
                EnvType = ConfigureEnvironmentType.Prod,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId,
            };
            await _unitOfWork.KeyStoreRepo.InsertAsync(clone);
            await _unitOfWork.SaveAsync();
            await _resourceShareService.AssignOwnerAsync(_userId, clone.Id, ResourceTypeEnum.KeyStore);
        }
    }

    private static bool IsEmptyCredential(string? value) =>
        string.IsNullOrWhiteSpace(value) ||
        value == "00000000-0000-0000-0000-000000000000";

    // Reads a credential reference from a config object. Accepts both the canonical
    // "credential_name" key and the legacy "credential_id" key (Q12 back-compat).
    private static string? ReadCredentialReference(JsonObject obj)
    {
        if (obj.TryGetPropertyValue("credential_name", out var nameNode) && nameNode is not null)
            return nameNode.ToString();
        if (obj.TryGetPropertyValue("credential_id", out var idNode) && idNode is not null)
            return idNode.ToString();
        return null;
    }

    private static void AddIfNotPresent(List<string> list, string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return;
        if (!list.Contains(value, StringComparer.OrdinalIgnoreCase))
            list.Add(value);
    }
}