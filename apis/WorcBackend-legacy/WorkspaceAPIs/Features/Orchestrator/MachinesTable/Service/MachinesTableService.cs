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

            // TODO: machine_tables feature refactor. Retrieve the list of machine statuses for the current tenant
            var clientStatusDtos = await _clientStatusStore.GetMachineStatusesAsync(_currentTenantService.CurrentTenantId);

            // TODO: machine_tables feature refactor. Iterate through each machine in the 'machines' collection
            foreach (var machine in machines)
            {
                // Find the status of the machine by matching its ClientId with the current machine's Id
                var clientStatusDto = clientStatusDtos.FirstOrDefault(status => status.ClientId == machine.Id);

                if (clientStatusDto != null)
                {
                    // Set the machine's status and use the live last-seen timestamp when online.
                    machine.Status = clientStatusDto.Status;
                    machine.LastCheckedIn = clientStatusDto.LastSeen.UtcDateTime;
                }
                else
                {
                    // No live status found; keep the persisted last checked-in time.
                    machine.Status = MachineStatusEnum.Offline;
                }
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
    public async Task<ServiceResponse<MachineRecordDto>> GetMachineAsync(Guid machineId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = ServiceResponse<MachineRecordDto>.Create("Failed to fetch machine", 500);

        try
        {
            // Retrieve the record
            var machine = await _unitOfWork.MachineRepo
                            .GetByConditionAsync(w => w.Id == machineId)
                            .Include(i => i.MachineFlowVersions)
                            .AsNoTracking()
                            .ProjectToType<MachineRecordDto>()
                            .FirstOrDefaultAsync();

            // Record not found, return
            if (machine == null)
                return serviceResponse.Update("Machine not found", 404);

            // TODO: machine_tables feature refactor Attempt to retrieve the client status from the store based on the machine's unique ID
            var clientStatusDto = await _clientStatusStore.GetClientByIdAsync(machine.Id);

            if (clientStatusDto != null)
            {
                // Set the machine's status and use the live last-seen timestamp when online.
                machine.Status = clientStatusDto.Status;
                machine.LastCheckedIn = clientStatusDto.LastSeen.UtcDateTime;
            }
            else
            {
                // No live status found; keep the persisted last checked-in time.
                machine.Status = MachineStatusEnum.Offline;
            }

            // Task successful
            return serviceResponse.Update(null, 200, machine);
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
            newMachine.CreatedByUserId = _userId;
            newMachine.LastModifiedByUserId = _userId;

            // Insert machine
            await _unitOfWork.MachineRepo.InsertAsync(newMachine);

            // Add Machine_FlowVersion for the provided FlowVersionIds
            if (addMachineDto.FlowVersionIds != null && addMachineDto.FlowVersionIds.Any())
            {
                var distinctFlowVersionIds = MachinesTableHelpers.GetDistinctGuids(addMachineDto.FlowVersionIds);
                var machineFlowVersions = MachinesTableHelpers.CreateMachineFlowVersions(newMachine.Id, distinctFlowVersionIds);

                // Insert Machine_FlowVersion records
                if (machineFlowVersions.Any())
                    await _unitOfWork.Machine_FlowVersionRepo.InsertAsync(machineFlowVersions);
            }

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

            // Update Machine_FlowVersion for the provided FlowVersionIds
            if (updateMachineDto.FlowVersionIds != null)
            {
                var distinctFlowVersionIds = MachinesTableHelpers.GetDistinctGuids(updateMachineDto.FlowVersionIds);

                // Retrieve existing Machine_FlowVersion records for the machine
                var existingMachineFlowVersions = await _unitOfWork.Machine_FlowVersionRepo
                    .GetByConditionAsync(w => w.MachineId == machine.Id)
                    .ToListAsync();

                var existingFlowVersionIds = existingMachineFlowVersions
                    .Select(s => s.FlowVersionId)
                    .ToHashSet();

                // Remove Machine_FlowVersion records that are no longer requested
                var machineFlowVersionsToRemove = existingMachineFlowVersions
                    .Where(w => !distinctFlowVersionIds.Contains(w.FlowVersionId))
                    .ToList();

                if (machineFlowVersionsToRemove.Any())
                    _unitOfWork.Machine_FlowVersionRepo.Delete(machineFlowVersionsToRemove);

                // Get new FlowVersionIds that need to be added
                var newFlowVersionIds = distinctFlowVersionIds
                    .Where(flowVersionId => !existingFlowVersionIds.Contains(flowVersionId))
                    .ToList();

                // Create new Machine_FlowVersion records for the new FlowVersionIds
                var newMachineFlowVersions = MachinesTableHelpers.CreateMachineFlowVersions(machine.Id, newFlowVersionIds);

                if (newMachineFlowVersions.Any())
                    await _unitOfWork.Machine_FlowVersionRepo.InsertAsync(newMachineFlowVersions);
            }

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

            // TODO: machine_tables feature refactor Attempt to retrieve the client status from the store based on the machine's unique ID
            var clientStatusDto = await _clientStatusStore.GetClientByIdAsync(machine.Id);

            // TODO: machine_tables feature refactor Check if the client status was found (i.e., the machine exists in the store)
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

            // TODO: machine_tables feature refactor Attempt to retrieve the list of machine statuses for the current tenant
            var machineStatusesList = await _clientStatusStore.GetMachineStatusesAsync(_currentTenantService.CurrentTenantId);

            // TODO: machine_tables feature refactor Iterate through each machine in the 'machines' collection that we need to process
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

            // TODO: machine_tables feature refactor. Check machine relationship with other entities

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

    // TODO: machine_tables feature refactor. Need to check below methods

    // TODO: machine_tables feature refactor machine_tables feature refactor Searches for machines created by the current user that match the specified search keyword.
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
