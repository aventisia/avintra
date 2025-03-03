namespace WorkspaceAPIs.Services;

public class FlowVersionService : IFlowVersionService
{
    private readonly ILogger<FlowVersionService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public FlowVersionService(
        ILogger<FlowVersionService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Get a list of flow versions of a single flow using flow identifier
    public async Task<ServiceResponse<IEnumerable<FlowVersionDto>>> GetFlowVersionsAsync(Guid flowId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<FlowVersionDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get flow versions
            var flowVersions = await _unitOfWork.FlowVersionRepo
            .GetByConditionAsync(v => v.FlowId == flowId).Include(c => c.CreatedByUser)
            .OrderBy(o => o.VersionNumber).ToListAsync();

            // Task successful
            serviceResponse.Data = flowVersions.Adapt<IEnumerable<FlowVersionDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Versions retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Creates a flow version
    public async Task<ServiceResponse<FlowVersionDto>> InsertFlowVersionAsync(FlowVersionDto flowVersionDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<FlowVersionDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Get count of versions of a related flow
            var versionCount = await _unitOfWork.FlowVersionRepo.GetFlowVersionCountAsync(flowVersionDto.FlowId);

            // Default mapping
            var newFlowVersion = flowVersionDto.Adapt<FlowVersion>();
            newFlowVersion.IsLocked = false;
            newFlowVersion.IsDraft = false;
            newFlowVersion.CreatedByUserId = _userId;
            newFlowVersion.LastModifiedByUserId = _userId;
            newFlowVersion.VersionNumber = versionCount + 1;

            // Add initial nodes and edges
            newFlowVersion.ReactFlowObject = Features.FlowVersion.Utils.InitialNodesAndEdgesUtil.GetInitialNodesAndEdges();


            //Insert a flow version
            await _unitOfWork.FlowVersionRepo.InsertAsync(newFlowVersion);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new flow version");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newFlowVersion.Adapt<FlowVersionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Version added successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            Console.WriteLine(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Updates a flow version
    public async Task<ServiceResponse<FlowVersionDto>> UpdateFlowVersionAsync(FlowVersionDto flowVersionDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<FlowVersionDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Validate flow version existence
            var flowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(v => v.Id == flowVersionDto.Id)
                .SingleOrDefaultAsync();

            // Flow version does not exist
            if (flowVersion == null)
            {
                _logger.LogInformation($"Flow version does not exist");
                serviceResponse.Message = "Version does not exist";
                return serviceResponse;
            }

            //Get count of versions of a related flow
            var versionCount = await _unitOfWork.FlowVersionRepo.GetFlowVersionCountAsync(flowVersion.FlowId);

            // Auto mapping 
            var updatedFlowVersion = flowVersionDto.Adapt<FlowVersion>();
            updatedFlowVersion.IsLocked = false;
            updatedFlowVersion.IsDraft = false;
            updatedFlowVersion.CreatedByUserId = _userId;
            updatedFlowVersion.LastModifiedByUserId = _userId;
            updatedFlowVersion.VersionNumber = versionCount + 1;
            //create a new flow version
            await _unitOfWork.FlowVersionRepo.InsertAsync(updatedFlowVersion);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating flow version");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = updatedFlowVersion.Adapt<FlowVersionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "New version created successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Deletes a flow version
    public async Task<ServiceResponse<bool>> DeleteFlowVersionAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400
        };

        try
        {
            //Try to get version using identifier
            var flowVersion = await _unitOfWork.FlowVersionRepo
            .GetByConditionAsync(v => v.Id == id)
            .SingleOrDefaultAsync();

            //Check if version not exists
            if (flowVersion == null)
            {
                _logger.LogInformation($"Flow version does not exist");
                serviceResponse.Message = "Version does not exist";
                return serviceResponse;
            }

            //Delete version
            _unitOfWork.FlowVersionRepo.Delete(flowVersion);

            //Delete-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting flow version");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Version deleted successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Assigns multiple machines to an agent
    public async Task<ServiceResponse<bool>> AssignMachinesToAgentAsync(Guid agentId, IEnumerable<Guid> machineIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to assign machines. Please try again."
        };

        try
        {
            // Validate that machine IDs are unique (no duplicates)
            if (machineIds.Count() != machineIds.Distinct().Count())
            {
                _logger.LogInformation("Duplicate machine IDs detected.");
                serviceResponse.Message = "Machine IDs cannot contain duplicates.";
                return serviceResponse;
            }

            // Check if the agent exists and belongs to the current user
            var agent = await _unitOfWork.FlowVersionRepo
                                          .GetByConditionAsync(w =>
                                              w.Id == agentId &&
                                              //   w.IsPublished &&
                                              w.CreatedByUserId == _userId)
                                          .FirstOrDefaultAsync();

            // Return an error if the agent doesn't exist
            if (agent == null)
            {
                _logger.LogInformation("Agent not found.");
                serviceResponse.Message = "The agent does not exist.";
                return serviceResponse;
            }

            // Validate that all provided machine IDs are valid and belong to the current user
            var machines = await _unitOfWork.MachineRepo
                                            .GetByConditionAsync(w =>
                                                machineIds.Contains(w.Id) &&
                                                w.CreatedByUserId == _userId)
                                            .ToListAsync();

            // Identify and return a message for any invalid machine IDs
            var invalidMachineIds = machineIds.Except(machines.Select(m => m.Id)).ToList();
            if (invalidMachineIds.Any())
            {
                _logger.LogInformation("Invalid machine IDs found: {InvalidMachineIds}", string.Join(", ", invalidMachineIds));
                serviceResponse.Message = $"The following machine IDs are invalid or do not belong to the user: {string.Join(", ", invalidMachineIds)}";
                return serviceResponse;
            }

            // Check for machines that are already assigned to the agent
            var alreadyAssignedMachineIds = agent?.MachineFlows?.Select(mf => mf.MachineId).ToList() ?? new List<Guid>();
            var newMachineIds = machineIds.Except(alreadyAssignedMachineIds).ToList();

            // If all machines are already assigned, inform the user
            if (!newMachineIds.Any())
            {
                _logger.LogInformation("All provided machines are already assigned to the agent.");
            }

            // Assign the new machines to the agent
            var machineFlows = newMachineIds.Select(id => new MachineFlow()
            {
                MachineId = id,
                FlowVersionId = agentId,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId
            }).ToList();

            await _unitOfWork.MachineFlowRepo.InsertAsync(machineFlows);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Database save operation failed while assigning machines.");
                serviceResponse.Message = "Failed to assign machines to the agent.";
                return serviceResponse;
            }

            // Return a successful result with the count of newly assigned machines
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{newMachineIds.Count} machines successfully assigned to the agent.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while assigning machines.");
            return serviceResponse;
        }

        return serviceResponse;
    }
    // Removes multiple machines from an agent
    public async Task<ServiceResponse<bool>> RemoveMachinesFromAgentAsync(Guid agentId, IEnumerable<Guid> machineIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to remove machines. Please try again."
        };

        try
        {
            // Validate that machine IDs are unique (no duplicates)
            if (machineIds.Count() != machineIds.Distinct().Count())
            {
                _logger.LogInformation("Duplicate machine IDs detected.");
                serviceResponse.Message = "Machine IDs cannot contain duplicates.";
                return serviceResponse;
            }

            // Check if the agent exists and belongs to the current user
            var agent = await _unitOfWork.FlowVersionRepo
                                          .GetByConditionAsync(w =>
                                              w.Id == agentId &&
                                              //   w.IsPublished &&
                                              w.CreatedByUserId == _userId)
                                          .FirstOrDefaultAsync();

            // Return an error if the agent doesn't exist
            if (agent == null)
            {
                _logger.LogInformation("Agent not found.");
                serviceResponse.Message = "The agent does not exist.";
                return serviceResponse;
            }

            // Validate that all provided machine IDs are valid and belong to the current user
            var machines = await _unitOfWork.MachineRepo
                                            .GetByConditionAsync(w =>
                                                machineIds.Contains(w.Id) &&
                                                w.CreatedByUserId == _userId)
                                            .ToListAsync();

            // Identify and return a message for any invalid machine IDs
            var invalidMachineIds = machineIds.Except(machines.Select(m => m.Id)).ToList();
            if (invalidMachineIds.Any())
            {
                _logger.LogInformation("Invalid machine IDs found: {InvalidMachineIds}", string.Join(", ", invalidMachineIds));
                serviceResponse.Message = $"The following machine IDs are invalid or do not belong to the user: {string.Join(", ", invalidMachineIds)}";
                return serviceResponse;
            }

            // Get the list of machine IDs that are currently assigned to the agent
            var alreadyAssignedMachineIds = agent.MachineFlows?.Select(mf => mf.MachineId).ToList() ?? new List<Guid>();

            // Identify which machines are to be removed
            var machinesToRemove = machineIds.Intersect(alreadyAssignedMachineIds).ToList();

            // If no machines are assigned to the agent, return early
            if (!machinesToRemove.Any())
            {
                _logger.LogInformation("None of the provided machines are currently assigned to this agent.");
                serviceResponse.Message = "No matching machines are assigned to this agent.";
                return serviceResponse;
            }

            // Check if agent.MachineFlows is not null before processing
            var machineFlowsToRemove = agent.MachineFlows?.Where(mf => machinesToRemove.Contains(mf.MachineId)).ToList();

            // If machineFlowsToRemove is null or empty, we don't need to proceed with deletion
            if (machineFlowsToRemove != null && machineFlowsToRemove.Any())
            {
                // Remove the selected machine flows
                _unitOfWork.MachineFlowRepo.Delete(machineFlowsToRemove);

                // Attempt to save changes to the database
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogInformation("Database save operation failed while removing machines.");
                    serviceResponse.Message = "Failed to remove machines from the agent.";
                    return serviceResponse;
                }
            }
            else
            {
                _logger.LogInformation("No machine flows were found to remove.");
                serviceResponse.Message = "No machine flows were found to remove.";
                return serviceResponse;
            }

            // Return a successful result with the count of removed machines
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{machinesToRemove.Count} machines successfully removed from the agent.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while removing machines.");
        }

        return serviceResponse;
    }

    // Retrieve machines assigned to an agent
    public async Task<ServiceResponse<IEnumerable<AssignMachineDto>>> GetMachinesByAgentAsync(Guid agentId)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<AssignMachineDto>>
        {
            Data = null,
            Message = "Failed to retrieve machines. Please try again."
        };

        try
        {
            // Check if the agent exists and belongs to the current user
            var agent = await _unitOfWork.FlowVersionRepo
                                          .GetByConditionAsync(w =>
                                              w.Id == agentId &&
                                              w.CreatedByUserId == _userId)
                                          .Include(a => a.MachineFlows)
                                          .FirstOrDefaultAsync();

            // Return an error if the agent doesn't exist
            if (agent == null)
            {
                _logger.LogInformation("Agent with ID {AgentId} not found for user {UserId}.", agentId, _userId);
                serviceResponse.Message = "The agent does not exist.";
                return serviceResponse;
            }

            // Retrieve all machines for the current user
            var machines = await _unitOfWork.MachineRepo
                                            .GetByConditionAsync(w =>
                                                w.CreatedByUserId == _userId)
                                            .Include(m => m.MachineFlows)
                                            .ProjectToType<AssignMachineDto>()
                                            .ToListAsync();

            // Set IsAssigned to true if the machine is already assigned to the agent
            machines.ForEach(m =>
            {
                m.IsAssigned = (agent.MachineFlows ?? Enumerable.Empty<MachineFlow>()).Any(mf => mf.MachineId == m.Id);
                m.AgentId = agent.Id;
            });

            // Return the machines along with their assignment status
            serviceResponse.Data = machines;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machines retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while retrieving machines for agent {AgentId}.", agentId);
        }

        return serviceResponse;
    }

    // Retrieve agent select-option
    public async Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetAgentToSelectOptionAsync()
    {
        // Initialize serviceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOptionDto>>
        {
            Data = null,
            Message = "Failed to retrieve agents, please try again."
        };

        try
        {
            // Retrieve the agents and map them to SelectOptionDto
            var agentsToSelect = await _unitOfWork.FlowVersionRepo.GetAllAsync()
                .Include(a => a.Flow)
                .ProjectToType<SelectOptionDto>()
                .AsNoTracking()
                .ToListAsync();

            // Set the serviceResponse
            serviceResponse.Data = agentsToSelect;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Agents retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving the agent list.");
        }

        return serviceResponse;
    }
}