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
            var machineAlreadyExists = await _unitOfWork.FlowRepo
                                                     .GetByConditionAsync(w =>
                                                        w.Name.ToLower() == machineDto.Name.ToLower() &&
                                                        w.CreatedByUserId == _userId)
                                                     .FirstOrDefaultAsync();

            // Flow already exists
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

            // Insert flow
            await _unitOfWork.MachineRepo.InsertAsync(newMachine);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new flow");
                return serviceResponse;
            }
            // Task successful
            serviceResponse.Data = newMachine.Adapt<MachineDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "machines created successfully";
            _logger.LogInformation("machines created successfully with id {Id}", newMachine.Id);
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
            // Try to get machines
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
            serviceResponse.Message = "Machines deleted successfully";

            _logger.LogInformation("Machines deleted successfully of Id {Id}", machineId);

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
                                            .ProjectToType<MachineDto>()
                                            .ToListAsync();

            // Task successful
            serviceResponse.Data = machines;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "machines retrieved successfully";
            _logger.LogInformation("machines retrieved successfully.");
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
            // Try to get machines
            var machine = await _unitOfWork.MachineRepo
                                            .GetByConditionAsync(m =>
                                                m.Id == machineId && m.CreatedByUserId == _userId
                                            )
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

            // Validate flow name uniqueness
            var machineAlreadyExists = await _unitOfWork.MachineRepo
                            .GetByConditionAsync(m =>
                                m.Name.ToLower() == machineDto.Name.ToLower() &&
                                m.Id != machineDto.Id &&
                                m.CreatedByUserId == _userId
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

    // Deletes multiple flows by their IDs.
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

            // TODO: Check flow relationship with other entities

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

    // public async Task<ServiceResponse<bool>> RemoveAllOperationsAsync(Guid id)
    // {
    //     // Initialize ServiceResponse with failed response
    //     var serviceResponse = new ServiceResponse<bool>
    //     {
    //         Data = false,
    //         StatusCode = 400
    //     };

    //     try
    //     {
    //         // Try to get machines
    //         var machine = await _unitOfWork.MachineRepo
    //                                         .GetByConditionAsync(m => m.Id == id)
    //                                         .FirstOrDefaultAsync();

    //         if (machine == null)
    //         {
    //             serviceResponse.Data = false;
    //             serviceResponse.StatusCode = 404;
    //             serviceResponse.Message = $"There is no machine with Id {id}";
    //             _logger.LogInformation("There is no machine with Id {Id}", id);
    //             return serviceResponse;
    //         }

    //         // Try to delete assigned flows to machine
    //         var machineFlows = await _unitOfWork.MachineFlowRepo.GetByConditionAsync(m => m.MachineId == id).ToListAsync();

    //         _unitOfWork.MachineFlowRepo.Delete(machineFlows);
    //         var deleted = await _unitOfWork.SaveAsync();

    //         if (!deleted)
    //         {
    //             serviceResponse.Data = false;
    //             serviceResponse.StatusCode = 409;
    //             serviceResponse.Message = $"Failed to delete the machine with id {id}";
    //             _logger.LogInformation("Failed to delete the machine with id {Id}", id);
    //             return serviceResponse;
    //         }

    //         // Task successful
    //         serviceResponse.Data = true;
    //         serviceResponse.StatusCode = 200;
    //         serviceResponse.Message = "All assigned flows/agents are removed successfully";

    //         _logger.LogInformation("Machines deleted successfully of Id {Id}", id);

    //     }
    //     catch (Exception ex)
    //     {
    //         _logger.LogError(ex.ToString());
    //         return serviceResponse;
    //     }

    //     return serviceResponse;
    // }

    // public async Task<ServiceResponse<bool>> AssignOperationToMachineAsync(MachineOperationDto operation)
    // {
    //     // Initialize ServiceResponse with failed response
    //     var serviceResponse = new ServiceResponse<bool>
    //     {
    //         Data = false,
    //         StatusCode = 400
    //     };

    //     try
    //     {
    //         var workspaceUser = await _unitOfWork.WorkspaceUserRepo
    //         .GetByConditionAsync(u => u.Id == _userId)
    //         .FirstOrDefaultAsync();

    //         if (workspaceUser == null)
    //         {
    //             serviceResponse.Message = $"User Not found with id {_userId}.";
    //             _logger.LogInformation("User Not found with id {_UserId}.", _userId);
    //             return serviceResponse;
    //         }

    //         var flowVersion = await _unitOfWork.FlowVersionRepo
    //         .GetByConditionAsync(f => f.FlowId == operation.FlowGuid && f.CreatedByUserId == _userId)
    //         .FirstOrDefaultAsync();

    //         if (flowVersion == null)
    //         {
    //             serviceResponse.Message = $"Flow Not found with id {flowVersion.FlowId}.";
    //             _logger.LogInformation("Flow Not found with id {Id}.", flowVersion.FlowId);
    //             return serviceResponse;
    //         }

    //         var machine = await _unitOfWork.MachineRepo
    //         .GetByConditionAsync(m => m.Id == operation.MachineGuid)
    //         .FirstOrDefaultAsync();

    //         if (machine == null)
    //         {
    //             serviceResponse.Message = $"Machine Not found with id {machine.Id}.";
    //             _logger.LogInformation("Machine Not found with id {Id}.", machine.Id);
    //             return serviceResponse;
    //         }

    //         var assignedFlows = await _unitOfWork.MachineFlowRepo.
    //                                 GetByConditionAsync(mf => mf.FlowVersionId == flowVersion.Id && mf.MachineId == machine.Id)
    //                                 .ToListAsync();

    //         if (assignedFlows.Count > 0)
    //         {
    //             serviceResponse.Message = $"Flow is already assigned to machine {machine.Name}.";
    //             _logger.LogInformation("Flow of id {FlowId} is already assigned to machine with id {MachineId}.", flowVersion.Id, machine.Id);
    //             return serviceResponse;
    //         }

    //         switch (operation.OperationType)
    //         {
    //             case MachineOperationType.Assign:
    //                 {
    //                     var machineFlow = new MachineFlow()
    //                     {
    //                         TenantId = machine.TenantId,
    //                         Id = Guid.NewGuid(),
    //                         CreatedByUser = workspaceUser,
    //                         CreatedByUserId = workspaceUser.Id,
    //                         CreatedOn = DateTime.UtcNow,
    //                         LastModifiedByUser = workspaceUser,
    //                         LastModifiedByUserId = workspaceUser.Id,
    //                         LastModifiedOn = DateTime.UtcNow,

    //                         FlowVersion = flowVersion,
    //                         FlowVersionId = flowVersion.Id,

    //                         Machine = machine,
    //                         MachineId = machine.Id
    //                     };
    //                     await _unitOfWork.MachineFlowRepo.InsertAsync(machineFlow);
    //                     _logger.LogInformation("assigning flow of id {FlowId} to machine with id {Id}.", flowVersion.Id, machine.Id);
    //                     break;
    //                 }

    //             case MachineOperationType.Remove:
    //                 {
    //                     _unitOfWork.MachineFlowRepo.Delete(assignedFlows);
    //                     _logger.LogInformation("removing flow of id {FlowId} from machine with id {Id}.", flowVersion.Id, machine.Id);
    //                     break;
    //                 }

    //             default:
    //                 {
    //                     serviceResponse.Message = "Invalid operation.";
    //                     _logger.LogInformation("Invalid operation for flow of id {FlowId} for machine with id {Id}.", flowVersion.Id, machine.Id);
    //                     return serviceResponse;
    //                 }
    //         }

    //         var completed = await _unitOfWork.SaveAsync();

    //         if (!completed)
    //         {
    //             serviceResponse.StatusCode = 409;
    //             serviceResponse.Message = "Failed to complete operation. Please try again.";
    //             return serviceResponse;
    //         }

    //         // Task successful
    //         serviceResponse.Data = true;
    //         serviceResponse.StatusCode = 200;
    //         serviceResponse.Message = "Opearation successfully";
    //     }
    //     catch (Exception ex)
    //     {
    //         _logger.LogError(ex.ToString());
    //         return serviceResponse;
    //     }

    //     return serviceResponse;
    // }


    // /// <summary>
    // /// this method to get the status of the machine through
    // /// </summary>
    // /// <param name="machineId"></param>
    // /// <returns></returns>
    // public async Task<MachineStatusTypeEnum> GetMachineStatusAsync(Guid machineId)
    // {
    //     MachineStatusTypeEnum machineStatus;
    //     try
    //     {
    //         // Try to get machines
    //         var machine = await _unitOfWork.MachineRepo
    //                                         .GetByConditionAsync(m => m.Id == machineId)
    //                                         .FirstOrDefaultAsync();

    //         if (machine == null)
    //         {
    //             _logger.LogInformation("There is no machine with Id {Id}", machineId);
    //             return MachineStatusTypeEnum.Ideal;
    //         }

    //         machineStatus = machine.Status;
    //     }
    //     catch (Exception ex)
    //     {
    //         _logger.LogError(ex.ToString());
    //         machineStatus = MachineStatusTypeEnum.Ideal;
    //     }

    //     return machineStatus;
    // }
}