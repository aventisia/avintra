namespace WorkspaceAPIs.Services;

public class MachineFlowService : IMachineFlowService
{
    private readonly ILogger<MachineFlowService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public MachineFlowService(
        ILogger<MachineFlowService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Add new machine flow
    public async Task<ServiceResponse<MachineFlowDto>> InsertMachineFlowAsync(MachineFlowDto machineFlowDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<MachineFlowDto>
        {
            Data = null,
            Message = "Failed to add version flow. Please try again"
        };

        try
        {

            // Validate machine flow uniqueness
            var machineFlowAlreadyExists = await _unitOfWork.MachineFlowRepo
                                                    .GetByConditionAsync(w =>
                                                        w.FlowVersionId == machineFlowDto.FlowVersionId &&
                                                        w.MachineId == machineFlowDto.MachineId
                                                    )
                                                    .FirstOrDefaultAsync();

            // Machine flow already exists
            if (machineFlowAlreadyExists != null)
            {
                _logger.LogInformation($"Machine flow already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A machine flow with same flow version already exists. Please enter a unique flow version";
                return serviceResponse;
            }
            // Trim dto' string props
            machineFlowDto = TrimDtoStringPropsUtil.TrimDtoStringProps(machineFlowDto);

            // Default mapping
            var newMachineFlow = machineFlowDto.Adapt<MachineFlow>();
            newMachineFlow.CreatedByUserId = _userId;
            newMachineFlow.LastModifiedByUserId = _userId;

            // Insert machine
            await _unitOfWork.MachineFlowRepo.InsertAsync(newMachineFlow);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new machine flow");
                return serviceResponse;
            }
            // Task successful
            serviceResponse.Data = newMachineFlow.Adapt<MachineFlowDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machine flow created successfully";
            _logger.LogInformation("Machine flow created successfully with id {Id}", newMachineFlow.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Remove an machine flow by its ID
    public async Task<ServiceResponse<bool>> DeleteMachineFlowAsync(Guid machineFlowId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete machine flow. Please try again"
        };

        try
        {
            // Try to get machine flow
            var machineFlow = await _unitOfWork.MachineFlowRepo
                                            .GetByConditionAsync(m => m.Id == machineFlowId)
                                            .FirstOrDefaultAsync();

            // Machine flow does not exist
            if (machineFlow == null)
            {
                _logger.LogInformation($"Machine flow does not exist");
                serviceResponse.Message = "Machine flow does not exist";
                return serviceResponse;
            }

            // Delete machine flow
            _unitOfWork.MachineFlowRepo.Delete(machineFlow);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting machine flow");
                return serviceResponse;
            }


            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machine flow deleted successfully";

            _logger.LogInformation("Machine flow deleted successfully of Id {Id}", machineFlowId);

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieve all machine flows associated with machine and current user
    public async Task<ServiceResponse<IEnumerable<MachineFlowDto>>> GetMachineFlowsAsync(Guid? machineId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<MachineFlowDto>>
        {
            Data = null,
            Message = "Failed to retrieve machine flows, Please try again."
        };

        try
        {
            // Try to get machine flows
            var machineFlows = await _unitOfWork.MachineFlowRepo
                                            .GetByConditionAsync(m =>
                                                (machineId == null || m.MachineId == machineId) &&
                                                m.CreatedByUserId == _userId
                                            )
                                            .Include(fv => fv.FlowVersion)
                                            .ThenInclude(f => f.Flow)
                                            .Include(m => m.Machine)
                                            .Include(c => c.CreatedByUser)
                                            .Include(lm => lm.LastModifiedByUser)
                                            .OrderByDescending(o => o.CreatedOn)
                                            .AsNoTracking()
                                            .ToListAsync();

            // Task successful
            serviceResponse.Data = machineFlows.Adapt<IEnumerable<MachineFlowDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machine flows retrieved successfully";
            _logger.LogInformation("Machine flows retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieve an machine flow by its ID
    public async Task<ServiceResponse<MachineFlowDto>> GetMachineFlowAsync(Guid machineFlowId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<MachineFlowDto>
        {
            Data = null,
            Message = "Failed to retrieve machine flow, Please try again"
        };

        try
        {
            // Try to get machine flow
            var machineFlow = await _unitOfWork.MachineFlowRepo
                                            .GetByConditionAsync(m =>
                                                m.Id == machineFlowId && m.CreatedByUserId == _userId
                                            )
                                            .Include(fv => fv.FlowVersion)
                                            .ThenInclude(f => f.Flow)
                                            .Include(m => m.Machine)
                                            .Include(c => c.CreatedByUser)
                                            .Include(lm => lm.LastModifiedByUser)
                                            .AsNoTracking()
                                            .FirstOrDefaultAsync();

            if (machineFlow == null)
            {
                serviceResponse.Message = "Machine flow does not exist";
                _logger.LogInformation("There is no machine flow with Id {Id}", machineFlowId);
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = machineFlow.Adapt<MachineFlowDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machine flow retrieve successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Update an existence machine flow
    public async Task<ServiceResponse<MachineFlowDto>> UpdateMachineAsync(MachineFlowDto machineFlowDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<MachineFlowDto>
        {
            Data = null,
            Message = "Failed to update machine flow. Please try again"
        };

        try
        {
            // Validate machine flow existence
            var machineFlow = await _unitOfWork.MachineFlowRepo
                .GetByConditionAsync(m =>
                    m.Id == machineFlowDto.Id &&
                    m.CreatedByUserId == _userId
                )
                .FirstOrDefaultAsync();

            // Machine flow does not exist
            if (machineFlow == null)
            {
                _logger.LogInformation($"Machine flow does not exist");
                serviceResponse.Message = "Machine flow does not exist";
                return serviceResponse;
            }

            // Validate machine flow uniqueness
            var machineFlowAlreadyExists = await _unitOfWork.MachineFlowRepo
                            .GetByConditionAsync(m =>
                                m.FlowVersionId == machineFlowDto.FlowVersionId &&
                                m.MachineId == machineFlowDto.MachineId &&
                                m.Id != machineFlowDto.Id
                            )
                            .FirstOrDefaultAsync();

            // Machine flow already exists
            if (machineFlowAlreadyExists != null)
            {
                _logger.LogInformation($"Machine flow already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A machine flow with same flow version already exists. Please enter a unique version flow";
                return serviceResponse;
            }

            // Trim dto' string props
            machineFlowDto = TrimDtoStringPropsUtil.TrimDtoStringProps(machineFlowDto);

            // Default mapping 
            machineFlowDto.Adapt(machineFlow);
            machineFlow.LastModifiedByUserId = _userId;
            machineFlow.LastModifiedOn = DateTimeOffset.UtcNow;

            // Update machine flow
            _unitOfWork.MachineFlowRepo.Update(machineFlow);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating machine flow");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = machineFlow.Adapt<MachineFlowDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machine flow updated successfully.";
            _logger.LogInformation("Machine flow updated successfully with Id {Id}", machineFlow.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes multiple machine flows by their IDs.
    public async Task<ServiceResponse<bool>> DeleteMachineFlowsAsync(IEnumerable<Guid> machineFlowIds)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete machine flows. Please try again"
        };

        try
        {
            // Validate machine flows existence
            var machineFlows = await _unitOfWork.MachineFlowRepo
                                            .GetByConditionAsync(w =>
                                                w.CreatedByUserId == _userId &&
                                                machineFlowIds.Contains(w.Id))
                                            .ToListAsync();

            // Machine flows do not exist
            if (machineFlows.Count == 0)
            {
                _logger.LogInformation($"Machine flows do not exist");
                serviceResponse.Message = "Machine flows do not exist";
                return serviceResponse;
            }

            // Delete machine flows
            _unitOfWork.MachineFlowRepo.Delete(machineFlows);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting machine flows");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{machineFlows.Count} machine flows deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }
}