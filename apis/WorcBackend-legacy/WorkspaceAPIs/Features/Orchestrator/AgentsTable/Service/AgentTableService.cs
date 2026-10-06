namespace WorkspaceAPIs.Services;

public class AgentTableService : IAgentTableService
{
    private readonly ILogger<AgentTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IClientStatusStore _clientStatusStore;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IResourceShareService _resourceShareService;
    private readonly Guid _userId;

    public AgentTableService(
        ILogger<AgentTableService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IClientStatusStore clientStatusStore,
        ICurrentTenantService currentTenantService,
        IResourceShareService resourceShareService)
    {
        // Extract the user ID from the HTTP context and assign it to _userId.
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _clientStatusStore = clientStatusStore;
        _currentTenantService = currentTenantService;
        _resourceShareService = resourceShareService;
    }

    // Retrieves a list of published flow versions for a specific flow by its identifier.
    public async Task<ServiceResponse<IEnumerable<AgentTableDto>>> GetPublishFlowVersionsAsync(Guid? flowId)
    {
        // Initialize ServiceResponse to indicate failure by default.
        var serviceResponse = new ServiceResponse<IEnumerable<AgentTableDto>>
        {
            Data = null,
            Message = "Failed to retrieve published flow version. Please try again"
        };

        try
        {
            // Try to retrieve the flow versions from the repository.
            var publishedFlowVersions = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    (flowId == null || w.FlowId == flowId) &&
                    w.Flow.Type != FlowTypesEnum.Block &&
                    w.IsPublished &&
                    !w.IsArchived &&
                    // Central (Guid.Empty) shows only Central (null SpaceId) agents;
                    // otherwise filter by the selected space.
                    (_currentTenantService.CurrentSpaceId == Guid.Empty
                        ? w.SpaceId == null
                        : w.SpaceId == _currentTenantService.CurrentSpaceId)
                )
                .Include(i => i.Flow)
                .Include(i => i.FlowVersionMachines)
                .Include(i => i.CreatedByUser)
                .OrderBy(o => o.VersionNumber)
                .AsNoTracking()
                .ToListAsync();

            // If successful, map the retrieved flow versions to AgentTableDto and set the response.
            serviceResponse.Data = publishedFlowVersions.Adapt<IEnumerable<AgentTableDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Versions retrieved successfully";
        }
        catch (Exception ex)
        {
            // Log any exception and return the default service response.
            _logger.LogError(ex.ToString());
        }

        // Return the service response.
        return serviceResponse;
    }

    // Retrieves all archived flow versions accessible to the current user.
    public async Task<ServiceResponse<IEnumerable<AgentTableDto>>> GetArchivedFlowVersionsAsync(bool isPersonal)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<AgentTableDto>>
        {
            Data = null,
            Message = "Failed to retrieve archived flow versions. Please try again."
        };

        try
        {
            // Store retrieved flow versions and access permissions
            List<FlowVersion> flowVersions = new();
            Dictionary<Guid, ResourceAccessTypeEnum>? resourceAccess = new();

            if (isPersonal)
            {
                // Retrieve archived flow versions created by the current user
                flowVersions = await _unitOfWork.FlowVersionRepo
                    .GetByConditionAsync(w =>
                        w.IsArchived &&
                        w.CreatedByUserId == _userId
                    )
                    .OrderByDescending(w => w.CreatedOn)
                    .Include(i => i.Flow)
                    .Include(i => i.FlowVersionMachines)
                    .Include(i => i.CreatedByUser)
                    .OrderBy(o => o.VersionNumber)
                    .ToListAsync();
            }
            else
            {
                // Retrieve all flow version resources the current user has access to
                resourceAccess = await _resourceShareService.GetAccessibleResourcesWithAccessAsync(
                    _userId,
                    ResourceTypeEnum.FlowVersion,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                    });

                // Retrieve archived shared flow versions that are either:
                // - Tenant-wide accessible, or
                // - Explicitly shared with the current user
                flowVersions = await _unitOfWork.FlowVersionRepo
                    .GetByConditionAsync(w =>
                        w.CreatedByUserId != _userId &&
                        (
                            w.IsTenantWideAccess ||
                            resourceAccess.Keys.Contains(w.Id)
                        )
                    )
                    .OrderByDescending(w => w.CreatedOn)
                    .Include(i => i.Flow)
                    .Include(i => i.FlowVersionMachines)
                    .Include(i => i.CreatedByUser)
                    .OrderBy(o => o.VersionNumber)
                    .ToListAsync();
            }

            // Map flow version entities to DTOs
            var flowVersionDtoList = flowVersions.Adapt<List<AgentTableDto>>();

            // Set access level for each flow version
            flowVersionDtoList.ForEach(fv =>
            {
                fv.AccessLevel = isPersonal
                    ? ResourceAccessTypeEnum.Owner
                    : resourceAccess?.GetValueOrDefault(fv.Id, ResourceAccessTypeEnum.View)
                        ?? ResourceAccessTypeEnum.View;
            });

            // Task successful
            serviceResponse.Data = flowVersionDtoList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Archived flow versions retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Updates the details of a specific flow version.
    public async Task<ServiceResponse<AgentTableDto>> UpdateFlowVersionAsync(AgentTableDto agentTableDto)
    {
        var serviceResponse = new ServiceResponse<AgentTableDto>
        {
            Data = null,
            Message = "Failed to update the flow version. Please try again"
        };

        try
        {
            // Retrieve the existing flow version by ID
            var existingVersion = await _unitOfWork.FlowVersionRepo
            .GetByConditionAsync(
                w => w.Id == agentTableDto.Id
            )
            .SingleOrDefaultAsync();

            if (existingVersion == null)
            {
                serviceResponse.Message = "Flow version not found.";
                return serviceResponse;
            }

            // On the archive transition (false -> true) detach the version from every
            // active relationship and drop the resources it leaves orphaned, all in the
            // same unit of work, so no orphan links or resources survive.
            if (!existingVersion.IsArchived && agentTableDto.IsArchived)
            {
                await ArchiveFlowVersionAsync(existingVersion);
            }

            // Map the updated fields from the DTO to the entity
            existingVersion.IsArchived = agentTableDto.IsArchived;
            existingVersion.IsDisabled = agentTableDto.IsDisabled;
            existingVersion.LastModifiedByUserId = _userId;
            // You can update more fields here as needed.

            // Update and save changes
            _unitOfWork.FlowVersionRepo.Update(existingVersion);
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }
            ;

            // Map the updated entity back to DTO
            serviceResponse.Data = existingVersion.Adapt<AgentTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow version updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating the flow version.");
        }

        return serviceResponse;
    }

    // Retrieves a list of archived flow versions for a specific flow by its identifier.
    public async Task<ServiceResponse<IEnumerable<AgentTableDto>>> GetArchiveFlowVersionsAsync(Guid? flowId)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<AgentTableDto>>
        {
            Data = null,
            Message = "Failed to retrieve archived flow version. Please try again."
        };

        try
        {
            // Try to retrieve the archived flow versions from the repository.
            var archivedFlowVersions = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    (flowId == null || w.FlowId == flowId) &&
                    w.Flow.Type != FlowTypesEnum.Block &&
                    w.IsArchived
                )
                .Include(i => i.Flow)
                .Include(i => i.FlowVersionMachines)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .OrderBy(o => o.VersionNumber)
                .AsNoTracking()
                .ToListAsync();

            // If successful, map the retrieved flow versions to AgentTableDto and set the response.
            serviceResponse.Data = archivedFlowVersions.Adapt<IEnumerable<AgentTableDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Versions retrieved successfully";
        }
        catch (Exception ex)
        {
            // Log any exception and return the default service response.
            _logger.LogError(ex.ToString());
        }

        // Return the service response.
        return serviceResponse;
    }

    // Retrieves a list of draft flow versions for a specific flow by its identifier.
    public async Task<ServiceResponse<IEnumerable<AgentTableDto>>> GetExecuteFlowVersionsAsync(Guid? flowId)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<AgentTableDto>>
        {
            Data = null,
            Message = "Failed to retrieve draft flow version. Please try again."
        };

        try
        {
            // Try to retrieve the draft flow versions from the repository.
            var draftFlowVersions = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    (flowId == null || w.FlowId == flowId) &&
                    w.Flow.Type != FlowTypesEnum.Block &&
                    !w.IsPublished &&
                    !w.IsArchived
                )
                .Include(i => i.Flow)
                .Include(i => i.FlowVersionMachines)
                .Include(i => i.CreatedByUser)
                .OrderBy(o => o.VersionNumber)
                .AsNoTracking()
                .ToListAsync();

            // If successful, map the retrieved flow versions to AgentTableDto and set the response.
            serviceResponse.Data = draftFlowVersions.Adapt<IEnumerable<AgentTableDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Versions retrieved successfully";
        }
        catch (Exception ex)
        {
            // Log any exception and return the default service response.
            _logger.LogError(ex.ToString());
        }

        // Return the service response.
        return serviceResponse;
    }

    // Assigns multiple machines to an agent.
    public async Task<ServiceResponse<bool>> AssignMachinesToAgentAsync(Guid agentId, IEnumerable<Guid> machineIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to assign machines. Please try again."
        };

        try
        {
            // Check if machine IDs are unique.
            if (machineIds.Count() != machineIds.Distinct().Count())
            {
                serviceResponse.Message = "Machine IDs cannot contain duplicates.";
                return serviceResponse;
            }

            // Check if the agent exists and belongs to the current user.
            var agent = await _unitOfWork.FlowVersionRepo
                        .GetByConditionAsync(w =>
                            w.Id == agentId
                        )
                        .Include(a => a.FlowVersionMachines)
                        .FirstOrDefaultAsync();

            if (agent == null)
            {
                // If agent does not exist or does not belong to the current user, return failure.
                serviceResponse.Message = "The agent does not exist.";
                return serviceResponse;
            }

            // Check if all provided machine IDs are valid and belong to the current user.
            var machines = await _unitOfWork.MachineRepo
                        .GetByConditionAsync(w =>
                            machineIds.Contains(w.Id)
                        )
                        .ToListAsync();

            var invalidMachineIds = machineIds.Except(machines.Select(m => m.Id)).ToList();

            if (invalidMachineIds.Any())
            {
                // If there are invalid machine IDs, return failure.
                serviceResponse.Message = $"The following machine IDs are invalid or do not belong to the user: {string.Join(", ", invalidMachineIds)}";
                return serviceResponse;
            }

            // Identify machines that are already assigned to the agent.
            var existingMachineFlows = agent?.FlowVersionMachines?.ToList() ?? new List<Machine_FlowVersion>();
            var existingMachineIds = existingMachineFlows.Select(mf => mf.MachineId).ToList();

            // Identify new machine IDs that are not yet assigned to the agent.
            var newMachineIds = machineIds.Except(existingMachineIds).ToList();

            // Identify machine IDs that are no longer assigned and need to be removed.
            var removedMachineIds = existingMachineIds.Except(machineIds).ToList();

            // If no changes are made (no new machines, no machines to remove), inform the user.
            if (!newMachineIds.Any() && !removedMachineIds.Any())
            {
                serviceResponse.Message = "No changes made to the machine assignments.";
                return serviceResponse;
            }

            // Create new Machine_FlowVersion entries for machines not already assigned.
            var machineFlowsToAdd = newMachineIds.Select(id => new Machine_FlowVersion()
            {
                MachineId = id,
                FlowVersionId = agentId
            }).ToList();

            // Remove existing Machine_FlowVersion entries for machines that are no longer assigned.
            var machineFlowsToRemove = existingMachineFlows
                .Where(mf => removedMachineIds.Contains(mf.MachineId))
                .ToList();

            // Begin the transaction to insert and remove data.
            if (machineFlowsToAdd.Any())
            {
                await _unitOfWork.Machine_FlowVersionRepo.InsertAsync(machineFlowsToAdd);
            }

            if (machineFlowsToRemove.Any())
            {
                _unitOfWork.Machine_FlowVersionRepo.Delete(machineFlowsToRemove);
            }

            // Attempt to save the changes to the database.
            if (!await _unitOfWork.SaveAsync())
            {
                // If saving fails, log and return failure.
                serviceResponse.Message = "Failed to update machine assignments for the agent.";
                return serviceResponse;
            }

            // Return success with the count of newly assigned and removed machines.
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{newMachineIds.Count} machines assigned and {removedMachineIds.Count} machines removed from the agent.";
        }
        catch (Exception ex)
        {
            // Log any unexpected error.
            _logger.LogError(ex, "An unexpected error occurred while assigning machines.");
            return serviceResponse;
        }

        // Return the service response.
        return serviceResponse;
    }

    // Removes multiple machines from an agent.
    public async Task<ServiceResponse<bool>> RemoveMachinesFromAgentAsync(Guid agentId, IEnumerable<Guid> machineIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to remove machines. Please try again."
        };

        try
        {
            // Check if machine IDs are unique.
            if (machineIds.Count() != machineIds.Distinct().Count())
            {
                serviceResponse.Message = "Machine IDs cannot contain duplicates.";
                return serviceResponse;
            }

            // Check if the agent exists and belongs to the current user.
            var agent = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w => w.Id == agentId)
                .Include(m => m.FlowVersionMachines)
                .FirstOrDefaultAsync();

            if (agent == null)
            {
                // If agent does not exist or does not belong to the current user, return failure.
                serviceResponse.Message = "The agent does not exist.";
                return serviceResponse;
            }

            // Check if machine flows exist for the provided machine IDs and are assigned to the agent.
            var machineFlows = await _unitOfWork.Machine_FlowVersionRepo
                .GetByConditionAsync(w => machineIds.Contains(w.MachineId) && w.FlowVersionId == agentId)
                .ToListAsync();

            var invalidMachineIds = machineIds.Except(machineFlows.Select(m => m.MachineId)).ToList();

            if (invalidMachineIds.Any())
            {
                // If there are invalid machine IDs, return failure.
                serviceResponse.Message = $"The following machine IDs are invalid or do not belong to the user: {string.Join(", ", invalidMachineIds)}";
                return serviceResponse;
            }

            // Identify machines to remove that are currently assigned to the agent.
            var machinesToRemove = machineIds.Intersect(agent.FlowVersionMachines?.Select(mf => mf.MachineId) ?? Enumerable.Empty<Guid>()).ToList();

            if (!machinesToRemove.Any())
            {
                // If no machines are assigned, inform the user.
                serviceResponse.Message = "No matching machines are assigned to this agent.";
                return serviceResponse;
            }

            // Delete the selected machine flows.
            _unitOfWork.Machine_FlowVersionRepo.Delete(machineFlows);

            // Attempt to save changes to the database.
            if (!await _unitOfWork.SaveAsync())
            {
                // If saving fails, log and return failure.
                serviceResponse.Message = "Failed to remove machines from the agent.";
                return serviceResponse;
            }

            // Return success with the count of removed machines.
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{machinesToRemove.Count} machines successfully removed from the agent.";
        }
        catch (Exception ex)
        {
            // Log any unexpected error.
            _logger.LogError(ex, "An unexpected error occurred while removing machines.");
        }

        // Return the service response.
        return serviceResponse;
    }

    // Retrieves the list of machines assigned to an agent.
    public async Task<ServiceResponse<IEnumerable<AssignMachineDto>>> GetMachinesByAgentAsync(Guid agentId)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<AssignMachineDto>>
        {
            Data = null,
            Message = "Failed to retrieve machines. Please try again."
        };

        try
        {
            // Check if the agent exists and belongs to the current user.
            var agent = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w => w.Id == agentId)
                .Include(a => a.FlowVersionMachines)
                .FirstOrDefaultAsync();

            if (agent == null)
            {
                // If agent does not exist or does not belong to the current user, return failure.
                serviceResponse.Message = "The agent does not exist.";
                return serviceResponse;
            }

            // Retrieve the list of all machine flows.
            var machines = await _unitOfWork.Machine_FlowVersionRepo
                .GetByConditionAsync(w => w.FlowVersionId == agentId)
                .Include(m => m.Machine)
                .ProjectToType<AssignMachineDto>()
                .ToListAsync();

            var clientDataStores = await _clientStatusStore.GetMachineStatusesAsync(_currentTenantService.CurrentTenantId);

            // Iterate through each machine in the 'machines' collection
            foreach (var machine in machines)
            {
                // Find the status of the machine by matching its ClientId with the current machine's Id
                var clientDataStore = clientDataStores.FirstOrDefault(status => status.ClientId == machine.Id);

                // Set the machine's status based on whether a matching status was found
                machine.Status = clientDataStore != null ? clientDataStore.Status : MachineStatusEnum.Offline;
                machine.JobId = (clientDataStore?.Status == MachineStatusEnum.Running) ? clientDataStore.JobId : null;
            }

            // Return the machines along with their assignment status.
            serviceResponse.Data = machines;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machines retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log any unexpected error.
            _logger.LogError(ex, "An unexpected error occurred while retrieving machines for agent {AgentId}.", agentId);
        }

        return serviceResponse;
    }


    // Searches and retrieves a list of published flow versions where the flow name matches the specified search key.
    public async Task<ServiceResponse<IEnumerable<AgentTableDto>>> SearchPublishFlowVersionsAsync(string searchKey)
    {
        // Initialize a failed service response by default
        var serviceResponse = new ServiceResponse<IEnumerable<AgentTableDto>>
        {
            Data = null,
            Message = "Failed to retrieve published agents. Please try again."
        };

        try
        {
            // Query the repository for flow versions where the flow name contains the search key (case-insensitive)
            // This includes both published and in-build (unpublished) agents so any agent can be assigned to a queue.
            var publishedFlowVersions = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    !w.IsArchived &&
                    !w.IsDisabled &&
                    w.Flow.Type != FlowTypesEnum.Block &&
                    w.Flow.Name.ToLower().Contains(searchKey.ToLower())
                )
                .Include(i => i.Flow)
                .Include(i => i.FlowVersionMachines)
                .Include(i => i.CreatedByUser)
                .OrderBy(o => o.VersionNumber)
                .AsNoTracking()
                .ToListAsync();

            // Map the result to DTOs and update the service response to indicate success
            serviceResponse.Data = publishedFlowVersions.Adapt<IEnumerable<AgentTableDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Agents retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log detailed error information for troubleshooting
            _logger.LogError($"[SearchPublishFlowVersionsAsync] Error occurred while searching published agents for key '{searchKey}': {ex}");
        }

        return serviceResponse;
    }

    // Disables multiple flow versions by updating their IsDisabled status to true.
    public async Task<ServiceResponse<bool>> DisableMultipleFlowVersionsAsync(IEnumerable<Guid> flowVersionIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to disable flow versions. Please try again."
        };

        try
        {
            // Retrieve the flow versions to be disabled
            var flowVersionsToDisable = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w => w.Flow.Type != FlowTypesEnum.Block && flowVersionIds.Contains(w.Id))
                .ToListAsync();

            if (!flowVersionsToDisable.Any())
            {
                serviceResponse.Message = "No flow versions found for the provided IDs.";
                return serviceResponse;
            }

            // Disable each flow version by updating its IsDisabled flag to true
            foreach (var version in flowVersionsToDisable)
            {
                version.IsDisabled = true;
                version.LastModifiedByUserId = _userId;
            }
            _unitOfWork.FlowVersionRepo.Update(flowVersionsToDisable);

            // Save the changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow versions disabled successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while disabling the flow versions.");
        }

        return serviceResponse;
    }

    // Retrieves the total count of published flow versions for a specific flow or all flows.
    public async Task<ServiceResponse<int>> GetTotalPublishedFlowVersionsAsync()
    {
        // Initialize ServiceResponse to indicate failure by default.
        var serviceResponse = new ServiceResponse<int>
        {
            Data = 0, // Default to 0 if the count cannot be retrieved.
            Message = "Failed to retrieve the total count of published flow versions. Please try again."
        };

        try
        {
            // Try to retrieve the count of published flow versions from the repository.
            var totalPublishedFlowVersions = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    w.Flow.Type != FlowTypesEnum.Block &&
                    w.IsPublished &&
                    !w.IsArchived
                )
                .CountAsync();

            // If successful, set the response data with the total count.
            serviceResponse.Data = totalPublishedFlowVersions;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Total count of published agents retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log any exception and return the default service response.
            _logger.LogError(ex.ToString());
        }

        // Return the service response.
        return serviceResponse;
    }

    // Retrieves the published agents (flow versions) assigned to all machines linked with the
    // currently logged-in user, together with the live status and running job of each machine.
    public async Task<ServiceResponse<IEnumerable<AgentTableDto>>> GetMyAgentsAsync()
    {
        // Initialize ServiceResponse to indicate failure by default.
        var serviceResponse = new ServiceResponse<IEnumerable<AgentTableDto>>
        {
            Data = null,
            Message = "Failed to retrieve my agents. Please try again."
        };

        try
        {
            // Fetch all machines owned by the currently logged-in user, together with their
            // assigned flow versions. Global query filters scope by tenant and current space.
            var machines = await _unitOfWork.MachineRepo
                .GetByConditionAsync(w => w.UserId == _userId)
                .Include(i => i.MachineFlowVersions)
                    .ThenInclude(i => i.FlowVersion)
                .Include(i => i.MachineFlowVersions)
                    .ThenInclude(i => i.FlowVersion!.Flow)
                .Include(i => i.MachineFlowVersions)
                    .ThenInclude(i => i.FlowVersion!.CreatedByUser)
                .AsNoTracking()
                .ToListAsync();

            // Collect all flow versions assigned to the user's machines, keeping only
            // published and non-archived agents (flow versions).
            var flowVersions = machines
                .SelectMany(m => m.MachineFlowVersions)
                .Select(mf => mf.FlowVersion)
                .Where(fv => fv != null && fv.IsPublished && !fv.IsArchived && fv.Flow!.Type != FlowTypesEnum.Block)
                .DistinctBy(fv => fv!.Id)
                .ToList();

            // Map the flow versions to DTOs.
            var agentDtos = flowVersions.Adapt<List<AgentTableDto>>();

            // Attach the queues linked to each agent (flow version) so the UI can render
            // them as hyperlinks to the queue's work items.
            var flowVersionIds = agentDtos.Select(agent => agent.Id).ToList();
            var queueFlowVersions = await _unitOfWork.QueueFlowVersionRepo
                .GetByConditionAsync(qf => flowVersionIds.Contains(qf.FlowVersionId))
                .Include(qf => qf.Queue)
                .AsNoTracking()
                .ToListAsync();

            // Index each agent's workflow definition so its referenced AI models can be resolved.
            var reactFlowObjectByVersionId = flowVersions
                .Where(fv => fv != null)
                .ToDictionary(fv => fv!.Id, fv => fv!.ReactFlowObject);

            foreach (var agent in agentDtos)
            {
                agent.Queues = queueFlowVersions
                    .Where(qf => qf.FlowVersionId == agent.Id && qf.Queue != null)
                    .Select(qf => new AgentQueueDto
                    {
                        Id = qf.Queue!.Id,
                        Name = qf.Queue!.Name,
                        Type = qf.Queue!.Type
                    })
                    .ToList();

                agent.AiModels = AiModelHelper.ExtractModelNames(
                    reactFlowObjectByVersionId.GetValueOrDefault(agent.Id));
            }

            // Enrich each agent with the live status and running job of the machine hosting it.
            var clientStatuses = await _clientStatusStore.GetMachineStatusesAsync(_currentTenantService.CurrentTenantId);

            foreach (var agent in agentDtos)
            {
                // The machines that host this agent among the user's machines.
                var hostingMachines = machines
                    .Where(m => m.MachineFlowVersions.Any(mf => mf.FlowVersionId == agent.Id))
                    .ToList();

                if (hostingMachines.Count == 0)
                    continue;

                // Record the machine ids the agent is assigned to (used by the remove action).
                agent.AssignedMachineIds = hostingMachines.Select(m => m.Id).ToList();

                var hostingMachine = hostingMachines.First();
                var clientStatus = clientStatuses.FirstOrDefault(status => status.ClientId == hostingMachine.Id);

                agent.Status = clientStatus != null ? clientStatus.Status : MachineStatusEnum.Offline;
                agent.JobId = (clientStatus?.Status == MachineStatusEnum.Running) ? clientStatus.JobId : null;
            }

            serviceResponse.Data = agentDtos;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "My agents retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log any exception and return the default service response.
            _logger.LogError(ex, "An unexpected error occurred while retrieving my agents for user {UserId}.", _userId);
        }

        // Return the service response.
        return serviceResponse;
    }

    // Archives a flow version: captures what it referenced, detaches every active
    // relationship and deletes the resources it leaves orphaned. Deletions are staged
    // only; the caller owns the SaveAsync so the whole archive commits atomically.
    private async Task ArchiveFlowVersionAsync(FlowVersion flowVersion)
    {
        // Capture the agent's resource references and trigger links before they are cleared.
        var resourceReferences = ParseResourceReferences(flowVersion.ResourceReferences);
        var linkedTriggerIds = await _unitOfWork.TriggerFlowVersionRepo
            .GetByConditionAsync(w => w.FlowVersionId == flowVersion.Id)
            .Select(w => w.TriggerId)
            .Distinct()
            .ToListAsync();

        await UnlinkFlowVersionRelationshipsAsync(flowVersion);
        await DeleteOrphanedResourcesAsync(flowVersion, resourceReferences, linkedTriggerIds);
    }

    // Stages the removal of every active relationship for a flow version being archived.
    // Deletions are staged only; the caller owns the SaveAsync so the archive flag and
    // all unlinks commit together in a single unit of work.
    private async Task UnlinkFlowVersionRelationshipsAsync(FlowVersion flowVersion)
    {
        var flowVersionId = flowVersion.Id;
        var tenantId = flowVersion.TenantId;

        // Unlink machines so the archived version can no longer be dispatched
        await DeleteLinksAsync(_unitOfWork.Machine_FlowVersionRepo, w => w.FlowVersionId == flowVersionId);

        // Unlink queues from the archived version
        await DeleteLinksAsync(_unitOfWork.QueueFlowVersionRepo, w => w.FlowVersionId == flowVersionId);

        // Unlink triggers (time/webhook/email/message). Removing these rows is what
        // stops the trigger handlers from scheduling the archived version.
        await DeleteLinksAsync(_unitOfWork.TriggerFlowVersionRepo, w => w.FlowVersionId == flowVersionId);

        // Release tool references
        await DeleteLinksAsync(_unitOfWork.FlowVersionToolRepo, w => w.FlowVersionId == flowVersionId);

        // Revoke per-user access and the tenant-wide access shortcut
        await DeleteLinksAsync(_unitOfWork.FlowVersionUserRepo, w => w.FlowVersionId == flowVersionId);
        flowVersion.IsTenantWideAccess = false;

        // Remove the agent risk registry row. Registry rows are created without a space,
        // so the space filter is bypassed; the tenant guard keeps the scope safe.
        var registryRows = await _unitOfWork.AgentRiskRegistryRepo
            .GetByConditionAsync(w => w.FlowVersionId == flowVersionId && w.TenantId == tenantId)
            .IgnoreQueryFilters()
            .ToListAsync();
        if (registryRows.Count > 0)
        {
            _unitOfWork.AgentRiskRegistryRepo.Delete(registryRows);
        }

        // Revoke the resource shares for the archived version
        await _resourceShareService.DeleteResourceSharesAsync(flowVersionId, ResourceTypeEnum.FlowVersion);

        // Cancel pending/running jobs; completed runs are retained as history.
        // The space filter is bypassed so jobs are cancelled regardless of the space
        // the archive request resolves to; the tenant guard keeps the scope safe.
        var activeJobs = await _unitOfWork.JobRepo
            .GetByConditionAsync(w =>
                w.FlowVersionId == flowVersionId &&
                w.TenantId == tenantId &&
                (w.Status == JobStatusEnum.Created || w.Status == JobStatusEnum.Running))
            .IgnoreQueryFilters()
            .ToListAsync();
        if (activeJobs.Count > 0)
        {
            activeJobs.ForEach(job => job.Status = JobStatusEnum.Canceled);
            _unitOfWork.JobRepo.Update(activeJobs);
        }

        // Reset the resource references so the version no longer advertises links
        // to resources it has been detached from
        flowVersion.ResourceReferences = System.Text.Json.JsonSerializer.Serialize(
            new Dictionary<string, List<string>>
            {
                ["credentials"] = new(),
                ["queues"] = new(),
                ["knowledgeBases"] = new(),
                ["tools"] = new(),
                ["skills"] = new(),
                ["keyStores"] = new(),
            });
    }

    // Stages the deletion of every entity matching the condition. Nothing is saved here;
    // the caller owns the SaveAsync so all unlinks commit together.
    private async Task DeleteLinksAsync<TEntity>(
        IRepositoryBase<TEntity, WorkspaceDbContext> repository,
        Expression<Func<TEntity, bool>> condition) where TEntity : class
    {
        var entities = await repository.GetByConditionAsync(condition).ToListAsync();
        if (entities.Count > 0)
        {
            repository.Delete(entities);
        }
    }

    // Deletes the credentials, queues, knowledge bases, tools, skills, key stores and
    // triggers the archived agent referenced when no other active agent uses them and they
    // have no other relationships. Platform, global, tenant-wide and PROD-guarded resources
    // are always kept.
    private async Task DeleteOrphanedResourcesAsync(
        FlowVersion flowVersion,
        Dictionary<string, List<string>> resourceReferences,
        List<Guid> linkedTriggerIds)
    {
        // Names still referenced by other active agents, keyed by resource type.
        var usedNames = await GetResourceNamesUsedByOtherAgentsAsync(flowVersion.Id);

        await DeleteOrphanedCredentialsAsync(resourceReferences["credentials"], usedNames["credentials"], flowVersion.Id);
        await DeleteOrphanedQueuesAsync(resourceReferences["queues"], usedNames["queues"], flowVersion.Id);
        await DeleteOrphanedKnowledgeBasesAsync(resourceReferences["knowledgeBases"], usedNames["knowledgeBases"]);
        await DeleteOrphanedToolsAsync(resourceReferences["tools"], usedNames["tools"], flowVersion.Id);
        await DeleteOrphanedSkillsAsync(resourceReferences["skills"], usedNames["skills"]);
        await DeleteOrphanedKeyStoresAsync(resourceReferences["keyStores"], usedNames["keyStores"]);
        await DeleteOrphanedTriggersAsync(linkedTriggerIds, flowVersion.Id);
    }

    // Parses the flow version's resource reference JSON into name lists keyed by resource
    // type. Missing or malformed JSON yields empty lists.
    private static Dictionary<string, List<string>> ParseResourceReferences(string? resourceReferences)
    {
        var references = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase)
        {
            ["credentials"] = new(),
            ["queues"] = new(),
            ["knowledgeBases"] = new(),
            ["tools"] = new(),
            ["skills"] = new(),
            ["keyStores"] = new(),
        };

        if (string.IsNullOrWhiteSpace(resourceReferences))
            return references;

        try
        {
            var parsed = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, List<string>>>(resourceReferences);
            if (parsed == null)
                return references;

            foreach (var kvp in parsed)
            {
                var key = kvp.Key?.ToLowerInvariant();
                if (key != null && references.ContainsKey(key))
                    references[key] = kvp.Value ?? new List<string>();
            }
        }
        catch (System.Text.Json.JsonException)
        {
            // Ignore malformed reference JSON; nothing can be resolved from it.
        }

        return references;
    }

    // Builds the set of resource names still referenced by other non-archived agents.
    private async Task<Dictionary<string, HashSet<string>>> GetResourceNamesUsedByOtherAgentsAsync(Guid excludedFlowVersionId)
    {
        var usedNames = new Dictionary<string, HashSet<string>>(StringComparer.OrdinalIgnoreCase)
        {
            ["credentials"] = new(StringComparer.OrdinalIgnoreCase),
            ["queues"] = new(StringComparer.OrdinalIgnoreCase),
            ["knowledgeBases"] = new(StringComparer.OrdinalIgnoreCase),
            ["tools"] = new(StringComparer.OrdinalIgnoreCase),
            ["skills"] = new(StringComparer.OrdinalIgnoreCase),
            ["keyStores"] = new(StringComparer.OrdinalIgnoreCase),
        };

        // Only active agents keep a resource alive; archived agents no longer use it.
        var otherAgentReferences = await _unitOfWork.FlowVersionRepo
            .GetByConditionAsync(w => w.Id != excludedFlowVersionId && !w.IsArchived)
            .Select(w => w.ResourceReferences)
            .ToListAsync();

        foreach (var referenceJson in otherAgentReferences)
        {
            var references = ParseResourceReferences(referenceJson);
            foreach (var kvp in references)
            {
                if (!usedNames.TryGetValue(kvp.Key, out var names))
                    continue;

                foreach (var name in DistinctNames(kvp.Value))
                    names.Add(name);
            }
        }

        return usedNames;
    }

    // Deletes credentials referenced only by the archived agent when they are not shared
    // and not referenced by any other entity.
    private async Task DeleteOrphanedCredentialsAsync(List<string> names, HashSet<string> usedNames, Guid flowVersionId)
    {
        foreach (var name in DistinctNames(names))
        {
            if (usedNames.Contains(name))
                continue;

            var credential = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Name.ToLower() == name.ToLower() && w.EnvType == ConfigureEnvironmentType.Prod)
                .FirstOrDefaultAsync();
            if (credential == null || credential.IsTenantWideAccess)
                continue;

            if (await IsCredentialReferencedElsewhereAsync(credential, name, flowVersionId))
                continue;

            // Owned key-value pairs go with the credential.
            await DeleteLinksAsync(_unitOfWork.EncryptedKeyValueRepo, kv => kv.AppSecretId == credential.Id);
            await _resourceShareService.DeleteResourceSharesAsync(credential.Id, ResourceTypeEnum.AppSecret);
            _unitOfWork.AppSecretRepo.Delete(credential);
        }
    }

    // Checks whether a credential is still referenced by a knowledge base, queue or tool.
    private async Task<bool> IsCredentialReferencedElsewhereAsync(AppSecret credential, string name, Guid flowVersionId)
    {
        var normalizedName = name.ToLower();

        // Knowledge bases may embed or store through this credential.
        var usedByKnowledgeBase = await _unitOfWork.KnowledgeBaseRepo
            .GetByConditionAsync(w => w.EmbeddingCredentialId == credential.Id || w.StoreCredentialId == credential.Id)
            .AnyAsync();
        if (usedByKnowledgeBase)
            return true;

        // Queues and tools persist the credential by name.
        var usedByQueue = await _unitOfWork.QueueRepo
            .GetByConditionAsync(w => w.CredentialName != null && w.CredentialName.ToLower() == normalizedName)
            .AnyAsync();
        if (usedByQueue)
            return true;

        var usedByTool = await _unitOfWork.ToolRepo
            .GetByConditionAsync(w => w.CredentialName != null && w.CredentialName.ToLower() == normalizedName)
            .AnyAsync();
        if (usedByTool)
            return true;

        // Tool links belonging to another active agent (the archived agent's links are already staged for removal).
        return await _unitOfWork.FlowVersionToolRepo
            .GetByConditionAsync(w => w.CredentialName != null &&
                                      w.CredentialName.ToLower() == normalizedName &&
                                      w.FlowVersionId != flowVersionId)
            .AnyAsync();
    }

    // Deletes queues referenced only by the archived agent when they are not shared and
    // have no work items, user assignments or inbound routing.
    private async Task DeleteOrphanedQueuesAsync(List<string> names, HashSet<string> usedNames, Guid flowVersionId)
    {
        foreach (var name in DistinctNames(names))
        {
            if (usedNames.Contains(name))
                continue;

            var queue = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w => w.Name.ToLower() == name.ToLower() && w.EnvType == ConfigureEnvironmentType.Prod)
                .FirstOrDefaultAsync();
            if (queue == null || queue.IsTenantWideAccess)
                continue;

            // Still assigned to another active agent?
            var assignedToOtherAgent = await _unitOfWork.QueueFlowVersionRepo
                .GetByConditionAsync(w => w.QueueId == queue.Id && w.FlowVersionId != flowVersionId)
                .AnyAsync();
            if (assignedToOtherAgent)
                continue;

            // Other relationships: work items, user assignments or inbound routing.
            var hasTransactions = await _unitOfWork.QueueTransactionRepo
                .GetByConditionAsync(w => w.QueueId == queue.Id)
                .AnyAsync();
            if (hasTransactions)
                continue;

            var hasUsers = await _unitOfWork.QueueUserRepo
                .GetByConditionAsync(w => w.QueueId == queue.Id)
                .AnyAsync();
            if (hasUsers)
                continue;

            if (await IsQueueRoutedToByOtherQueueAsync(queue))
                continue;

            await _resourceShareService.DeleteResourceSharesAsync(queue.Id, ResourceTypeEnum.Queue);
            _unitOfWork.QueueRepo.Delete(queue);
        }
    }

    // Checks whether another queue routes work items into the supplied queue.
    private async Task<bool> IsQueueRoutedToByOtherQueueAsync(Queue queue)
    {
        // RouteToQueues is a name array; load the arrays and compare in memory.
        var routeLists = await _unitOfWork.QueueRepo
            .GetByConditionAsync(w => w.Id != queue.Id && w.RouteToQueues != null)
            .Select(w => w.RouteToQueues)
            .ToListAsync();

        return routeLists.Any(routes =>
            routes != null && routes.Any(r => string.Equals(r, queue.Name, StringComparison.OrdinalIgnoreCase)));
    }

    // Deletes knowledge bases referenced only by the archived agent when they are not shared.
    // Owned files and vector store entries go with them.
    private async Task DeleteOrphanedKnowledgeBasesAsync(List<string> names, HashSet<string> usedNames)
    {
        foreach (var name in DistinctNames(names))
        {
            if (usedNames.Contains(name))
                continue;

            var knowledgeBase = await _unitOfWork.KnowledgeBaseRepo
                .GetByConditionAsync(w => w.Name.ToLower() == name.ToLower() && w.EnvType == ConfigureEnvironmentType.Prod)
                .FirstOrDefaultAsync();
            if (knowledgeBase == null || knowledgeBase.IsTenantWideAccess)
                continue;

            // Owned vector store entries and files go with the knowledge base.
            var vectorStores = await _unitOfWork.VectorStoreRepo
                .GetByConditionAsync(vs => vs.TenantId == knowledgeBase.TenantId && vs.Metadata != null)
                .ToListAsync();
            foreach (var vectorStore in vectorStores.Where(vs => IsVectorStoreForKnowledgeBase(vs, knowledgeBase.Name)))
                _unitOfWork.VectorStoreRepo.Delete(vectorStore);

            await DeleteLinksAsync(_unitOfWork.KnowledgeBaseFileRepo, f => f.KnowledgeBaseId == knowledgeBase.Id);
            await _resourceShareService.DeleteResourceSharesAsync(knowledgeBase.Id, ResourceTypeEnum.KnowledgeBase);
            _unitOfWork.KnowledgeBaseRepo.Delete(knowledgeBase);
        }
    }

    // Matches a vector store record to a knowledge base by its metadata kb_name.
    private static bool IsVectorStoreForKnowledgeBase(VectorStore vectorStore, string knowledgeBaseName)
    {
        if (vectorStore.Metadata == null || vectorStore.Metadata.RootElement.ValueKind != JsonValueKind.Object)
            return false;

        if (!vectorStore.Metadata.RootElement.TryGetProperty("kb_name", out var kbNameElement))
            return false;

        var metadataKbName = kbNameElement.GetString();
        return !string.IsNullOrWhiteSpace(metadataKbName)
            && !string.IsNullOrWhiteSpace(knowledgeBaseName)
            && string.Equals(metadataKbName, knowledgeBaseName, StringComparison.OrdinalIgnoreCase);
    }

    // Deletes tools referenced only by the archived agent when they are not shared, not
    // platform-managed and not linked to another active agent.
    private async Task DeleteOrphanedToolsAsync(List<string> names, HashSet<string> usedNames, Guid flowVersionId)
    {
        foreach (var name in DistinctNames(names))
        {
            if (usedNames.Contains(name))
                continue;

            var tool = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w => w.Name.ToLower() == name.ToLower() && w.EnvType == ConfigureEnvironmentType.Prod)
                .FirstOrDefaultAsync();
            if (tool == null || tool.IsTenantWideAccess || tool.Type == ComponentTypeEnum.Platform)
                continue;

            // Still linked to another active agent?
            var linkedToOtherAgent = await _unitOfWork.FlowVersionToolRepo
                .GetByConditionAsync(w => w.ToolId == tool.Id && w.FlowVersionId != flowVersionId)
                .AnyAsync();
            if (linkedToOtherAgent)
                continue;

            await _resourceShareService.DeleteResourceSharesAsync(tool.Id, ResourceTypeEnum.Tool);
            _unitOfWork.ToolRepo.Delete(tool);
        }
    }

    // Deletes skills referenced only by the archived agent when they are not shared and not
    // platform/global. Owned files go with them.
    private async Task DeleteOrphanedSkillsAsync(List<string> names, HashSet<string> usedNames)
    {
        foreach (var name in DistinctNames(names))
        {
            if (usedNames.Contains(name))
                continue;

            var skill = await _unitOfWork.SkillRepo
                .GetByConditionAsync(w => w.Name.ToLower() == name.ToLower() && w.EnvType == ConfigureEnvironmentType.Prod)
                .FirstOrDefaultAsync();
            if (skill == null || skill.IsTenantWideAccess || skill.IsGlobal || skill.Type == ComponentTypeEnum.Platform)
                continue;

            // Owned files go with the skill.
            await DeleteLinksAsync(_unitOfWork.SkillFileRepo, f => f.SkillId == skill.Id);
            await _resourceShareService.DeleteResourceSharesAsync(skill.Id, ResourceTypeEnum.Skill);
            _unitOfWork.SkillRepo.Delete(skill);
        }
    }

    // Deletes key stores referenced only by the archived agent when they are not shared.
    private async Task DeleteOrphanedKeyStoresAsync(List<string> names, HashSet<string> usedNames)
    {
        foreach (var name in DistinctNames(names))
        {
            if (usedNames.Contains(name))
                continue;

            var keyStore = await _unitOfWork.KeyStoreRepo
                .GetByConditionAsync(w => w.Name.ToLower() == name.ToLower() && w.EnvType == ConfigureEnvironmentType.Prod)
                .FirstOrDefaultAsync();
            if (keyStore == null || keyStore.IsTenantWideAccess)
                continue;

            await _resourceShareService.DeleteResourceSharesAsync(keyStore.Id, ResourceTypeEnum.KeyStore);
            _unitOfWork.KeyStoreRepo.Delete(keyStore);
        }
    }

    // Deletes triggers linked to the archived agent when they are not shared and no longer
    // linked to another active agent.
    private async Task DeleteOrphanedTriggersAsync(List<Guid> triggerIds, Guid flowVersionId)
    {
        foreach (var triggerId in triggerIds.Distinct())
        {
            var trigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.Id == triggerId && w.EnvType == ConfigureEnvironmentType.Prod)
                .FirstOrDefaultAsync();
            if (trigger == null || trigger.IsTenantWideAccess)
                continue;

            // Still linked to another active agent?
            var linkedToOtherAgent = await _unitOfWork.TriggerFlowVersionRepo
                .GetByConditionAsync(w => w.TriggerId == triggerId && w.FlowVersionId != flowVersionId)
                .AnyAsync();
            if (linkedToOtherAgent)
                continue;

            await _resourceShareService.DeleteResourceSharesAsync(trigger.Id, ResourceTypeEnum.Trigger);
            _unitOfWork.TriggerRepo.Delete(trigger);
        }
    }

    // Resolves distinct, trimmed, non-empty reference names.
    private static IEnumerable<string> DistinctNames(IEnumerable<string> names)
    {
        return names
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .Select(name => name.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase);
    }
}