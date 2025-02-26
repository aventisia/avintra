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

    public async Task<ServiceResponse<bool>> AssignOperationToMachineAsync(MachineOperationDto operation)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400
        };

        try
        {
            var workspaceUser = await _unitOfWork.WorkspaceUserRepo
            .GetByConditionAsync(u => u.Id == _userId)
            .FirstOrDefaultAsync();

            if (workspaceUser == null)
            {
                serviceResponse.Message = $"User Not found with id {_userId}.";
                _logger.LogInformation("User Not found with id {_UserId}.", _userId);
                return serviceResponse;
            }

            var flowVersion = await _unitOfWork.FlowVersionRepo
            .GetByConditionAsync(f => f.FlowId == operation.FlowGuid && f.CreatedByUserId == _userId)
            .FirstOrDefaultAsync();

            if (flowVersion == null)
            {
                serviceResponse.Message = $"Flow Not found with id {flowVersion.FlowId}.";
                _logger.LogInformation("Flow Not found with id {Id}.", flowVersion.FlowId);
                return serviceResponse;
            }

            var machine = await _unitOfWork.MachineRepo
            .GetByConditionAsync(m => m.Id == operation.MachineGuid)
            .FirstOrDefaultAsync();

            if (machine == null)
            {
                serviceResponse.Message = $"Machine Not found with id {machine.Id}.";
                _logger.LogInformation("Machine Not found with id {Id}.", machine.Id);
                return serviceResponse;
            }

            var assignedFlows = await _unitOfWork.MachineFlowRepo.
                                    GetByConditionAsync(mf => mf.FlowVersionId == flowVersion.Id && mf.MachineId == machine.Id)
                                    .ToListAsync();

            if (assignedFlows.Count > 0)
            {
                serviceResponse.Message = $"Flow is already assigned to machine {machine.Name}.";
                _logger.LogInformation("Flow of id {FlowId} is already assigned to machine with id {MachineId}.", flowVersion.Id, machine.Id);
                return serviceResponse;
            }

            switch (operation.OperationType)
            {
                case MachineOperationType.Assign:
                    {
                        var machineFlow = new MachineFlow()
                        {
                            TenantId = machine.TenantId,
                            Id = Guid.NewGuid(),
                            CreatedByUser = workspaceUser,
                            CreatedByUserId = workspaceUser.Id,
                            CreatedOn = DateTime.UtcNow,
                            LastModifiedByUser = workspaceUser,
                            LastModifiedByUserId = workspaceUser.Id,
                            LastModifiedOn = DateTime.UtcNow,

                            FlowVersion = flowVersion,
                            FlowVersionId = flowVersion.Id,

                            Machine = machine,
                            MachineId = machine.Id
                        };
                        await _unitOfWork.MachineFlowRepo.InsertAsync(machineFlow);
                        _logger.LogInformation("assigning flow of id {FlowId} to machine with id {Id}.", flowVersion.Id, machine.Id);
                        break;
                    }

                case MachineOperationType.Remove:
                    {
                        _unitOfWork.MachineFlowRepo.Delete(assignedFlows);
                        _logger.LogInformation("removing flow of id {FlowId} from machine with id {Id}.", flowVersion.Id, machine.Id);
                        break;
                    }

                default:
                    {
                        serviceResponse.Message = "Invalid operation.";
                        _logger.LogInformation("Invalid operation for flow of id {FlowId} for machine with id {Id}.", flowVersion.Id, machine.Id);
                        return serviceResponse;
                    }
            }

            var completed = await _unitOfWork.SaveAsync();

            if (!completed)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Failed to complete operation. Please try again.";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Opearation successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<MachineDto>> CreateNewMachineAsync(CreateMachineDto createMachineDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<MachineDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            var workspaceUser = await _unitOfWork.WorkspaceUserRepo
            .GetByConditionAsync(u => u.Id == _userId)
            .FirstOrDefaultAsync();

            if (workspaceUser == null)
            {
                serviceResponse.Data = null;
                serviceResponse.StatusCode = 400;
                serviceResponse.Message = $"User Not found with id {_userId}";
                _logger.LogInformation("User Not found with id {_UserId}.", _userId);
                return serviceResponse;
            }

            var newMachine = new Machine()
            {
                Id = Guid.NewGuid(),
                CreatedByUser = workspaceUser,
                CreatedByUserId = workspaceUser.Id,
                CreatedOn = DateTime.UtcNow,
                LastCheckedIn = DateTime.UtcNow,
                LastModifiedByUser = workspaceUser,
                LastModifiedByUserId = workspaceUser.Id,
                LastModifiedOn = DateTime.UtcNow,

                IsDisabled = false,
                Status = MachineStatusTypeEnum.Ideal,
                IsAvailable = true,

                Hostname = createMachineDto.Hostname,
                IPAddress = createMachineDto.IPAddress,
                Name = createMachineDto.Name,
                TenantId = createMachineDto.TenantId,
                Environment = createMachineDto.Environment,
                Type = createMachineDto.Type,
            };

            await _unitOfWork.MachineRepo.InsertAsync(newMachine);
            var inserted = await _unitOfWork.SaveAsync();

            if (!inserted)
            {
                serviceResponse.Data = null;
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Failed to create the machine. Please try again.";
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

    public async Task<ServiceResponse<bool>> DeleteMachineAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400
        };

        try
        {
            // Try to get machines
            var machine = await _unitOfWork.MachineRepo
                                            .GetByConditionAsync(m => m.Id == id)
                                            .FirstOrDefaultAsync();

            if (machine == null)
            {
                serviceResponse.Data = false;
                serviceResponse.StatusCode = 404;
                serviceResponse.Message = $"There is no machine with Id {id}";
                _logger.LogInformation("There is no machine with Id {Id}", id);
                return serviceResponse;
            }

            // Try to delete assinged flows to machine
            var machineFlows = await _unitOfWork.MachineFlowRepo.GetByConditionAsync(m => m.MachineId == id).ToListAsync();

            _unitOfWork.MachineFlowRepo.Delete(machineFlows);
            _unitOfWork.MachineRepo.Delete(machine);
            var deleted = await _unitOfWork.SaveAsync();

            if (!deleted)
            {
                serviceResponse.Data = false;
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = $"Failed to delete the machine with id {id}";
                _logger.LogInformation("Failed to delete the machine with id {Id}", id);
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machines deleted successfully";

            _logger.LogInformation("Machines deleted successfully of Id {Id}", id);

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<IEnumerable<MachineDto>>> GetMachineListAsync(Guid tenantId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<MachineDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Try to get machines
            var machines = await _unitOfWork.MachineRepo
                                            .GetByConditionAsync(m => m.TenantId == tenantId)
                                            .OrderByDescending(o => o.CreatedOn)
                                            .ToListAsync();

            // Task successful
            serviceResponse.Data = machines.Adapt<IEnumerable<MachineDto>>();
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

    public async Task<ServiceResponse<MachineDto>> GetMachineAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<MachineDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Try to get machines
            var machine = await _unitOfWork.MachineRepo
                                            .GetByConditionAsync(m => m.Id == id)
                                            .FirstOrDefaultAsync();

            if (machine == null)
            {
                serviceResponse.Message = $"There is no machine with Id {id}";
                _logger.LogInformation("There is no machine with Id {Id}", id);
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = machine.Adapt<MachineDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machines retrived successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<MachineDto>> UpdateMachineAsync(UpdateMachineDto updateMachineDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<MachineDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            var machine = await _unitOfWork.MachineRepo
            .GetByConditionAsync(m => m.Id == updateMachineDto.MachineId)
            .FirstOrDefaultAsync();

            if (machine == null)
            {
                serviceResponse.Message = $"Machine Not found with id {updateMachineDto.MachineId}.";
                _logger.LogInformation("There is no machine with Id {Id}", updateMachineDto.MachineId);
                return serviceResponse;
            }

            machine.Hostname = updateMachineDto.Hostname;
            machine.IPAddress = updateMachineDto.IPAddress;
            machine.Name = updateMachineDto.Name;
            machine.IsDisabled = updateMachineDto.IsDisabled;
            machine.Environment = updateMachineDto.Environment;

            _unitOfWork.MachineRepo.Update(machine);
            var completed = await _unitOfWork.SaveAsync();

            if (!completed)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Failed to udpate machine. Please try again.";
                _logger.LogInformation("Failed to update machine with Id {Id}", updateMachineDto.MachineId);
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = machine.Adapt<MachineDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machine updated successfully.";
            _logger.LogInformation("Machine updated successfully with Id {Id}", updateMachineDto.MachineId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<bool>> RemoveAllOperationsAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400
        };

        try
        {
            // Try to get machines
            var machine = await _unitOfWork.MachineRepo
                                            .GetByConditionAsync(m => m.Id == id)
                                            .FirstOrDefaultAsync();

            if (machine == null)
            {
                serviceResponse.Data = false;
                serviceResponse.StatusCode = 404;
                serviceResponse.Message = $"There is no machine with Id {id}";
                _logger.LogInformation("There is no machine with Id {Id}", id);
                return serviceResponse;
            }

            // Try to delete assinged flows to machine
            var machineFlows = await _unitOfWork.MachineFlowRepo.GetByConditionAsync(m => m.MachineId == id).ToListAsync();

            _unitOfWork.MachineFlowRepo.Delete(machineFlows);
            var deleted = await _unitOfWork.SaveAsync();

            if (!deleted)
            {
                serviceResponse.Data = false;
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = $"Failed to delete the machine with id {id}";
                _logger.LogInformation("Failed to delete the machine with id {Id}", id);
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "All assinged flows/agents are removed successfully";

            _logger.LogInformation("Machines deleted successfully of Id {Id}", id);

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }


    /// <summary>
    /// this method to get the status of the machine through
    /// </summary>
    /// <param name="machineId"></param>
    /// <returns></returns>
    public async Task<MachineStatusTypeEnum> GetMachineStatusAsync(Guid machineId)
    {
        MachineStatusTypeEnum machineStatus;
        try
        {
            // Try to get machines
            var machine = await _unitOfWork.MachineRepo
                                            .GetByConditionAsync(m => m.Id == machineId)
                                            .FirstOrDefaultAsync();

            if (machine == null)
            {
                _logger.LogInformation("There is no machine with Id {Id}", machineId);
                return MachineStatusTypeEnum.Ideal;
            }

            machineStatus = machine.Status;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            machineStatus = MachineStatusTypeEnum.Ideal;
        }

        return machineStatus;
    }
}