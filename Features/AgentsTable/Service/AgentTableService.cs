namespace WorkspaceAPIs.Services;

public class AgentTableService : IAgentTableService
{
    private readonly ILogger<AgentTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public AgentTableService(
        ILogger<AgentTableService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Extract the user ID from the HTTP context and assign it to _userId.
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves a list of published flow versions for a specific flow by its identifier.
    public async Task<ServiceResponse<IEnumerable<AgentTableDto>>> GetPublishFlowVersionsAsync(Guid flowId)
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
                .GetByConditionAsync(v => v.FlowId == flowId && v.IsPublished)
                .Include(c => c.CreatedByUser)
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

    // Retrieves a list of archived flow versions for a specific flow by its identifier.
    public async Task<ServiceResponse<IEnumerable<AgentTableDto>>> GetArchiveFlowVersionsAsync(Guid flowId)
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
                .GetByConditionAsync(v => v.FlowId == flowId && v.IsArchived)
                .Include(f => f.Flow)
                .Include(c => c.CreatedByUser)
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
    public async Task<ServiceResponse<IEnumerable<AgentTableDto>>> GetExecuteFlowVersionsAsync(Guid flowId)
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
                .GetByConditionAsync(v => v.FlowId == flowId && v.IsDraft)
                .Include(f => f.Flow)
                .Include(c => c.CreatedByUser)
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
                .GetByConditionAsync(w => w.Id == agentId && w.CreatedByUserId == _userId)
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
                .GetByConditionAsync(w => machineIds.Contains(w.Id) && w.CreatedByUserId == _userId)
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
            var alreadyAssignedMachineIds = agent?.MachineFlows?.Select(mf => mf.MachineId).ToList() ?? new List<Guid>();
            var newMachineIds = machineIds.Except(alreadyAssignedMachineIds).ToList();

            // If all machines are already assigned, inform the user.
            if (!newMachineIds.Any())
            {
                _logger.LogInformation("All provided machines are already assigned to the agent.");
            }

            // Prepare new machine flows to be assigned.
            var machineFlows = newMachineIds.Select(id => new MachineFlow()
            {
                MachineId = id,
                FlowVersionId = agentId,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId
            }).ToList();

            // Insert new machine flows into the repository.
            await _unitOfWork.MachineFlowRepo.InsertAsync(machineFlows);

            // Attempt to save the changes to the database.
            if (!await _unitOfWork.SaveAsync())
            {
                // If saving fails, log and return failure.
                _logger.LogInformation("Database save operation failed while assigning machines.");
                serviceResponse.Message = "Failed to assign machines to the agent.";
                return serviceResponse;
            }

            // Return success with the count of newly assigned machines.
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{newMachineIds.Count} machines successfully assigned to the agent.";
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
                .GetByConditionAsync(w => w.Id == agentId && w.CreatedByUserId == _userId)
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
                .GetByConditionAsync(w => machineIds.Contains(w.MachineId) && w.FlowVersionId == agentId && w.CreatedByUserId == _userId)
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
            var machinesToRemove = machineIds.Intersect(agent.MachineFlows?.Select(mf => mf.MachineId)).ToList();

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
                .GetByConditionAsync(w => w.Id == agentId && w.CreatedByUserId == _userId)
                .Include(a => a.MachineFlows)
                .FirstOrDefaultAsync();

            if (agent == null)
            {
                // If agent does not exist or does not belong to the current user, return failure.
                _logger.LogInformation("Agent with ID {AgentId} not found for user {UserId}.", agentId, _userId);
                serviceResponse.Message = "The agent does not exist.";
                return serviceResponse;
            }

            // Retrieve the list of all machines for the current user.
            var machines = await _unitOfWork.MachineRepo
                .GetByConditionAsync(w => w.CreatedByUserId == _userId)
                .Include(m => m.MachineFlows)
                .ProjectToType<AssignMachineDto>()
                .ToListAsync();

            // Check if each machine is already assigned to the agent.
            machines.ForEach(m =>
            {
                m.IsAssigned = (agent.MachineFlows ?? Enumerable.Empty<MachineFlow>()).Any(mf => mf.MachineId == m.Id);
                m.AgentId = agent.Id;
            });

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
}
