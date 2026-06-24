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
                    !w.IsArchived
                )
                .Include(i => i.Flow)
                .Include(i => i.MachineFlows)
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
                    .Include(i => i.MachineFlows)
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
                    .Include(i => i.MachineFlows)
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

            // Map the updated fields from the DTO to the entity
            existingVersion.IsArchived = agentTableDto.IsArchived;
            existingVersion.IsDisabled = agentTableDto.IsDisabled;
            existingVersion.LastModifiedByUserId = _userId;
            // You can update more fields here as needed.

            // Update and save changes
            _unitOfWork.FlowVersionRepo.Update(existingVersion);
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating existing flow version");
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
                .Include(i => i.MachineFlows)
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
                .Include(i => i.MachineFlows)
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
                _logger.LogInformation("Duplicate machine IDs detected.");
                serviceResponse.Message = "Machine IDs cannot contain duplicates.";
                return serviceResponse;
            }

            // Check if the agent exists and belongs to the current user.
            var agent = await _unitOfWork.FlowVersionRepo
                        .GetByConditionAsync(w =>
                            w.Id == agentId
                        )
                        .Include(a => a.MachineFlows)
                        .FirstOrDefaultAsync();

            if (agent == null)
            {
                // If agent does not exist or does not belong to the current user, return failure.
                _logger.LogInformation("Agent not found.");
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
                _logger.LogInformation("Invalid machine IDs found: {InvalidMachineIds}", string.Join(", ", invalidMachineIds));
                serviceResponse.Message = $"The following machine IDs are invalid or do not belong to the user: {string.Join(", ", invalidMachineIds)}";
                return serviceResponse;
            }

            // Identify machines that are already assigned to the agent.
            var existingMachineFlows = agent?.MachineFlows?.ToList() ?? new List<MachineFlow>();
            var existingMachineIds = existingMachineFlows.Select(mf => mf.MachineId).ToList();

            // Identify new machine IDs that are not yet assigned to the agent.
            var newMachineIds = machineIds.Except(existingMachineIds).ToList();

            // Identify machine IDs that are no longer assigned and need to be removed.
            var removedMachineIds = existingMachineIds.Except(machineIds).ToList();

            // If no changes are made (no new machines, no machines to remove), inform the user.
            if (!newMachineIds.Any() && !removedMachineIds.Any())
            {
                _logger.LogInformation("No changes made; all provided machines are already assigned to the agent.");
                serviceResponse.Message = "No changes made to the machine assignments.";
                return serviceResponse;
            }

            // Create new MachineFlow entries for machines not already assigned.
            var machineFlowsToAdd = newMachineIds.Select(id => new MachineFlow()
            {
                MachineId = id,
                FlowVersionId = agentId,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId
            }).ToList();

            // Remove existing MachineFlow entries for machines that are no longer assigned.
            var machineFlowsToRemove = existingMachineFlows
                .Where(mf => removedMachineIds.Contains(mf.MachineId))
                .ToList();

            // Begin the transaction to insert and remove data.
            if (machineFlowsToAdd.Any())
            {
                await _unitOfWork.MachineFlowRepo.InsertAsync(machineFlowsToAdd);
            }

            if (machineFlowsToRemove.Any())
            {
                _unitOfWork.MachineFlowRepo.Delete(machineFlowsToRemove);
            }

            // Attempt to save the changes to the database.
            if (!await _unitOfWork.SaveAsync())
            {
                // If saving fails, log and return failure.
                _logger.LogInformation("Database save operation failed while assigning or updating machines.");
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
                _logger.LogInformation("Duplicate machine IDs detected.");
                serviceResponse.Message = "Machine IDs cannot contain duplicates.";
                return serviceResponse;
            }

            // Check if the agent exists and belongs to the current user.
            var agent = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w => w.Id == agentId)
                .Include(m => m.MachineFlows)
                .FirstOrDefaultAsync();

            if (agent == null)
            {
                // If agent does not exist or does not belong to the current user, return failure.
                _logger.LogInformation("Agent not found.");
                serviceResponse.Message = "The agent does not exist.";
                return serviceResponse;
            }

            // Check if machine flows exist for the provided machine IDs and are assigned to the agent.
            var machineFlows = await _unitOfWork.MachineFlowRepo
                .GetByConditionAsync(w => machineIds.Contains(w.MachineId) && w.FlowVersionId == agentId)
                .ToListAsync();

            var invalidMachineIds = machineIds.Except(machineFlows.Select(m => m.MachineId)).ToList();

            if (invalidMachineIds.Any())
            {
                // If there are invalid machine IDs, return failure.
                _logger.LogInformation("Invalid machine IDs found: {InvalidMachineIds}", string.Join(", ", invalidMachineIds));
                serviceResponse.Message = $"The following machine IDs are invalid or do not belong to the user: {string.Join(", ", invalidMachineIds)}";
                return serviceResponse;
            }

            // Identify machines to remove that are currently assigned to the agent.
            var machinesToRemove = machineIds.Intersect(agent.MachineFlows?.Select(mf => mf.MachineId) ?? Enumerable.Empty<Guid>()).ToList();

            if (!machinesToRemove.Any())
            {
                // If no machines are assigned, inform the user.
                _logger.LogInformation("None of the provided machines are currently assigned to this agent.");
                serviceResponse.Message = "No matching machines are assigned to this agent.";
                return serviceResponse;
            }

            // Delete the selected machine flows.
            _unitOfWork.MachineFlowRepo.Delete(machineFlows);

            // Attempt to save changes to the database.
            if (!await _unitOfWork.SaveAsync())
            {
                // If saving fails, log and return failure.
                _logger.LogInformation("Database save operation failed while removing machines.");
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
                .Include(a => a.MachineFlows)
                .FirstOrDefaultAsync();

            if (agent == null)
            {
                // If agent does not exist or does not belong to the current user, return failure.
                _logger.LogInformation("Agent with ID {AgentId} not found for user {UserId}.", agentId, _userId);
                serviceResponse.Message = "The agent does not exist.";
                return serviceResponse;
            }

            // Retrieve the list of all machine flows.
            var machines = await _unitOfWork.MachineFlowRepo
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
                machine.Status = clientDataStore != null ? clientDataStore.Status : MachineStatusTypeEnum.Offline;
                machine.JobId = (clientDataStore?.Status == MachineStatusTypeEnum.Running) ? clientDataStore.JobId : null;
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
            // Query the repository for published flow versions where the flow name contains the search key (case-insensitive)
            var publishedFlowVersions = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    w.IsPublished &&
                    !w.IsArchived &&
                    !w.IsDisabled &&
                    w.Flow.Type != FlowTypesEnum.Block &&
                    w.Flow.Name.ToLower().Contains(searchKey.ToLower())
                )
                .Include(i => i.Flow)
                .Include(i => i.MachineFlows)
                .Include(i => i.CreatedByUser)
                .OrderBy(o => o.VersionNumber)
                .AsNoTracking()
                .ToListAsync();

            // Map the result to DTOs and update the service response to indicate success
            serviceResponse.Data = publishedFlowVersions.Adapt<IEnumerable<AgentTableDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Published agents retrieved successfully.";
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
                _logger.LogInformation("Context SaveChanges failed while disabling flow versions.");
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

}