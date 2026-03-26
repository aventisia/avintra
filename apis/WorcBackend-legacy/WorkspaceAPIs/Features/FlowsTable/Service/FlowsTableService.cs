namespace WorkspaceAPIs.Services;

public class FlowsTableService : IFlowsTableService
{
    private readonly ILogger<FlowsTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly IFlowVersionService _flowVersionService;
    private readonly IFlowUserService _flowUserService;

    public FlowsTableService(
        ILogger<FlowsTableService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IFlowVersionService flowVersionService,
        IFlowUserService flowUserService)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _flowVersionService = flowVersionService;
        _flowUserService = flowUserService;
    }

    // Retrieves all flows created by the user.
    public async Task<ServiceResponse<IEnumerable<FlowsTableDto>>> GetFlowsAsync()
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
                    w.CreatedByUserId == _userId ||
                    (
                        w.FlowUsers != null && w.FlowUsers.Any(a => a.UserId == _userId)
                    )
                ) // TODO: Update condition
                .OrderByDescending(w => w.CreatedOn)
                .Include(i => i.FlowUsers)
                .Include(i => i.CreatedByUser)
                .ToListAsync();

            // Map the list of flows to a list of FlowsTableDto using the Adapt method
            var flowDtoList = flows.Adapt<List<FlowsTableDto>>();
            foreach (var flowDto in flowDtoList)
            {
                // Try to find the original flow by matching ID
                var originalFlow = flows.FirstOrDefault(f => f.Id == flowDto.Id);
                if (originalFlow is null)
                    continue;

                // Assign 'Owner' if the current user is the creator
                if (originalFlow.CreatedByUserId == _userId)
                {
                    flowDto.AccessType = ProjectUserAccessEnum.Owner;
                }
                else
                {
                    // Otherwise, find the user's access type in FlowUsers, defaulting to 'View'
                    var userAccess = originalFlow.FlowUsers?.FirstOrDefault(fu => fu.UserId == _userId);
                    flowDto.AccessType = userAccess?.Type ?? ProjectUserAccessEnum.View;
                }
            }

            // Task successful
            serviceResponse.Data = flowDtoList;
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
    public async Task<ServiceResponse<TrueFalseResultDto>> IsFlowNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
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

            // Insert flow
            await _unitOfWork.FlowRepo.InsertAsync(newFlow);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new flow");
                return serviceResponse;
            }

            // Create a new FlowUserDto to associate the user with the flow
            var flowUserDto = new FlowUserDto()
            {
                FlowId = newFlow.Id,
                UserId = _userId,
                Type = ProjectUserAccessEnum.Owner
            };

            // Insert the FlowUserDto to associate the user with the flow
            await _flowUserService.InsertFlowUserAsync(flowUserDto);

            // Insert a flow version
            var flowVersion = new FlowVersionDto
            {
                FlowId = newFlow.Id,
                IsDraft = false,
                IsLocked = false
            };

            await _flowVersionService.InsertFlowVersionAsync(flowVersion);

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
                                            (
                                                w.CreatedByUserId == _userId ||
                                                (
                                                    w.FlowUsers != null && w.FlowUsers.Any(a => a.UserId == _userId)
                                                )
                                            )
                                        ).Include(i => i.FlowUsers)
                                        .SingleOrDefaultAsync();

            // Flow does not exist
            if (flow == null)
            {
                _logger.LogInformation($"Flow does not exist");
                serviceResponse.Message = "Flow does not exist";
                return serviceResponse;
            }

            // Check if the user is the creator or has the required access (Owner/Edit)
            var flowUserAccess = flow.FlowUsers?.FirstOrDefault(w =>
                w.FlowId == flow.Id &&
                w.UserId == _userId &&
                (w.Type == ProjectUserAccessEnum.Owner || w.Type == ProjectUserAccessEnum.Edit)
            );

            // Allow access if the user is the creator, else check if they have access
            if (flow.CreatedByUserId != _userId && flowUserAccess == null)
            {
                _logger.LogWarning($"User {_userId} is not authorized to modify this flow.");
                serviceResponse.Message = "You don't have access to modify this flow.";
                return serviceResponse;
            }

            // TODO: Uncomment and implement flow name uniqueness check when needed
            // // Validate flow name uniqueness
            // var flowAlreadyExists = await _unitOfWork.FlowRepo
            //                                          .GetByConditionAsync(w =>
            //                                             w.Name.ToLower() == flowsTableDto.Name.ToLower() &&
            //                                             w.CreatedByUserId == _userId &&
            //                                             w.Id != flowsTableDto.Id)
            //                                          .FirstOrDefaultAsync();

            // // Flow already exists
            // if (flowAlreadyExists != null)
            // {
            //     _logger.LogInformation($"Flow name already exists");
            //     serviceResponse.StatusCode = 409;
            //     serviceResponse.Message = "A flow with same Name already exists. Please enter a unique name";
            //     return serviceResponse;
            // }

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
                                            (
                                                w.CreatedByUserId == _userId ||
                                                (
                                                    w.FlowUsers != null && w.FlowUsers.Any(a => a.UserId == _userId)
                                                )
                                            )
                                        )
                                        .Include(i => i.FlowUsers)
                                        .Include(i => i.FlowVersions)
                                        .SingleOrDefaultAsync();

            // Flow does not exist
            if (flow == null)
            {
                _logger.LogInformation($"Flow does not exist");
                serviceResponse.Message = "Flow does not exist";
                return serviceResponse;
            }

            /*
            * TODO:
            * Create a dedicated PublishedFlows table.
            * Store a snapshot of published flows instead of relying on IsPublished flag.
            * This will make published versions immutable and safer.
            */
            //  Prevent deletion if any version of this flow is published
            // Prevent deletion if any version of this flow is published
            if (flow.FlowVersions?.Any(v => v.IsPublished) == true)
            {
                _logger.LogWarning("Cannot delete flow because a published version exists.");
                serviceResponse.Message = "Cannot delete flow while a published version exists.";
                return serviceResponse;
            }

            // Check if the user is the creator or has the required access (Owner/Edit)
            var flowUserAccess = flow.FlowUsers?.FirstOrDefault(w =>
                w.FlowId == flow.Id &&
                w.UserId == _userId &&
                w.Type == ProjectUserAccessEnum.Owner
            );

            // Allow access if the user is the creator, else check if they have access
            if (flow.CreatedByUserId != _userId && flowUserAccess == null)
            {
                _logger.LogWarning($"User {_userId} is not authorized to delete this flow.");
                serviceResponse.Message = "You don't have access to delete this flow.";
                return serviceResponse;
            }

            // TODO: Check flow relationship with other entities

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

    // Deletes multiple flows by their IDs.
    public async Task<ServiceResponse<bool>> DeleteFlowsAsync(List<Guid> ids)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete flows. Please try again"
        };

        try
        {
            // Validate flows existence
            var flows = await _unitOfWork.FlowRepo
                                            .GetByConditionAsync(w =>
                                                ids.Contains(w.Id) &&
                                                (
                                                    w.CreatedByUserId == _userId ||
                                                    (
                                                        w.FlowUsers != null && w.FlowUsers.Any(a => a.UserId == _userId)
                                                    )
                                                )
                                            )
                                            .Include(i => i.FlowUsers)
                                            .Include(i => i.FlowVersions)
                                            .ToListAsync();

            // Flows do not exist
            if (flows.Count == 0)
            {
                _logger.LogInformation($"Flows do not exist");
                serviceResponse.Message = "Flows do not exist";
                return serviceResponse;
            }

            // Check if the user is the creator or has required access (Owner/Edit)
            foreach (var flow in flows)
            {
                var flowUserAccess = flow.FlowUsers?.FirstOrDefault(w =>
                    w.FlowId == flow.Id &&
                    w.UserId == _userId &&
                    (w.Type == ProjectUserAccessEnum.Owner || w.Type == ProjectUserAccessEnum.Edit)
                );

                /*
                * TODO:
                * Create a dedicated PublishedFlows table.
                * Store a snapshot of published flows instead of relying on IsPublished flag.
                * This will make published versions immutable and safer.
                */
                //  Prevent deletion if any version of this flow is published
                // Prevent deletion if any version of this flow is published
                if (flow.FlowVersions?.Any(v => v.IsPublished) == true)
                {
                    _logger.LogWarning("Cannot delete flow because a published version exists.");
                    serviceResponse.Message = "Cannot delete flow while a published version exists.";
                    return serviceResponse;
                }

                // Allow access if the user is the creator, else check if they have access
                if (flow.CreatedByUserId != _userId && flowUserAccess == null)
                {
                    _logger.LogWarning($"User {_userId} is not authorized to modify this flow.");
                    serviceResponse.Message = "You don't have access to modify this flow.";
                    return serviceResponse;
                }
            }

            // TODO: Check flow relationship with other entities

            // Delete flows
            _unitOfWork.FlowRepo.Delete(flows);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting flows");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{ids.Count} flows deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }
}