namespace WorkspaceAPIs.Services;

public class MachineFlowService : IMachineFlowService
{
    private readonly ILogger<MachineFlowService> _logger;
    private readonly IUnitOfWork _unitOfWork;

    public MachineFlowService(
        ILogger<MachineFlowService> logger,
        IUnitOfWork unitOfWork)
    {
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
            var machineFlowAlreadyExists = await _unitOfWork.Machine_FlowVersionRepo
                                                    .GetByConditionAsync(w =>
                                                        w.FlowVersionId == machineFlowDto.FlowVersionId &&
                                                        w.MachineId == machineFlowDto.MachineId
                                                    )
                                                    .FirstOrDefaultAsync();

            // Machine flow already exists
            if (machineFlowAlreadyExists != null)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A machine flow with same flow version already exists. Please enter a unique flow version";
                return serviceResponse;
            }
            // Trim dto' string props
            machineFlowDto = TrimDtoStringPropsUtil.TrimDtoStringProps(machineFlowDto);

            // Default mapping
            var newMachineFlow = machineFlowDto.Adapt<Machine_FlowVersion>();

            // Insert machine
            await _unitOfWork.Machine_FlowVersionRepo.InsertAsync(newMachineFlow);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }
            // Task successful
            serviceResponse.Data = newMachineFlow.Adapt<MachineFlowDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machine flow created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Remove a machine flow by its composite key
    public async Task<ServiceResponse<bool>> DeleteMachineFlowAsync(Guid machineId, Guid flowVersionId)
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
            var machineFlow = await _unitOfWork.Machine_FlowVersionRepo
                                            .GetByConditionAsync(m =>
                                                m.MachineId == machineId &&
                                                m.FlowVersionId == flowVersionId)
                                            .FirstOrDefaultAsync();

            // Machine flow does not exist
            if (machineFlow == null)
            {
                serviceResponse.Message = "Machine flow does not exist";
                return serviceResponse;
            }

            // Delete machine flow
            _unitOfWork.Machine_FlowVersionRepo.Delete(machineFlow);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }


            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machine flow deleted successfully";

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
            var machineFlows = await _unitOfWork.Machine_FlowVersionRepo
                                            .GetByConditionAsync(m =>
                                                machineId == null || m.MachineId == machineId
                                            )
                                            .Include(fv => fv.FlowVersion)
                                            .ThenInclude(f => f.Flow)
                                            .Include(m => m.Machine)
                                            .OrderByDescending(o => o.FlowVersion != null ? o.FlowVersion.CreatedOn : DateTimeOffset.MinValue)
                                            .AsNoTracking()
                                            .ToListAsync();

            // Task successful
            serviceResponse.Data = machineFlows.Adapt<IEnumerable<MachineFlowDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machine flows retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieve a machine flow by its composite key
    public async Task<ServiceResponse<MachineFlowDto>> GetMachineFlowAsync(Guid machineId, Guid flowVersionId)
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
            var machineFlow = await _unitOfWork.Machine_FlowVersionRepo
                                            .GetByConditionAsync(m =>
                                                m.MachineId == machineId &&
                                                m.FlowVersionId == flowVersionId
                                            )
                                            .Include(fv => fv.FlowVersion)
                                            .ThenInclude(f => f.Flow)
                                            .Include(m => m.Machine)
                                            .AsNoTracking()
                                            .FirstOrDefaultAsync();

            if (machineFlow == null)
            {
                serviceResponse.Message = "Machine flow does not exist";
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
            var machineFlow = await _unitOfWork.Machine_FlowVersionRepo
                .GetByConditionAsync(m =>
                    m.FlowVersionId == machineFlowDto.FlowVersionId &&
                    m.MachineId == machineFlowDto.MachineId
                )
                .FirstOrDefaultAsync();

            // Machine flow does not exist
            if (machineFlow == null)
            {
                serviceResponse.Message = "Machine flow does not exist";
                return serviceResponse;
            }

            // There are no mutable columns on Machine_FlowVersion beyond the composite key.
            // Keep endpoint backward-compatible by returning the existing relation as-is.
            serviceResponse.Data = machineFlow.Adapt<MachineFlowDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Machine flow is already up to date.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes multiple machine flows by their composite keys.
    public async Task<ServiceResponse<bool>> DeleteMachineFlowsAsync(IEnumerable<MachineFlowKeyDto> machineFlowKeys)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete machine flows. Please try again"
        };

        try
        {
            var keyList = machineFlowKeys?.DistinctBy(k => new { k.MachineId, k.FlowVersionId }).ToList() ?? new List<MachineFlowKeyDto>();

            if (keyList.Count == 0)
            {
                serviceResponse.Message = "No machine flow keys were provided";
                return serviceResponse;
            }

            var machineIds = keyList.Select(k => k.MachineId).Distinct().ToList();
            var flowVersionIds = keyList.Select(k => k.FlowVersionId).Distinct().ToList();

            // Validate machine flows existence
            var machineFlowCandidates = await _unitOfWork.Machine_FlowVersionRepo
                                                    .GetByConditionAsync(w =>
                                                        machineIds.Contains(w.MachineId) &&
                                                        flowVersionIds.Contains(w.FlowVersionId))
                                                    .ToListAsync();

            var machineFlows = machineFlowCandidates
                .Where(w => keyList.Any(k => k.MachineId == w.MachineId && k.FlowVersionId == w.FlowVersionId))
                .ToList();

            // Machine flows do not exist
            if (machineFlows.Count == 0)
            {
                serviceResponse.Message = "Machine flows do not exist";
                return serviceResponse;
            }

            // Delete machine flows
            _unitOfWork.Machine_FlowVersionRepo.Delete(machineFlows);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
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