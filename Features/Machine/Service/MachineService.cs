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
}