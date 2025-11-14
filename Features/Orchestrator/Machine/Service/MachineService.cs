namespace WorkspaceAPIs.Services;

public class MachineService : IMachineService
{
    private readonly ILogger<MachineService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMachineHub _machineHub;
    private readonly Guid _userId;

    public MachineService(
        ILogger<MachineService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IMachineHub machineHub)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _machineHub = machineHub;
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

    // Insert new machine and assign agents
    public async Task<ServiceResponse<MachineDto>> CreateNewMachineAsync(MachineDto machineDto)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = new ServiceResponse<MachineDto>
        {
            Data = null,
            Message = "Failed to insert machine. Please try again"
        };

        try
        {
            // Validate machine name uniqueness
            var machineAlreadyExists = await _unitOfWork.MachineRepo
                .GetByConditionAsync(w => w.Name.ToLower() == machineDto.Name.ToLower())
                .FirstOrDefaultAsync();

            // Machine already exists
            if (machineAlreadyExists != null)
            {
                _logger.LogInformation("Machine already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A machine with the same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Trim dto's string properties
            machineDto = TrimDtoStringPropsUtil.TrimDtoStringProps(machineDto);

            // Default mapping
            var newMachine = machineDto.Adapt<Machine>();
            newMachine.CreatedByUserId = _userId;
            newMachine.LastModifiedByUserId = _userId;

            // Insert machine
            await _unitOfWork.MachineRepo.InsertAsync(newMachine);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new machine");
                return serviceResponse;
            }

            // Register the new machine with the machine hub
            // await _machineHub.RegisterMachineAsync(newMachine.Id);

            // If agent IDs are provided, proceed to assign them
            if (machineDto.AgentIds != null && machineDto.AgentIds.Any())
            {
                var agentIds = machineDto.AgentIds.Distinct().ToList();
                _logger.LogInformation("Assigning {Count} agents to new machine with ID: {MachineId}", agentIds.Count, newMachine.Id);

                // Create MachineFlow entries
                var machineFlows = machineDto.AgentIds.Select(agentId => new MachineFlow
                {
                    MachineId = newMachine.Id,
                    FlowVersionId = agentId,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId
                }).ToList();

                await _unitOfWork.MachineFlowRepo.InsertAsync(machineFlows);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save MachineFlow entries. Rolling back machine creation.");
                    return serviceResponse;
                }

                _logger.LogInformation("Assigned {Count} agents to machine ID: {MachineId}", machineFlows.Count, newMachine.Id);
            }

            newMachine = await _unitOfWork.MachineRepo
                            .GetByConditionAsync(m =>
                                m.Id == newMachine.Id
                            )
                            .Include(a => a.CreatedByUser)
                            .Include(a => a.LastModifiedByUser)
                            .Include(a => a.MachineFlows)
                                .ThenInclude(fv => fv.FlowVersion)
                                .ThenInclude(f => f.Flow)
                            .AsNoTracking()
                            .FirstOrDefaultAsync();


            // Task successful
            serviceResponse.Data = newMachine.Adapt<MachineDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machine created successfully";
            _logger.LogInformation("Machine created successfully with id {Id} and agents assigned", newMachine.Id);
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
                    .ThenInclude(fv => fv.FlowVersion)
                    .ThenInclude(f => f.Flow)
                .AsNoTracking()
                .ToListAsync();

            foreach (var machine in machines)
            {
                // Check if the machine exists in the MachineStore dictionary
                if (MachineStore.Machines.TryGetValue(machine.Id, out var storedMachine))
                {
                    machine.Status = storedMachine.Status;
                }
                else
                {
                    machine.Status = MachineStatusTypeEnum.Offline;
                }
            }


            // Task successful
            serviceResponse.Data = machines.Adapt<IEnumerable<MachineDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machines retrieved successfully";
            _logger.LogInformation("Machines retrieved successfully");
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
                    .ThenInclude(fv => fv.FlowVersion)
                    .ThenInclude(f => f.Flow)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            if (machine == null)
            {
                serviceResponse.Message = "Machine does not exist";
                _logger.LogInformation("There is no machine with Id {Id}", machineId);
                return serviceResponse;
            }

            // Check if the machine exists in the MachineStore dictionary
            if (MachineStore.Machines.TryGetValue(machine.Id, out var storedMachine))
            {
                machine.Status = storedMachine.Status;
            }
            else
            {
                machine.Status = MachineStatusTypeEnum.Offline;
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
        // Initialize ServiceResponse with a failed response
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
                .Include(a => a.MachineFlows)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            // Machine does not exist
            if (machine == null)
            {
                _logger.LogInformation("Machine does not exist");
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
                _logger.LogInformation("Machine name already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A machine with the same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Trim dto's string properties
            machineDto = TrimDtoStringPropsUtil.TrimDtoStringProps(machineDto);

            // Default mapping 
            machineDto.Adapt(machine);
            machine.LastModifiedByUserId = _userId;
            machine.LastModifiedOn = DateTimeOffset.UtcNow;

            // Update machine
            _unitOfWork.MachineRepo.Update(machine);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating machine");
                return serviceResponse;
            }

            // Register the new machine with the machine hub
            // await _machineHub.RegisterMachineAsync(machine.Id);

            // Handle agent assignments
            var existingMachineFlows = machine.MachineFlows.ToList();

            if (machineDto.AgentIds == null || !machineDto.AgentIds.Any())
            {
                // No agents provided => remove all existing flows
                if (existingMachineFlows.Any())
                {
                    _unitOfWork.MachineFlowRepo.Delete(existingMachineFlows);
                    if (!await _unitOfWork.SaveAsync())
                    {
                        _logger.LogError("Failed to remove agent assignments for machine ID {MachineId}", machine.Id);
                    }

                    _logger.LogInformation("Removed all agent assignments from machine ID {MachineId}", machine.Id);
                }
            }
            else
            {
                var requestedAgentIds = machineDto.AgentIds.Distinct().ToList();

                var existingAgentIds = existingMachineFlows.Select(mf => mf.FlowVersionId).ToList();
                var newAgentIds = requestedAgentIds.Except(existingAgentIds).ToList();
                var removedAgentIds = existingAgentIds.Except(requestedAgentIds).ToList();

                var machineFlowsToAdd = newAgentIds.Select(agentId => new MachineFlow
                {
                    MachineId = machine.Id,
                    FlowVersionId = agentId,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId
                }).ToList();

                var machineFlowsToRemove = existingMachineFlows
                    .Where(mf => removedAgentIds.Contains(mf.FlowVersionId))
                    .ToList();

                // Insert new assignments
                if (machineFlowsToAdd.Any())
                {
                    await _unitOfWork.MachineFlowRepo.InsertAsync(machineFlowsToAdd);

                    if (!await _unitOfWork.SaveAsync())
                    {
                        _logger.LogError("Failed to update agent assignments for machine ID {MachineId}", machine.Id);
                        return serviceResponse;
                    }
                }

                // Remove unassigned agents
                if (machineFlowsToRemove.Any())
                {
                    _unitOfWork.MachineFlowRepo.Delete(machineFlowsToRemove);

                    if (!await _unitOfWork.SaveAsync())
                    {
                        _logger.LogError("Failed to update agent assignments for machine ID {MachineId}", machine.Id);
                        return serviceResponse;
                    }
                }

                _logger.LogInformation("Updated agent assignments for machine ID {MachineId}: {Added} added, {Removed} removed",
                    machine.Id, machineFlowsToAdd.Count, machineFlowsToRemove.Count);
            }

            machine = await _unitOfWork.MachineRepo
                            .GetByConditionAsync(m =>
                                m.Id == machine.Id
                            )
                            .Include(a => a.CreatedByUser)
                            .Include(a => a.LastModifiedByUser)
                            .Include(a => a.MachineFlows)
                                .ThenInclude(fv => fv.FlowVersion)
                                .ThenInclude(f => f.Flow)
                            .AsNoTracking()
                            .FirstOrDefaultAsync();

            // Task successful
            serviceResponse.Data = machine.Adapt<MachineDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machine updated successfully";
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
                                                w.IsPublished &&
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
            serviceResponse.Message = "Agents retrieved successfully";
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
            serviceResponse.Message = "Machines retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving the machine list.");
        }

        return serviceResponse;
    }

    private async Task<ServiceResponse<bool>> AssignOrUpdateAgentsAsync(Guid machineId, IEnumerable<Guid> agentIds)
    {
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

            // Validate agents and fetch valid agent entries
            var agents = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w => agentIds.Contains(w.Id) && w.IsPublished)
                .AsNoTracking()
                .ToListAsync();

            var invalidAgentIds = agentIds.Except(agents.Select(a => a.Id)).ToList();
            if (invalidAgentIds.Any())
            {
                _logger.LogInformation("Invalid agent IDs found: {InvalidAgentIds}", string.Join(", ", invalidAgentIds));
                serviceResponse.Message = $"The following agent IDs are invalid or do not belong to the user: {string.Join(", ", invalidAgentIds)}";
                return serviceResponse;
            }

            // Get existing machine flows and determine changes
            var existingMachineFlows = await _unitOfWork.MachineFlowRepo
                        .GetByConditionAsync(mf => mf.MachineId == machineId)
                        .AsNoTracking()
                        .ToListAsync();

            var existingAgentIds = existingMachineFlows.Select(mf => mf.FlowVersionId).ToList();

            var newAgentIds = agentIds.Except(existingAgentIds).ToList();
            var removedAgentIds = existingAgentIds.Except(agentIds).ToList();

            // Create new MachineFlow entries for agents not already assigned
            var machineFlowsToAdd = newAgentIds.Select(agentId => new MachineFlow
            {
                MachineId = machineId,
                FlowVersionId = agentId,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId
            }).ToList();

            // Remove existing MachineFlow entries for agents that are no longer assigned
            var machineFlowsToRemove = existingMachineFlows
                .Where(mf => removedAgentIds.Contains(mf.FlowVersionId))
                .ToList();

            // Begin the transaction to insert and remove data
            if (machineFlowsToAdd.Any())
            {
                await _unitOfWork.MachineFlowRepo.InsertAsync(machineFlowsToAdd);

                // Attempt to save changes to the database
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogInformation("Database save operation failed while assigning or inserting agents.");
                    serviceResponse.Message = "Failed to insert agent assignments for the machine.";
                    return serviceResponse;
                }
            }

            if (machineFlowsToRemove.Any())
            {
                _unitOfWork.MachineFlowRepo.Delete(machineFlowsToRemove);

                // Attempt to save changes to the database
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogInformation("Database save operation failed while assigning or deleting agents.");
                    serviceResponse.Message = "Failed to insert agent assignments for the machine.";
                    return serviceResponse;
                }
            }
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{newAgentIds.Count} agents assigned and {removedAgentIds.Count} agents removed from the machine.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while assigning agents.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Searches for machines created by the current user that match the specified search keyword.
    public async Task<ServiceResponse<IEnumerable<MachineDto>>> FindMachinesByKeywordAsync(string searchKey)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<MachineDto>>
        {
            Data = null,
            Message = "Failed to retrieve machines. Please try again."
        };

        try
        {
            // Normalize search key for case-insensitive comparison
            var normalizedKey = searchKey?.ToLower() ?? string.Empty;

            // Query machines created by the current user and match the search key
            var machines = await _unitOfWork.MachineRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower().Contains(normalizedKey)
                )
                .OrderByDescending(o => o.CreatedOn)
                .Include(a => a.CreatedByUser)
                .Include(a => a.LastModifiedByUser)
                .Include(a => a.MachineFlows)
                    .ThenInclude(fv => fv.FlowVersion)
                    .ThenInclude(f => f.Flow)
                .AsNoTracking()
                .ToListAsync();

            serviceResponse.Data = machines.Adapt<IEnumerable<MachineDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machines retrieved successfully.";
            _logger.LogInformation("Machines retrieved successfully using search key: {SearchKey}", searchKey);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while searching machines with key: {SearchKey}", searchKey);
        }

        return serviceResponse;
    }
}