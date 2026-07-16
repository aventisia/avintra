namespace WorkspaceAPIs.Services;

public class MachinesTableService : IMachinesTableService
{
    private readonly ILogger<MachinesTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IClientStatusStore _clientStatusStore;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly Guid _userId;

    public MachinesTableService(
        ILogger<MachinesTableService> logger,
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
    public async Task<ServiceResponse<IEnumerable<MachinesTableRowDto>>> GetMachinesAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = ServiceResponse<IEnumerable<MachinesTableRowDto>>.Create("Failed to fetch machines", 500);

        try
        {
            // Retrieve the list of records
            var machines = await _unitOfWork.MachineRepo
                            .GetAllAsync()
                            .OrderByDescending(o => o.CreatedOn)
                            .AsNoTracking()
                            .ProjectToType<MachinesTableRowDto>()
                            .ToListAsync();

            // TODO: Need to check. Retrieve the list of machine statuses for the current tenant
            var clientStatusDtos = await _clientStatusStore.GetMachineStatusesAsync(_currentTenantService.CurrentTenantId);

            // TODO: Need to check. Iterate through each machine in the 'machines' collection
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
            return serviceResponse.Update(null, 200, machines.Adapt<IEnumerable<MachinesTableRowDto>>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving machines");
            return serviceResponse;
        }
    }

    // Retrieve an machine by its ID
    public async Task<ServiceResponse<MachinesTableRowDto>> GetMachineAsync(Guid machineId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = ServiceResponse<MachinesTableRowDto>.Create("Failed to fetch machine", 500);

        try
        {
            // Retrieve the record
            var machine = await _unitOfWork.MachineRepo
                            .GetByConditionAsync(w => w.Id == machineId)
                            .AsNoTracking()
                            .ProjectToType<MachinesTableRowDto>()
                            .FirstOrDefaultAsync();

            // Record not found, return
            if (machine == null)
                return serviceResponse.Update("Machine not found", 404);

            // TODO: Need to check. Attempt to retrieve the client status from the store based on the machine's unique ID
            var clientStatusDto = await _clientStatusStore.GetClientByIdAsync(machine.Id);

            // TODO: Need to check. If the client status is found, update the machine's status to match the stored status. If no status is found, mark the machine as 'Offline'.
            machine.Status = clientStatusDto != null ? clientStatusDto.Status : MachineStatusEnum.Offline;

            // TODO: Need to check. (Optional) Update the machine's 'LastCheckedIn' timestamp if a valid status is found.
            // machine.LastCheckedIn = clientStatusDto != null ? clientStatusDto.LastSeen : DateTimeOffset.UtcNow;

            // Task successful
            return serviceResponse.Update(null, 200, machine.Adapt<MachinesTableRowDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving machine record for Machine ID {machineId}.", machineId);
            return serviceResponse;
        }
    }

    // Insert new machine
    public async Task<ServiceResponse<MachinesTableRowDto>> InsertMachineAsync(AddMachineDto addMachineDto)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = ServiceResponse<MachinesTableRowDto>.Create("Failed to add machine", 500);

        try
        {
            // Trim DTO's string properties
            addMachineDto = TrimDtoStringPropsUtil.TrimDtoStringProps(addMachineDto);

            // Check if machine exists with the same env, os type, OS ID and Username
            var existingMachine = await _unitOfWork.MachineRepo
                                    .GetByConditionAsync(w =>
                                        w.Environment == addMachineDto.Environment &&
                                        w.OperatingSystem == addMachineDto.OperatingSystem &&
                                        w.OsID.ToLower() == addMachineDto.OsID.ToLower() &&
                                        w.Username.ToLower() == addMachineDto.Username.ToLower())
                                    .FirstOrDefaultAsync();

            // If machine exists, return
            if (existingMachine != null)
                return serviceResponse.Update($"A machine with same environment, OS type, OS ID and username already exists.", 409);

            // Mapping
            var newMachine = addMachineDto.Adapt<Machine>();
            newMachine.Name = MachinesTableHelpers.BuildMachineName(newMachine.Environment, newMachine.OperatingSystem, newMachine.OsID, newMachine.Username);
            newMachine.Status = MachineStatusEnum.Offline;
            newMachine.CreatedByUserId = _userId;
            newMachine.LastModifiedByUserId = _userId;

            // Insert machine
            await _unitOfWork.MachineRepo.InsertAsync(newMachine);

            // If saving changes fails, return
            if (!await _unitOfWork.SaveAsync())
                return serviceResponse.Update("An error occurred while saving changes.", 500);

            // Task successful
            return serviceResponse.Update("Machine added", 201, newMachine.Adapt<MachinesTableRowDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while adding machine with OS ID {OsID} and Username {Username}", addMachineDto.OsID, addMachineDto.Username);
            return serviceResponse;
        }
    }

    // Update an existing machine
    public async Task<ServiceResponse<MachinesTableRowDto>> UpdateMachineAsync(UpdateMachineDto updateMachineDto)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = ServiceResponse<MachinesTableRowDto>.Create("Failed to update machine", 500);

        try
        {
            // Trim DTO's string properties
            updateMachineDto = TrimDtoStringPropsUtil.TrimDtoStringProps(updateMachineDto);

            // Retrieve the record
            var machine = await _unitOfWork.MachineRepo
                            .GetByConditionAsync(w => w.Id == updateMachineDto.Id)
                            .FirstOrDefaultAsync();

            // Record not found, return
            if (machine == null)
                return serviceResponse.Update("Machine not found", 404);

            // Check if machine exists with the same same env, os type, OS ID and Username
            var existingMachine = await _unitOfWork.MachineRepo
                                    .GetByConditionAsync(w =>
                                        w.Environment == updateMachineDto.Environment &&
                                        w.OperatingSystem == updateMachineDto.OperatingSystem &&
                                        w.OsID.ToLower() == updateMachineDto.OsID.ToLower() &&
                                        w.Username.ToLower() == updateMachineDto.Username.ToLower() &&
                                        w.Id != updateMachineDto.Id)
                                    .FirstOrDefaultAsync();

            // If machine exists, return
            if (existingMachine != null)
                return serviceResponse.Update($"A machine with same environment, OS type, OS ID and username already exists.", 409);

            // Mapping
            updateMachineDto.Adapt(machine);
            machine.Name = MachinesTableHelpers.BuildMachineName(machine.Environment, machine.OperatingSystem, machine.OsID, machine.Username);
            machine.LastModifiedByUserId = _userId;
            machine.LastModifiedOn = DateTimeOffset.UtcNow;

            // Update machine
            _unitOfWork.MachineRepo.Update(machine);

            // If saving changes fails, return
            if (!await _unitOfWork.SaveAsync())
                return serviceResponse.Update("An error occurred while saving changes.", 500);

            // Task successful
            return serviceResponse.Update("Machine updated", 200, machine.Adapt<MachinesTableRowDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating machine with ID {MachineId}", updateMachineDto.Id);
            return serviceResponse;
        }
    }

    // Deletes a machine by its ID
    public async Task<ServiceResponse<bool>> DeleteMachineAsync(Guid machineId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = ServiceResponse<bool>.Create("Failed to delete machine", 500);

        try
        {
            // Retrieve the record
            var machine = await _unitOfWork.MachineRepo
                            .GetByConditionAsync(w => w.Id == machineId)
                            .FirstOrDefaultAsync();

            // Record not found, return
            if (machine == null)
                return serviceResponse.Update("Machine not found", 404);

            // TODO: Need to check. Attempt to retrieve the client status from the store based on the machine's unique ID
            var clientStatusDto = await _clientStatusStore.GetClientByIdAsync(machine.Id);

            // TODO: Need to check. Check if the client status was found (i.e., the machine exists in the store)
            if (clientStatusDto != null)
            {
                // If the machine was found, remove it from the client status store using its connection ID
                await _clientStatusStore.RemoveClientByConnectionAsync(clientStatusDto.ConnectionId);
            }

            // Delete machine
            _unitOfWork.MachineRepo.Delete(machine);

            // If saving changes fails, return
            if (!await _unitOfWork.SaveAsync())
                return serviceResponse.Update("An error occurred while saving changes.", 500);

            // Task successful
            return serviceResponse.Update("Machine deleted", 200, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting machine with ID {MachineId}", machineId);
            return serviceResponse;
        }
    }

    // Deletes multiple machines by their IDs.
    public async Task<ServiceResponse<long>> DeleteMachinesAsync(IEnumerable<Guid> machineIds)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = ServiceResponse<long>.Create("Failed to delete machines", 500);

        try
        {
            // Retrieve the list of records
            var machines = await _unitOfWork.MachineRepo
                            .GetByConditionAsync(w => machineIds.Contains(w.Id))
                            .ToListAsync();

            // Records not found, return
            if (machines.Count == 0)
                return serviceResponse.Update("Machines not found", 404);

            // Machines count mismatch, return
            if (machines.Count != machineIds.Count())
                return serviceResponse.Update("Some machines not found", 404);

            // TODO: Need to check. Attempt to retrieve the list of machine statuses for the current tenant
            var machineStatusesList = await _clientStatusStore.GetMachineStatusesAsync(_currentTenantService.CurrentTenantId);

            // TODO: Need to check. Iterate through each machine in the 'machines' collection that we need to process
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

            // If saving changes fails, return
            if (!await _unitOfWork.SaveAsync())
                return serviceResponse.Update("An error occurred while saving changes.", 500);

            // Task successful
            return serviceResponse.Update($"{machines.Count} machines deleted", 200, machines.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting machines with IDs {MachineIds}", string.Join(", ", machineIds));
            return serviceResponse;
        }
    }

    // TODO: Synchronize machine's flow versions
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

    // TODO: Need to check. Retrieve flow version list
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

    // TODO: Need to check. Retrieve machine select-option
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

    // TODO: Need to check. Searches for machines created by the current user that match the specified search keyword.
    public async Task<ServiceResponse<IEnumerable<MachinesTableRowDto>>> FindMachinesByKeywordAsync(string searchKey)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<MachinesTableRowDto>>
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

            serviceResponse.Data = machines.Adapt<IEnumerable<MachinesTableRowDto>>();
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
