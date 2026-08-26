namespace WorkspaceAPIs.Services;

public class FlowsTableService : IFlowsTableService
{
    private readonly ILogger<FlowsTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IFlowVersionService _flowVersionService;
    private readonly IFlowUserService _flowUserService;
    private readonly IResourceShareService _resourceShareService;

    public FlowsTableService(
        ILogger<FlowsTableService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ICurrentTenantService currentTenantService,
        IFlowVersionService flowVersionService,
        IFlowUserService flowUserService,
        IResourceShareService resourceShareService)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
        _flowVersionService = flowVersionService;
        _flowUserService = flowUserService;
        _resourceShareService = resourceShareService;
    }

    // Retrieves all flows created by the user.
    public async Task<ServiceResponse<IEnumerable<FlowsTableDto>>> GetFlowsAsync(bool isPersonal)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<FlowsTableDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Retrieve flows based on ownership or shared access
            List<Flow> flows = new();
            Dictionary<Guid, ResourceAccessTypeEnum>? resourceAccess = new();

            if (isPersonal)
            {
                // Return only flows created by current user
                flows = await _unitOfWork.FlowRepo
                    .GetByConditionAsync(w => w.CreatedByUserId == _userId)
                    .OrderByDescending(w => w.CreatedOn)
                    .Include(i => i.FlowComments)
                    .Include(i => i.FlowVersions)
                    .Include(i => i.CreatedByUser)
                    .ToListAsync();
            }
            else
            {
                // Retrieve accessible resource ids with access levels
                resourceAccess = await _resourceShareService.GetAccessibleResourcesWithAccessAsync(
                    _userId,
                    ResourceTypeEnum.Flow,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                    }
                );

                // Retrieve shared flows
                flows = await _unitOfWork.FlowRepo
                    .GetByConditionAsync(w =>
                        w.CreatedByUserId != _userId &&
                        (
                            w.IsTenantWideAccess ||
                            resourceAccess.Keys.Contains(w.Id)
                        )
                    )
                    .OrderByDescending(w => w.CreatedOn)
                    .Include(i => i.FlowComments)
                    .Include(i => i.FlowVersions)
                    .Include(i => i.CreatedByUser)
                    .ToListAsync();
            }

            // Map the flow entities to DTOs
            var flowDtoList = flows.Adapt<List<FlowsTableDto>>();

            // Set the access level for each flow:
            // - Personal flows are always owned by the current user.
            // - Shared flows use the access level from the resource access map,
            //   defaulting to View when no explicit permission is found.
            flowDtoList.ForEach(fe =>
            {
                fe.AccessLevel = isPersonal
                    ? ResourceAccessTypeEnum.Owner
                    : resourceAccess.GetValueOrDefault(fe.Id, ResourceAccessTypeEnum.View);
            });

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
            // Validate flow uniqueness at the tenant level.
            // The DB unique index is (TenantId, Name), so the check must bypass the
            // space-scoped global query filter and match on the current tenant only.
            var flowAlreadyExists = await _unitOfWork.FlowRepo
                                                     .GetByConditionAsync(w =>
                                                        w.TenantId == _currentTenantService.CurrentTenantId &&
                                                        w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower())
                                                     .IgnoreQueryFilters()
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
            // Validate flow name uniqueness at the tenant level.
            // The DB unique index is (TenantId, Name), so the check must bypass the
            // space-scoped global query filter and match on the current tenant only.
            var flowAlreadyExists = await _unitOfWork.FlowRepo
                                                     .GetByConditionAsync(w =>
                                                        w.TenantId == _currentTenantService.CurrentTenantId &&
                                                        w.Name.ToLower() == flowsTableDto.Name.ToLower())
                                                     .IgnoreQueryFilters()
                                                     .FirstOrDefaultAsync();

            // Flow already exists
            if (flowAlreadyExists != null)
            {
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
                return serviceResponse;
            }

            // Assign creator ownership
            if (!await _resourceShareService.AssignOwnerAsync(_userId, newFlow.Id, ResourceTypeEnum.Flow))
            {
                serviceResponse.Message = "Failed assigning ownership.";
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
                                        )
                                        .Include(i => i.FlowUsers)
                                        .Include(i => i.FlowVersions)
                                        .SingleOrDefaultAsync();

            // Flow does not exist
            if (flow == null)
            {
                serviceResponse.Message = "Flow does not exist";
                return serviceResponse;
            }


            // Guard: Prevent disabling a flow that has published versions
            if (flowsTableDto.IsDisabled == true && flow.FlowVersions?.Any(v => v.IsPublished) == true)
            {
                _logger.LogWarning(
                    "Flow disable denied. FlowId: {FlowId} has published versions.",
                    flow.Id
                );
                serviceResponse.Message = "Flow cannot be disabled because it has published versions.";
                return serviceResponse;
            }

            // Validate update permission
            var (canEdit, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                flow.Id,
                ResourceTypeEnum.Flow,
                flow.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canEdit)
            {
                _logger.LogWarning("Unauthorized flow update. User {UserId}, Flow {FlowId}", _userId, flow.Id);
                serviceResponse.Message = "You do not have access to update this flow.";
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

            var (canDelete, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                flow.Id,
                ResourceTypeEnum.Flow,
                flow.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                }
            );

            if (!canDelete)
            {
                serviceResponse.Message = "You do not have access to delete this flow.";
                return serviceResponse;
            }

            // TODO: Check flow relationship with other entities

            await _resourceShareService.DeleteResourceSharesAsync(flow.Id, ResourceTypeEnum.Flow);

            // Delete flow
            _unitOfWork.FlowRepo.Delete(flow);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
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
                serviceResponse.Message = "Flows do not exist";
                return serviceResponse;
            }

            // Check if the user is the creator or has required access (Owner/Edit)
            foreach (var flow in flows)
            {
                var (canDelete, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                    _userId,
                    flow.Id,
                    ResourceTypeEnum.Flow,
                    flow.CreatedByUserId,
                    false,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                    }
                );

                if (!canDelete)
                {
                    serviceResponse.Message = "You do not have access to delete one or more flows.";
                    return serviceResponse;
                }

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