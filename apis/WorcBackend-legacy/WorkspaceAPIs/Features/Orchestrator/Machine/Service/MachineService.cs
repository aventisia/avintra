namespace WorkspaceAPIs.Services;

public class MachineService : IMachineService
{
    private readonly ILogger<MachineService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IClientStatusStore _clientStatusStore;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly Guid _userId;

    public MachineService(
        ILogger<MachineService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IClientStatusStore clientStatusStore,
        ICurrentTenantService currentTenantService)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _clientStatusStore = clientStatusStore;
        _currentTenantService = currentTenantService;
    }

    // Retrieves list of machines.
    public async Task<ServiceResponse<IEnumerable<MachineDto>>> GetMachinesAsync()
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
                .GetAllAsync()
                .OrderByDescending(o => o.CreatedOn)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.MachineFlowVersions.Where(w => w.FlowVersion != null && !w.FlowVersion.IsArchived))
                    .ThenInclude(i2 => i2.FlowVersion)
                        .ThenInclude(i3 => i3.Flow)
                .AsNoTracking()
                .ToListAsync();

            // Retrieve the list of machine statuses for the current tenant
            var clientStatusDtos = await _clientStatusStore.GetMachineStatusesAsync(_currentTenantService.CurrentTenantId);

            // Iterate through each machine in the 'machines' collection
            foreach (var machine in machines)
            {
                // Find the status of the machine by matching its ClientId with the current machine's Id
                var clientStatusDto = clientStatusDtos.FirstOrDefault(status => status.ClientId == machine.Id);

                // Set the machine's status based on whether a matching status was found
                machine.Status = clientStatusDto != null ? clientStatusDto.Status : MachineStatusEnum.Offline;

                // (Optional) Update the machine's last checked-in time if a valid status is found
                // machine.LastCheckedIn = clientStatusDto != null ? clientStatusDto.LastSeen : MachineStatusEnum.Offline;
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
                .GetByConditionAsync(w => w.Id == machineId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.MachineFlowVersions)
                    .ThenInclude(i2 => i2.FlowVersion)
                    .ThenInclude(i3 => i3.Flow)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            if (machine == null)
            {
                serviceResponse.Message = "Machine does not exist";
                _logger.LogInformation("There is no machine with Id {Id}", machineId);
                return serviceResponse;
            }

            // Attempt to retrieve the client status from the store based on the machine's unique ID
            var clientStatusDto = await _clientStatusStore.GetClientByIdAsync(machine.Id);

            // If the client status is found, update the machine's status to match the stored status. If no status is found, mark the machine as 'Offline'.
            machine.Status = clientStatusDto != null ? clientStatusDto.Status : MachineStatusEnum.Offline;

            // (Optional) Update the machine's 'LastCheckedIn' timestamp if a valid status is found.
            // machine.LastCheckedIn = clientStatusDto != null ? clientStatusDto.LastSeen : DateTimeOffset.UtcNow;

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

    // Insert new machine
    public async Task<ServiceResponse<MachineDto>> InsertMachineAsync(AddMachineDto addMachineDto)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = new ServiceResponse<MachineDto>
        {
            Data = null,
            Message = "Failed to insert machine. Please try again"
        };

        try
        {
            // Trim DTO string properties before generating derived values.
            addMachineDto = TrimDtoStringPropsUtil.TrimDtoStringProps(addMachineDto);

            // Default mapping
            var newMachine = addMachineDto.Adapt<Machine>();
            newMachine.Name = MachineHelpers.BuildMachineName(newMachine.Environment, newMachine.OperatingSystem, newMachine.OsID, newMachine.Username);
            newMachine.Status = MachineStatusEnum.Idle;
            newMachine.CreatedByUserId = _userId;
            newMachine.LastModifiedByUserId = _userId;

            // Keep compatibility with hub lookup by (OsID, Hostname).
            var existingMachineByOsHost = await _unitOfWork.MachineRepo
                .GetByConditionAsync(w =>
                    w.OsID.ToLower() == newMachine.OsID.ToLower() &&
                    w.Hostname.ToLower() == newMachine.Hostname.ToLower())
                .FirstOrDefaultAsync();

            if (existingMachineByOsHost != null)
            {
                _logger.LogInformation("Validation failed: A machine with OsID {OsID} and Hostname {Hostname} already exists.", newMachine.OsID, newMachine.Hostname);
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = $"A machine with OsID '{newMachine.OsID}' and Hostname '{newMachine.Hostname}' already exists.";
                return serviceResponse;
            }

            // Insert machine
            await _unitOfWork.MachineRepo.InsertAsync(newMachine);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new machine");
                return serviceResponse;
            }

            newMachine = await _unitOfWork.MachineRepo
                            .GetByConditionAsync(w => w.Id == newMachine.Id)
                            .Include(i => i.CreatedByUser)
                            .Include(i => i.LastModifiedByUser)
                            .Include(i => i.MachineFlowVersions)
                                .ThenInclude(i2 => i2.FlowVersion)
                                .ThenInclude(i3 => i3.Flow)
                            .AsNoTracking()
                            .FirstOrDefaultAsync();


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

    // Update an existing machine
    public async Task<ServiceResponse<MachineDto>> UpdateMachineAsync(UpdateMachineDto updateMachineDto)
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
                .GetByConditionAsync(w => w.Id == updateMachineDto.Id)
                .Include(i => i.MachineFlowVersions)
                .FirstOrDefaultAsync();

            // Machine does not exist
            if (machine == null)
            {
                _logger.LogInformation("Machine does not exist");
                serviceResponse.Message = "Machine does not exist";
                return serviceResponse;
            }

            // Trim DTO string properties before generating derived values.
            updateMachineDto = TrimDtoStringPropsUtil.TrimDtoStringProps(updateMachineDto);

            // Default mapping 
            updateMachineDto.Adapt(machine);
            machine.Name = MachineHelpers.BuildMachineName(machine.Environment, machine.OperatingSystem, machine.OsID, machine.Username);

            var existingMachineByOsHost = await _unitOfWork.MachineRepo
                .GetByConditionAsync(w =>
                    w.Id != machine.Id &&
                    w.OsID.ToLower() == machine.OsID.ToLower() &&
                    w.Hostname.ToLower() == machine.Hostname.ToLower())
                .FirstOrDefaultAsync();

            if (existingMachineByOsHost != null)
            {
                _logger.LogInformation("Validation failed: A machine with OsID {OsID} and Hostname {Hostname} already exists.", machine.OsID, machine.Hostname);
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = $"A machine with OsID '{machine.OsID}' and Hostname '{machine.Hostname}' already exists.";
                return serviceResponse;
            }

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

            machine = await _unitOfWork.MachineRepo
                            .GetByConditionAsync(w => w.Id == machine.Id)
                            .Include(i => i.CreatedByUser)
                            .Include(i => i.LastModifiedByUser)
                            .Include(i => i.MachineFlowVersions)
                                .ThenInclude(i2 => i2.FlowVersion)
                                .ThenInclude(i3 => i3.Flow)
                            .AsNoTracking()
                            .FirstOrDefaultAsync();

            // Task successful
            serviceResponse.Data = machine.Adapt<MachineDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machine updated successfully";
            _logger.LogInformation("Machine updated successfully with Id {Id}", machine.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes a machine by its ID
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
                                            .GetByConditionAsync(w => w.Id == machineId)
                                            .Include(i => i.MachineFlowVersions)
                                            .FirstOrDefaultAsync();

            // Machine does not exist
            if (machine == null)
            {
                _logger.LogInformation($"Machine does not exist");
                serviceResponse.Message = "Machine does not exist";
                return serviceResponse;
            }

            // Attempt to retrieve the client status from the store based on the machine's unique ID
            var clientStatusDto = await _clientStatusStore.GetClientByIdAsync(machine.Id);

            // Check if the client status was found (i.e., the machine exists in the store)
            if (clientStatusDto != null)
            {
                // If the machine was found, remove it from the client status store using its connection ID
                await _clientStatusStore.RemoveClientByConnectionAsync(clientStatusDto.ConnectionId);
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

    // Deletes multiple machines by their IDs.
    public async Task<ServiceResponse<bool>> DeleteMachinesAsync(IEnumerable<Guid> machineIds)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = ServiceResponse<bool>.Create(message: "Failed to delete machines. Please try again");

        try
        {
            // Validate machines existence
            var machines = await _unitOfWork.MachineRepo
                                            .GetByConditionAsync(w => machineIds.Contains(w.Id))
                                            .Include(a => a.MachineFlowVersions)
                                            .ToListAsync();

            // Machines do not exist
            if (machines.Count == 0)
            {
                _logger.LogInformation($"Machines do not exist");
                serviceResponse.Message = "Machines do not exist";
                return serviceResponse;
            }

            // Attempt to retrieve the list of machine statuses for the current tenant
            var machineStatusesList = await _clientStatusStore.GetMachineStatusesAsync(_currentTenantService.CurrentTenantId);

            // Iterate through each machine in the 'machines' collection that we need to process
            foreach (var machine in machines)
            {
                // Find the machine's current status based on its unique client ID
                var clientStatusDto = machineStatusesList.FirstOrDefault(w => w.ClientId == machine.Id);

                // Check if the machine's status was found in the store
                if (clientStatusDto != null)
                {
                    // If a status was found, attempt to remove the machine from the store by its connection ID
                    await _clientStatusStore.RemoveClientByConnectionAsync(clientStatusDto.ConnectionId);
                }
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

    // Synchronize machine's flow versions
    public async Task<ServiceResponse<bool>> SyncMachineFlowVersionsAsync(UpdateMachineFlowVersionsDto updateMachineFlowVersionsDto)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to update machine flow versions. Please try again."
        };

        try
        {
            // Remove duplicates from the provided flow version IDs and convert to a list.
            var requestedFlowVersionIds = (updateMachineFlowVersionsDto.FlowVersionIds ?? Enumerable.Empty<Guid>()).Distinct().ToList();

            // Retrieve the machine details based on the provided machineId.
            var machine = await _unitOfWork.MachineRepo
                .GetByConditionAsync(w => w.Id == updateMachineFlowVersionsDto.MachineId)
                .Include(m => m.MachineFlowVersions)
                .FirstOrDefaultAsync();

            if (machine == null)
            {
                // If machine does not exist, return failure.
                _logger.LogInformation("Machine not found.");
                serviceResponse.Message = "The machine does not exist.";
                return serviceResponse;
            }

            var validFlowVersions = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    requestedFlowVersionIds.Contains(w.Id) &&
                    w.IsPublished &&
                    !w.IsArchived)
                .Select(s => s.Id)
                .ToListAsync();

            var invalidFlowVersionIds = requestedFlowVersionIds.Except(validFlowVersions).ToList();
            if (invalidFlowVersionIds.Any())
            {
                serviceResponse.StatusCode = 400;
                serviceResponse.Message = $"The following flow version IDs are invalid, unpublished, or archived: {string.Join(", ", invalidFlowVersionIds)}";
                return serviceResponse;
            }

            var existingMachineFlows = machine.MachineFlowVersions.ToList();
            var existingFlowVersionIds = existingMachineFlows.Select(s => s.FlowVersionId).ToHashSet();

            // Compute set differences to keep existing mappings untouched, remove deprecated ones, and add only missing ones.
            var flowVersionIdsToAdd = requestedFlowVersionIds.Where(w => !existingFlowVersionIds.Contains(w)).ToList();
            var machineFlowsToRemove = existingMachineFlows.Where(w => !requestedFlowVersionIds.Contains(w.FlowVersionId)).ToList();

            if (machineFlowsToRemove.Any())
            {
                _unitOfWork.Machine_FlowVersionRepo.Delete(machineFlowsToRemove);
            }

            if (flowVersionIdsToAdd.Any())
            {
                var machineFlowsToAdd = flowVersionIdsToAdd
                    .Select(flowVersionId => new Machine_FlowVersion
                    {
                        MachineId = machine.Id,
                        FlowVersionId = flowVersionId
                    })
                    .ToList();

                await _unitOfWork.Machine_FlowVersionRepo.InsertAsync(machineFlowsToAdd);
            }

            if ((machineFlowsToRemove.Any() || flowVersionIdsToAdd.Any()) && !await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"Machine flow versions updated successfully. Added: {flowVersionIdsToAdd.Count}, removed: {machineFlowsToRemove.Count}.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while updating machine flow versions.");
        }

        return serviceResponse;
    }

    // TODO: Need to check below methods

    // Retrieve flow version list
    public async Task<ServiceResponse<IEnumerable<AssignFlowVersionDto>>> GetFlowVersionsByMachineOSIdAsync(string osId)
    {
        // Initialize the response with a failed result
        var serviceResponse = new ServiceResponse<IEnumerable<AssignFlowVersionDto>>
        {
            Data = null,
            Message = "Failed to retrieve flow versions. Please try again."
        };

        try
        {
            // Retrieve machine by os id
            var machine = await _unitOfWork.MachineRepo
                    .GetByConditionAsync(w => w.OsID.ToLower() == osId.ToLower())
                    .Include(i => i.MachineFlowVersions)
                    .FirstOrDefaultAsync();

            // Return an error if the machine doesn't exist
            if (machine == null)
            {
                _logger.LogInformation("Machine with OS ID {OSId} not found for user {UserId}.", osId, _userId);
                serviceResponse.Message = "The machine does not exist.";
                return serviceResponse;
            }

            // Retrieve all flow versions
            var flowVersions = await _unitOfWork.Machine_FlowVersionRepo
                    .GetByConditionAsync(w =>
                        w.MachineId == machine.Id &&
                        w.FlowVersion.IsPublished &&
                        !w.FlowVersion.IsArchived
                    )
                    .Include(i => i.FlowVersion)
                        .ThenInclude(i2 => i2.Flow)
                    .ProjectToType<AssignFlowVersionDto>()
                    .ToListAsync();

            var clientDataStores = await _clientStatusStore.GetMachineStatusesAsync(_currentTenantService.CurrentTenantId);

            // Iterate through each flow version in the collection
            foreach (var flowVersion in flowVersions)
            {
                // Find the status of the flow version by matching the executing flow version id.
                var clientDataStore = clientDataStores.FirstOrDefault(w => w.AgentId != null && w.AgentId == flowVersion.Id);

                // Set the flow version status based on whether a matching status was found
                flowVersion.Status = clientDataStore?.Status == MachineStatusEnum.Running ? AgentExecutionStatus.Executing : AgentExecutionStatus.Stopped;
                flowVersion.JobId = (clientDataStore?.Status == MachineStatusEnum.Running) ? clientDataStore.JobId : null;
            }

            // Return the flow versions along with their assignment status
            serviceResponse.Data = flowVersions;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow versions retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while retrieving flow versions for machine OSId {osId}.", osId);
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
                .GetByConditionAsync(w => w.Name.ToLower().Contains(normalizedKey))
                .OrderByDescending(o => o.CreatedOn)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.MachineFlowVersions)
                    .ThenInclude(i2 => i2.FlowVersion)
                    .ThenInclude(i3 => i3.Flow)
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
