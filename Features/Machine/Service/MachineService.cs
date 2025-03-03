namespace WorkspaceAPIs.Services;

public class MachineService : IMachineService
{
    private readonly ILogger<MachineService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public MachineService(
        ILogger<MachineService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Checks the availability of a machine name.
    public async Task<ServiceResponse<TrueFalseResultDto>> IsMachineNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check machine name availability. Please try again"
        };

        try
        {
            // Validate machine name uniqueness
            var machineAlreadyExists = await _unitOfWork.MachineRepo
                                                     .GetByConditionAsync(w =>
                                                        w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower())
                                                     .FirstOrDefaultAsync();

            // Machine already exists
            if (machineAlreadyExists != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "A machine with same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machine name is available";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Insert new machine
    public async Task<ServiceResponse<MachineDto>> CreateNewMachineAsync(MachineDto machineDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<MachineDto>
        {
            Data = null,
            Message = "Failed to insert machine. Please try again"
        };

        try
        {

            // Validate machine name uniqueness
            var machineAlreadyExists = await _unitOfWork.MachineRepo
                                                    .GetByConditionAsync(w =>
                                                        w.Name.ToLower() == machineDto.Name.ToLower()
                                                    )
                                                    .FirstOrDefaultAsync();

            // Machine already exists
            if (machineAlreadyExists != null)
            {
                _logger.LogInformation($"Machine already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A machine with same name already exists. Please enter a unique name";
                return serviceResponse;
            }
            // Trim dto' string props
            machineDto = TrimDtoStringPropsUtil.TrimDtoStringProps(machineDto);

            // Default mapping
            var newMachine = machineDto.Adapt<Machine>();
            newMachine.CreatedByUserId = _userId;
            newMachine.LastModifiedByUserId = _userId;

            // Insert machine
            await _unitOfWork.MachineRepo.InsertAsync(newMachine);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new machine");
                return serviceResponse;
            }
            // Task successful
            serviceResponse.Data = newMachine.Adapt<MachineDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machine created successfully";
            _logger.LogInformation("Machine created successfully with id {Id}", newMachine.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Remove an machine by its ID
    public async Task<ServiceResponse<bool>> DeleteMachineAsync(Guid machineId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete machine. Please try again"
        };

        try
        {
            // Try to get machine
            var machine = await _unitOfWork.MachineRepo
                                            .GetByConditionAsync(m => m.Id == machineId)
                                            .Include(a => a.MachineFlows)
                                            .FirstOrDefaultAsync();

            // Machine does not exist
            if (machine == null)
            {
                _logger.LogInformation($"Machine does not exist");
                serviceResponse.Message = "Machine does not exist";
                return serviceResponse;
            }

            // Delete machine
            _unitOfWork.MachineRepo.Delete(machine);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting machine");
                return serviceResponse;
            }


            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machine deleted successfully";

            _logger.LogInformation("Machine deleted successfully of Id {Id}", machineId);

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieve all machines associated with current user
    public async Task<ServiceResponse<IEnumerable<MachineDto>>> GetMachineListAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<MachineDto>>
        {
            Data = null,
            Message = "Failed to retrieve machines, Please try again."
        };

        try
        {
            // Try to get machines
            var machines = await _unitOfWork.MachineRepo
                                            .GetByConditionAsync(m => m.CreatedByUserId == _userId)
                                            .OrderByDescending(o => o.CreatedOn)
                                            .Include(a => a.CreatedByUser)
                                            .Include(a => a.LastModifiedByUser)
                                            .Include(a => a.MachineFlows)
                                            .AsNoTracking()
                                            .ToListAsync();

            // Task successful
            serviceResponse.Data = machines.Adapt<IEnumerable<MachineDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machines retrieved successfully";
            _logger.LogInformation("Machines retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieve an machine by its ID
    public async Task<ServiceResponse<MachineDto>> GetMachineAsync(Guid machineId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<MachineDto>
        {
            Data = null,
            Message = "Failed to retrieve machine, Please try again"
        };

        try
        {
            // Try to get machine
            var machine = await _unitOfWork.MachineRepo
                                            .GetByConditionAsync(m =>
                                                m.Id == machineId && m.CreatedByUserId == _userId
                                            )
                                            .Include(a => a.CreatedByUser)
                                            .Include(a => a.LastModifiedByUser)
                                            .Include(a => a.MachineFlows)
                                            .AsNoTracking()
                                            .FirstOrDefaultAsync();

            if (machine == null)
            {
                serviceResponse.Message = "Machine does not exist";
                _logger.LogInformation("There is no machine with Id {Id}", machineId);
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = machine.Adapt<MachineDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machine retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Update an existence machine
    public async Task<ServiceResponse<MachineDto>> UpdateMachineAsync(MachineDto machineDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<MachineDto>
        {
            Data = null,
            Message = "Failed to update machine. Please try again"
        };

        try
        {
            // Validate machine existence
            var machine = await _unitOfWork.MachineRepo
                .GetByConditionAsync(m =>
                    m.Id == machineDto.Id && m.CreatedByUserId == _userId
                )
                .FirstOrDefaultAsync();

            // Machine does not exist
            if (machine == null)
            {
                _logger.LogInformation($"Machine does not exist");
                serviceResponse.Message = "Machine does not exist";
                return serviceResponse;
            }

            // Validate machine name uniqueness
            var machineAlreadyExists = await _unitOfWork.MachineRepo
                            .GetByConditionAsync(m =>
                                m.Name.ToLower() == machineDto.Name.ToLower() &&
                                m.Id != machineDto.Id
                            )
                            .FirstOrDefaultAsync();

            // Machine already exists
            if (machineAlreadyExists != null)
            {
                _logger.LogInformation($"Machine name already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A machine with same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Trim dto' string props
            machineDto = TrimDtoStringPropsUtil.TrimDtoStringProps(machineDto);

            // Default mapping 
            machineDto.Adapt(machine);
            machine.LastModifiedByUserId = _userId;
            machine.LastModifiedOn = DateTimeOffset.UtcNow;

            // Update machine
            _unitOfWork.MachineRepo.Update(machine);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating machine");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = machine.Adapt<MachineDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machine updated successfully.";
            _logger.LogInformation("Machine updated successfully with Id {Id}", machineDto.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes multiple machines by their IDs.
    public async Task<ServiceResponse<bool>> DeleteMachinesAsync(IEnumerable<Guid> machineIds)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete machines. Please try again"
        };

        try
        {
            // Validate machines existence
            var machines = await _unitOfWork.MachineRepo
                                            .GetByConditionAsync(w =>
                                                w.CreatedByUserId == _userId &&
                                                machineIds.Contains(w.Id))
                                            .Include(a => a.MachineFlows)
                                            .ToListAsync();

            // Machines do not exist
            if (machines.Count == 0)
            {
                _logger.LogInformation($"Machines do not exist");
                serviceResponse.Message = "Machines do not exist";
                return serviceResponse;
            }

            // TODO: Check machine relationship with other entities

            // Delete machines
            _unitOfWork.MachineRepo.Delete(machines);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting machines");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{machines.Count} machines deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Assigns multiple agents to a machine
    public async Task<ServiceResponse<bool>> AssignAgentsToMachineAsync(Guid machineId, IEnumerable<Guid> agentIds)
    {
        // Initialize the response with a failed result
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to assign agents. Please try again."
        };

        try
        {
            // Validate that agent IDs are unique (no duplicates)
            if (agentIds.Count() != agentIds.Distinct().Count())
            {
                _logger.LogInformation("Duplicate agent IDs detected.");
                serviceResponse.Message = "Agent IDs cannot contain duplicates.";
                return serviceResponse;
            }

            // Check if the machine exists and belongs to the current user
            var machine = await _unitOfWork.MachineRepo
                                            .GetByConditionAsync(w =>
                                                w.Id == machineId &&
                                                w.CreatedByUserId == _userId)
                                            .Include(a => a.MachineFlows)
                                            .FirstOrDefaultAsync();

            // Return an error if the machine doesn't exist
            if (machine == null)
            {
                _logger.LogInformation("Machine not found.");
                serviceResponse.Message = "The machine does not exist.";
                return serviceResponse;
            }

            // Validate that all provided agent IDs are valid and belong to the current user
            var agents = await _unitOfWork.FlowVersionRepo
                                          .GetByConditionAsync(w =>
                                              agentIds.Contains(w.Id) &&
                                              w.CreatedByUserId == _userId)
                                          .ToListAsync();

            // Identify and return a message for any invalid agent IDs
            var invalidAgentIds = agentIds.Except(agents.Select(a => a.Id)).ToList();
            if (invalidAgentIds.Any())
            {
                _logger.LogInformation("Invalid agent IDs found: {InvalidAgentIds}", string.Join(", ", invalidAgentIds));
                serviceResponse.Message = $"The following agent IDs are invalid or do not belong to the user: {string.Join(", ", invalidAgentIds)}";
                return serviceResponse;
            }

            // Check for agents that are already assigned to the machine
            var alreadyAssignedAgentIds = machine?.MachineFlows?.Select(mf => mf.FlowVersionId).ToList() ?? new List<Guid>();
            var newAgentIds = agentIds.Except(alreadyAssignedAgentIds).ToList();

            // If all agents are already assigned, inform the user
            if (!newAgentIds.Any())
            {
                _logger.LogInformation("All provided agents are already assigned to the machine.");
            }

            // Assign the new agents to the machine
            var machineFlows = newAgentIds.Select(i => new MachineFlow()
            {
                MachineId = machineId,
                FlowVersionId = i,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId
            }).ToList();

            await _unitOfWork.MachineFlowRepo.InsertAsync(machineFlows);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Database save operation failed while assigning agents.");
                serviceResponse.Message = "Failed to assign agents to the machine.";
                return serviceResponse;
            }

            // Return a successful result with the count of newly assigned agents
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{newAgentIds.Count} agents successfully assigned to the machine.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while assigning agents.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Removes multiple agents from a machine
    public async Task<ServiceResponse<bool>> RemoveAgentsFromMachineAsync(Guid machineId, IEnumerable<Guid> agentIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to remove agents. Please try again."
        };

        try
        {
            // Validate that agent IDs are unique (no duplicates)
            if (agentIds.Count() != agentIds.Distinct().Count())
            {
                _logger.LogInformation("Duplicate agent IDs detected.");
                serviceResponse.Message = "Agent IDs cannot contain duplicates.";
                return serviceResponse;
            }

            // Check if the machine exists and belongs to the current user
            var machine = await _unitOfWork.MachineRepo
                                            .GetByConditionAsync(w =>
                                                w.Id == machineId &&
                                                w.CreatedByUserId == _userId)
                                            .Include(a => a.MachineFlows)
                                            .FirstOrDefaultAsync();

            // Return an error if the machine doesn't exist
            if (machine == null)
            {
                _logger.LogInformation("Machine not found.");
                serviceResponse.Message = "The machine does not exist.";
                return serviceResponse;
            }

            // Validate that all provided agent IDs are valid and belong to the current user
            var agents = await _unitOfWork.FlowVersionRepo
                                          .GetByConditionAsync(w =>
                                              agentIds.Contains(w.Id) &&
                                              w.CreatedByUserId == _userId)
                                          .ToListAsync();

            // Identify and return a message for any invalid agent IDs
            var invalidAgentIds = agentIds.Except(agents.Select(a => a.Id)).ToList();
            if (invalidAgentIds.Any())
            {
                _logger.LogInformation("Invalid agent IDs found: {InvalidAgentIds}", string.Join(", ", invalidAgentIds));
                serviceResponse.Message = $"The following agent IDs are invalid or do not belong to the user: {string.Join(", ", invalidAgentIds)}";
                return serviceResponse;
            }

            // Get the list of agent IDs that are currently assigned to the machine
            var alreadyAssignedAgentIds = machine.MachineFlows?.Select(mf => mf.FlowVersionId).ToList() ?? new List<Guid>();

            // Identify which agents are to be removed
            var agentsToRemove = agentIds.Intersect(alreadyAssignedAgentIds).ToList();

            // If no agents are assigned to the machine, return early
            if (!agentsToRemove.Any())
            {
                _logger.LogInformation("None of the provided agents are currently assigned to this machine.");
                serviceResponse.Message = "No matching agents are assigned to this machine.";
                return serviceResponse;
            }

            // Check if machine.MachineFlows is not null before processing
            var machineFlowsToRemove = machine.MachineFlows?.Where(mf => agentsToRemove.Contains(mf.FlowVersionId)).ToList();

            // If machineFlowsToRemove is null or empty, we don't need to proceed with deletion
            if (machineFlowsToRemove != null && machineFlowsToRemove.Any())
            {
                // Remove the selected machine flows
                _unitOfWork.MachineFlowRepo.Delete(machineFlowsToRemove);

                // Attempt to save changes to the database
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogInformation("Database save operation failed while removing agents.");
                    serviceResponse.Message = "Failed to remove agents from the machine.";
                    return serviceResponse;
                }
            }
            else
            {
                _logger.LogInformation("No machine flows were found to remove.");
                serviceResponse.Message = "No machine flows were found to remove.";
                return serviceResponse;
            }

            // Return a successful result with the count of removed agents
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{agentsToRemove.Count} agents successfully removed from the machine.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while removing agents.");
        }

        return serviceResponse;
    }

    // Retrieve agent list
    public async Task<ServiceResponse<IEnumerable<AssignAgentDto>>> GetAgentsByMachineAsync(Guid machineId)
    {
        // Initialize the response with a failed result
        var serviceResponse = new ServiceResponse<IEnumerable<AssignAgentDto>>
        {
            Data = null,
            Message = "Failed to retrieve agents. Please try again."
        };

        try
        {
            // Check if the machine exists and belongs to the current user
            var machine = await _unitOfWork.MachineRepo
                                            .GetByConditionAsync(w =>
                                                w.Id == machineId &&
                                                w.CreatedByUserId == _userId)
                                            .Include(a => a.MachineFlows)
                                            .FirstOrDefaultAsync();

            // Return an error if the machine doesn't exist
            if (machine == null)
            {
                _logger.LogInformation("Machine with ID {MachineId} not found for user {UserId}.", machineId, _userId);
                serviceResponse.Message = "The machine does not exist.";
                return serviceResponse;
            }

            // Retrieve all agents for the current user
            var agents = await _unitOfWork.FlowVersionRepo
                                            .GetByConditionAsync(w =>
                                                w.CreatedByUserId == _userId)
                                            .Include(f => f.Flow)
                                            .ProjectToType<AssignAgentDto>()
                                            .ToListAsync();

            // Set IsAssigned to true if the agent is already assigned to the machine
            agents.ForEach(a =>
            {
                a.IsAssigned = (machine.MachineFlows ?? Enumerable.Empty<MachineFlow>()).Any(mf => mf.FlowVersionId == a.Id);
                a.MachineId = machine.Id;
            });

            // Return the agents along with their assignment status
            serviceResponse.Data = agents;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Agents retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while retrieving agents for machine {MachineId}.", machineId);
            serviceResponse.Message = "An error occurred while retrieving agents from the machine.";
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieve machine select-option
    public async Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetMachineToSelectOptionAsync()
    {
        // Initialize serviceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOptionDto>>
        {
            Data = null,
            Message = "Failed to retrieve machines, please try again."
        };

        try
        {
            // Retrieve the machines and map them to SelectOptionDto
            var machinesToSelect = await _unitOfWork.MachineRepo.GetAllAsync()
                .ProjectToType<SelectOptionDto>()
                .AsNoTracking()
                .ToListAsync();
                
            // Set the serviceResponse
            serviceResponse.Data = machinesToSelect;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machines retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving the machine list.");
        }

        return serviceResponse;
    }
}