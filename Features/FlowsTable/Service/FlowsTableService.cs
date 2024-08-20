namespace WorkspaceAPIs.Services;

public class FlowsTableService : IFlowsTableService
{
    private readonly ILogger<FlowsTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public FlowsTableService(
        ILogger<FlowsTableService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves all flows associated with a project.
    public async Task<ServiceResponse<IEnumerable<FlowsTableDto>>> GetFlowsAsync(Guid projectId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<FlowsTableDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Get flows
            var flows = await _unitOfWork.FlowRepo
                                         .GetByConditionAsync(w =>
                                            w.ProjectId == projectId &&
                                            w.CreatedByUserId == _userId) // TODO: Update condition
                                         .OrderByDescending(w => w.CreatedOn)
                                         .ProjectToType<FlowsTableDto>()
                                         .ToListAsync();

            // Task successful
            serviceResponse.Data = flows.Adapt<IEnumerable<FlowsTableDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flows retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Checks the availability of a flow name.
    public async Task<ServiceResponse<TrueFalseResultDto>> IsFlowNameAvailableAsync(Guid projectId, CheckAvailabilityDto checkAvailabilityDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check flow name availability. Please try again"
        };

        try
        {
            // Validate flow uniqueness
            var flowAlreadyExists = await _unitOfWork.FlowRepo
                                                     .GetByConditionAsync(w =>
                                                        w.ProjectId == projectId &&
                                                        w.CreatedByUserId == _userId &&
                                                        w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower())
                                                     .FirstOrDefaultAsync();

            // Flow already exists
            if (flowAlreadyExists != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "A flow with same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow name is available";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Inserts a new flow.
    public async Task<ServiceResponse<FlowsTableDto>> InsertFlowAsync(FlowsTableDto flowsTableDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<FlowsTableDto>
        {
            Data = null,
            Message = "Failed to insert flow. Please try again"
        };

        try
        {
            // Validate flow name uniqueness
            var flowAlreadyExists = await _unitOfWork.FlowRepo
                                                     .GetByConditionAsync(w =>
                                                        w.Name.ToLower() == flowsTableDto.Name.ToLower() &&
                                                        w.ProjectId == flowsTableDto.ProjectId &&
                                                        w.CreatedByUserId == _userId)
                                                     .FirstOrDefaultAsync();

            // Flow already exists
            if (flowAlreadyExists != null)
            {
                _logger.LogInformation($"Flow already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A flow with same Name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Trim dto' string props
            flowsTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(flowsTableDto);

            // Default mapping
            var newFlow = flowsTableDto.Adapt<Flow>();
            newFlow.CreatedByUserId = _userId;
            newFlow.LastModifiedByUserId = _userId;

            // Add intial nodes and edges
            var (initialNodes, initialEdges) = Features.FlowsTable.Utils.InitialNodesAndEdgesUtil.GetInitialNodesAndEdges();
            newFlow.Nodes = initialNodes;
            newFlow.Edges = initialEdges;

            // Insert flow
            await _unitOfWork.FlowRepo.InsertAsync(newFlow);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new flow");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newFlow.Adapt<FlowsTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Updates an existing flow.
    public async Task<ServiceResponse<FlowsTableDto>> UpdateFlowAsync(FlowsTableDto flowsTableDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<FlowsTableDto>
        {
            Data = null,
            Message = "Failed to update flow. Please try again"
        };

        try
        {
            // Validate flow existence
            var flow = await _unitOfWork.FlowRepo
                                        .GetByConditionAsync(w =>
                                            w.Id == flowsTableDto.Id &&
                                            w.ProjectId == flowsTableDto.ProjectId &&
                                            w.CreatedByUserId == _userId)
                                        .SingleOrDefaultAsync();

            // Flow does not exist
            if (flow == null)
            {
                _logger.LogInformation($"Flow does not exist");
                serviceResponse.Message = "Flow does not exist";
                return serviceResponse;
            }

            // Validate flow name uniqueness
            var flowAlreadyExists = await _unitOfWork.FlowRepo
                                                     .GetByConditionAsync(w =>
                                                        w.Name.ToLower() == flowsTableDto.Name.ToLower() &&
                                                        w.ProjectId == flowsTableDto.ProjectId &&
                                                        w.CreatedByUserId == _userId &&
                                                        w.Id != flowsTableDto.Id)
                                                     .FirstOrDefaultAsync();

            // Flow already exists
            if (flowAlreadyExists != null)
            {
                _logger.LogInformation($"Flow name already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A flow with same Name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Trim dto' string props
            flowsTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(flowsTableDto);

            // Default mapping 
            flowsTableDto.Adapt(flow);
            flow.LastModifiedByUserId = _userId;
            flow.LastModifiedOn = DateTimeOffset.UtcNow;

            // Update flow
            _unitOfWork.FlowRepo.Update(flow);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating flow");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = flow.Adapt<FlowsTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes a flow by its ID.
    public async Task<ServiceResponse<bool>> DeleteFlowAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete flow. Please try again"
        };

        try
        {
            // Validate flow existence
            var flow = await _unitOfWork.FlowRepo
                                        .GetByConditionAsync(w =>
                                            w.Id == id &&
                                            w.CreatedByUserId == _userId)
                                        .SingleOrDefaultAsync();

            // Flow does not exist
            if (flow == null)
            {
                _logger.LogInformation($"Flow does not exist");
                serviceResponse.Message = "Flow does not exist";
                return serviceResponse;
            }

            //#PENDING: UPDATE THIS CHECK ONCE ENTITY IS FORMED
            // IMPORTANT: Check if any relationship exists and abort required
            //var relationshipExists = await _unitOfWork.FlowRepo
            //                                .DoesDependentEntitiesExistAsync(w => w.Id == id);

            //// Relationship exists
            //if (relationshipExists)
            //{
            //    _logger.LogInformation($"Cannot delete flow because it is linked with other records");
            //    serviceResponse.Message = "Cannot delete this flow because it is linked with other records";
            //    return serviceResponse;
            //}

            // Delete flow
            _unitOfWork.FlowRepo.Delete(flow);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting flow");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }
}