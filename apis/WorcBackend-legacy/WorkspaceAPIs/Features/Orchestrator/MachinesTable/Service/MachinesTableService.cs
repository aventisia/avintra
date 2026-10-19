namespace WorkspaceAPIs.Services;

public class MachinesTableService : IMachinesTableService
{
    private readonly ILogger<MachinesTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IClientStatusStore _clientStatusStore;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IUserManagementGuardService _userManagementGuardService;

    public MachinesTableService(
        ILogger<MachinesTableService> logger,
        IUnitOfWork unitOfWork,
        IClientStatusStore clientStatusStore,
        ICurrentTenantService currentTenantService,
        IUserManagementGuardService userManagementGuardService)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _clientStatusStore = clientStatusStore;
        _currentTenantService = currentTenantService;
        _userManagementGuardService = userManagementGuardService;
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
                            .OrderByDescending(o => o.CreatedAt)
                            .AsNoTracking()
                            .Include(i => i.User)
                            .ProjectToType<MachinesTableRowDto>()
                            .ToListAsync();

            // Agent counts must reflect the current space only.
            // The Machine_FlowVersion join table has no SpaceId, so count the assignments whose
            // FlowVersion belongs to the current space (the FlowVersion query is constrained by
            // its tenant + space scoped global filter).
            var currentSpaceFlowVersionIds = _unitOfWork.FlowVersionRepo
                .GetAllAsync()
                .Select(flowVersion => flowVersion.Id);

            var machineAgentCounts = await _unitOfWork.Machine_FlowVersionRepo
                .GetAllAsync()
                .Where(w => currentSpaceFlowVersionIds.Contains(w.FlowVersionId))
                .GroupBy(w => w.MachineId)
                .Select(group => new { group.Key, Count = group.Count() })
                .ToListAsync();

            var machineAgentCountLookup = machineAgentCounts.ToDictionary(x => x.Key, x => x.Count);

            // Override the tenant-wide count from the mapping with the current-space count (0 when none).
            foreach (var machine in machines)
                machine.FlowVersionCount = machineAgentCountLookup.TryGetValue(machine.Id, out var agentCount) ? agentCount : 0;

            // Retrieve live machine statuses for the current tenant
            var clientStatusDtos = await _clientStatusStore.GetMachineStatusesAsync(_currentTenantService.CurrentTenantId);

            // Apply live status and last-seen timestamp to each machine
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

    // Retrieves a machine by its ID.
    public async Task<ServiceResponse<MachineRecordDto>> GetMachineAsync(Guid machineId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = ServiceResponse<MachineRecordDto>.Create("Failed to fetch machine", 500);

        try
        {
            // Retrieve the record
            var machine = await _unitOfWork.MachineRepo
                            .GetByConditionAsync(w => w.Id == machineId)
                            .Include(i => i.User)
                            .Include(i => i.MachineFlowVersions)
                            .AsNoTracking()
                            .ProjectToType<MachineRecordDto>()
                            .FirstOrDefaultAsync();

            // Record not found, return
            if (machine == null)
                return serviceResponse.Update("Machine not found", 404);

            // Enrich the machine record with live connection status
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

    // Updates an existing machine.
    public async Task<ServiceResponse<MachinesTableRowDto>> UpdateMachineAsync(UpdateMachineDto updateMachineDto)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = ServiceResponse<MachinesTableRowDto>.Create("Failed to update machine", 500);

        try
        {
            // Retrieve the record
            var machine = await _unitOfWork.MachineRepo
                            .GetByConditionAsync(w => w.Id == updateMachineDto.Id)
                            .FirstOrDefaultAsync();

            // Record not found, return
            if (machine == null)
                return serviceResponse.Update("Machine not found", 404);

            // Update the disabled state when provided
            if (updateMachineDto.IsDisabled.HasValue)
                machine.IsDisabled = updateMachineDto.IsDisabled.Value;

            // Update machine
            _unitOfWork.MachineRepo.Update(machine);

            // Update Machine_FlowVersion for the provided FlowVersionIds
            if (updateMachineDto.FlowVersionIds != null)
            {
                var distinctFlowVersionIds = MachinesTableHelpers.GetDistinctGuids(updateMachineDto.FlowVersionIds);

                // Retrieve existing Machine_FlowVersion records for the machine.
                // The join table has no SpaceId and is tenant-scoped only, so this returns
                // assignments from every space.
                var existingMachineFlowVersions = await _unitOfWork.Machine_FlowVersionRepo
                    .GetByConditionAsync(w => w.MachineId == machine.Id)
                    .ToListAsync();

                var existingFlowVersionIds = existingMachineFlowVersions
                    .Select(s => s.FlowVersionId)
                    .ToHashSet();

                // Space lives on FlowVersion, not on the join table, so resolve which of the
                // machine's existing and requested flow versions belong to the current space.
                // The space-scoped global filter on FlowVersion limits this query to that space.
                var candidateFlowVersionIds = existingFlowVersionIds
                    .Union(distinctFlowVersionIds)
                    .ToList();

                var currentSpaceFlowVersionIds = (await _unitOfWork.FlowVersionRepo
                        .GetByConditionAsync(w => candidateFlowVersionIds.Contains(w.Id))
                        .Select(w => w.Id)
                        .ToListAsync())
                    .ToHashSet();

                // Remove current-space assignments that are no longer requested.
                // Assignments referencing other spaces' flow versions are never touched.
                var machineFlowVersionsToRemove = existingMachineFlowVersions
                    .Where(w => currentSpaceFlowVersionIds.Contains(w.FlowVersionId)
                                && !distinctFlowVersionIds.Contains(w.FlowVersionId))
                    .ToList();

                if (machineFlowVersionsToRemove.Any())
                    _unitOfWork.Machine_FlowVersionRepo.Delete(machineFlowVersionsToRemove);

                // Get current-space FlowVersionIds that need to be added
                var newFlowVersionIds = distinctFlowVersionIds
                    .Where(flowVersionId => currentSpaceFlowVersionIds.Contains(flowVersionId)
                                            && !existingFlowVersionIds.Contains(flowVersionId))
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

    // Deletes an existing machine.
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

            // IMPORTANT NOTE: The offline guard must run before the linked-jobs guard so the
            // offline message takes precedence when a machine is both non-offline and has jobs.
            if (!await IsMachineOfflineAsync(machine.Id))
                return serviceResponse.Update("This machine can only be deleted when it is offline.", 400);

            var linkedJobs = await GetLinkedJobsAsync(machine.Id);

            if (linkedJobs.Count > 0)
            {
                if (!IsSuperAdmin())
                    return serviceResponse.Update("This machine can't be deleted while it has linked jobs.", 409);

                _unitOfWork.JobRepo.Delete(linkedJobs);
            }

            // Remove the machine from the live client status store if connected
            var clientStatusDto = await _clientStatusStore.GetClientByIdAsync(machine.Id);
            if (clientStatusDto != null)
                await _clientStatusStore.RemoveClientByConnectionAsync(clientStatusDto.ConnectionId);

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

            // IMPORTANT NOTE: The offline guard must run before the linked-jobs guard so the
            // offline message takes precedence when any machine is both non-offline and has jobs.
            var machineStatusesList = await _clientStatusStore.GetMachineStatusesAsync(_currentTenantService.CurrentTenantId);
            if (machines.Any(machine =>
            {
                var clientStatusDto = machineStatusesList.FirstOrDefault(w => w.ClientId == machine.Id);
                return clientStatusDto != null && clientStatusDto.Status != MachineStatusEnum.Offline;
            }))
            {
                return serviceResponse.Update("This machine can only be deleted when it is offline.", 400);
            }

            var linkedJobs = new List<Job>();
            foreach (var machine in machines)
                linkedJobs.AddRange(await GetLinkedJobsAsync(machine.Id));

            if (linkedJobs.Count > 0)
            {
                if (!IsSuperAdmin())
                    return serviceResponse.Update("This machine can't be deleted while it has linked jobs.", 409);

                _unitOfWork.JobRepo.Delete(linkedJobs);
            }

            // Remove the machines from the live client status store if connected
            foreach (var machine in machines)
            {
                var clientStatusDto = machineStatusesList.FirstOrDefault(w => w.ClientId == machine.Id);
                if (clientStatusDto != null)
                    await _clientStatusStore.RemoveClientByConnectionAsync(clientStatusDto.ConnectionId);
            }

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

    private bool IsSuperAdmin() => _userManagementGuardService.HasRole(CustomRolesEnum.SA.ToString());

    private async Task<bool> IsMachineOfflineAsync(Guid machineId)
    {
        var clientStatusDto = await _clientStatusStore.GetClientByIdAsync(machineId);
        return clientStatusDto == null || clientStatusDto.Status == MachineStatusEnum.Offline;
    }

    private async Task<List<Job>> GetLinkedJobsAsync(Guid machineId)
    {
        return await _unitOfWork.JobRepo
            .GetByConditionAsync(w => w.MachineId == machineId && w.TenantId == _currentTenantService.CurrentTenantId)
            .IgnoreQueryFilters()
            .ToListAsync();
    }
}
