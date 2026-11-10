namespace WorkspaceAPIs.Services;

public class FlowVersionService : IFlowVersionService
{
    private readonly ILogger<FlowVersionService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserManagementGuardService _userManagementGuardService;
    private readonly IResourceUserAccessService _resourceUserAccessService;
    private readonly Guid _userId;

    public FlowVersionService(
        ILogger<FlowVersionService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IUserManagementGuardService userManagementGuardService,
        IResourceUserAccessService resourceUserAccessService)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _userManagementGuardService = userManagementGuardService;
        _resourceUserAccessService = resourceUserAccessService;
    }

    // Get a list of flow versions of a single flow using flow identifier
    public async Task<ServiceResponse<IEnumerable<FlowVersionDto>>> GetFlowVersionsAsync(Guid flowId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<FlowVersionDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Retrieve the flow and ensure it exists.
            // A flow ID is globally unique within a tenant, so the lookup is
            // intentionally NOT scoped to the current space query filter. Space
            // access is enforced separately via GetResourceAccessAsync below.
            var flow = await _unitOfWork.FlowRepo
                .GetByConditionAsync(w => w.Id == flowId)
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync();

            if (flow == null)
            {
                serviceResponse.Message = "Flow not found.";
                return serviceResponse;
            }

            // Validate user's access permissions for viewing the flow
            var (canView, accessLevel) = await _resourceUserAccessService.GetResourceAccessAsync(
                _userId,
                flow.Id,
                ResourceTypeEnum.Flow,
                flow.CreatedByUserId,
                flow.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                });

            if (!canView)
            {
                serviceResponse.Message = "You do not have access to view this flow versions.";
                return serviceResponse;
            }


            //Try to get flow versions
            // Like the flow, the version lookup is not scoped to the current
            // space query filter because access has already been validated above.
            var flowVersions = await _unitOfWork.FlowVersionRepo
            .GetByConditionAsync(w =>
                w.FlowId == flowId &&
                (
                    !w.IsPublished ||
                    (
                        _userManagementGuardService.HasRole(CustomRolesEnum.OM.ToString()) ||
                        _userManagementGuardService.HasRole(CustomRolesEnum.TU.ToString())
                    )
                )
            )
            .Include(i => i.Flow)
            .Include(i => i.CreatedByUser)
            .IgnoreQueryFilters()
            .OrderByDescending(o => o.VersionNumber)
            .ToListAsync();

            // Task successful
            serviceResponse.Data = flowVersions.Adapt<IEnumerable<FlowVersionDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Versions retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Creates a flow version
    public async Task<ServiceResponse<FlowVersionDto>> InsertFlowVersionAsync(FlowVersionDto flowVersionDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<FlowVersionDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get flow
            var flow = await _unitOfWork.FlowRepo
                .GetByConditionAsync(w =>
                    w.Id == flowVersionDto.FlowId
                )
                .Include(c => c.CreatedByUser)
                .SingleOrDefaultAsync();

 
            // // Check if the user is the creator or has the required access (Owner/Edit)
            // var flowUserAccess = flow.FlowUsers?.FirstOrDefault(w =>
            //     w.FlowId == flow.Id &&
            //     w.UserId == _userId &&
            //     (w.Type == ProjectUserAccessEnum.Owner || w.Type == ProjectUserAccessEnum.Edit)
            // );

            // // Allow access if the user is the creator, else check if they have access
            // if (flow.CreatedByUserId != _userId && flowUserAccess == null)
            // {
            //     _logger.LogWarning($"User {_userId} is not authorized to create new flow version.");
            //     serviceResponse.Message = "You don't have access to create new flow version.";
            //     return serviceResponse;
            // }
            
            // Validate update permission
            var (canEdit, accessLevel) = await _resourceUserAccessService.GetResourceAccessAsync(
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
                serviceResponse.Message = "You do not have access to create new version.";
                return serviceResponse;
            }

            //Get count of versions of a related flow
            var versionCount = await _unitOfWork.FlowVersionRepo.GetFlowVersionCountAsync(flowVersionDto.FlowId);

            // Default mapping
            var newFlowVersion = flowVersionDto.Adapt<FlowVersion>();
            newFlowVersion.IsLocked = false;
            newFlowVersion.IsDraft = false;
            newFlowVersion.CreatedByUserId = _userId;
            newFlowVersion.LastModifiedByUserId = _userId;
            newFlowVersion.VersionNumber = versionCount + 1;

            // Add initial nodes and edges
            newFlowVersion.ReactFlowObject = Features.FlowVersion.Utils.InitialNodesAndEdgesUtil.GetInitialNodesAndEdges(flow.Type);

            //Insert a flow version
            await _unitOfWork.FlowVersionRepo.InsertAsync(newFlowVersion);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newFlowVersion.Adapt<FlowVersionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Version added successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            Console.WriteLine(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Updates a flow version
    public async Task<ServiceResponse<FlowVersionDto>> UpdateFlowVersionAsync(FlowVersionDto flowVersionDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<FlowVersionDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Validate flow version existence
            var existingFlowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    w.Id == flowVersionDto.Id &&
                    (
                        w.CreatedByUserId == _userId ||
                        (
                            w.Flow.FlowUsers != null && w.Flow.FlowUsers.Any(a => a.UserId == _userId)
                        )
                    )
                )
                .Include(i => i.Flow)
                .ThenInclude(i2 => i2.FlowUsers)
                .SingleOrDefaultAsync();

            // Flow version does not exist
            if (existingFlowVersion == null)
            {
                serviceResponse.Message = "Version does not exist";
                return serviceResponse;
            }

            // TODO: Enable this guard if business rules require preventing disabling of published versions
            // Guard: Prevent disabling a published flow version
            // if (flowVersionDto?.IsDisabled == true && existingFlowVersion.IsPublished)
            // {
            //     _logger.LogWarning(
            //         "Flow version disable denied. FlowVersionId: {FlowVersionId} is published.",
            //         existingFlowVersion.Id
            //     );

            //     serviceResponse.Message = "Published version cannot be disabled.";
            //     return serviceResponse;
            // }

            // Check if the user is the creator or has the required access (Owner/Edit)
            var flowUserAccess = existingFlowVersion.Flow.FlowUsers?.FirstOrDefault(w =>
                w.FlowId == existingFlowVersion.Flow.Id &&
                w.UserId == _userId &&
                (w.Type == ProjectUserAccessEnum.Owner || w.Type == ProjectUserAccessEnum.Edit)
            );

            // Allow access if the user is the creator, else check if they have access
            if (existingFlowVersion.Flow.CreatedByUserId != _userId && flowUserAccess == null)
            {
                _logger.LogWarning($"User {_userId} is not authorized to modify this flow.");
                serviceResponse.Message = "You don't have access to modify this flow.";
                return serviceResponse;
            }

            // IMPORTANT NOTE: archive and unarchive act on the whole agent and detach or restore
            // its relationships, so the per-version update never flips IsArchived; only the
            // agent endpoints own those transitions.
            if (existingFlowVersion.IsArchived != flowVersionDto.IsArchived)
            {
                _logger.LogWarning(
                    "Flow version archive change denied. FlowVersionId: {FlowVersionId} must be archived or unarchived through the agent endpoints.",
                    existingFlowVersion.Id
                );
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Use the Archive or Unarchive action on the Agents list.";
                return serviceResponse;
            }

            // Get count of versions of a related flow
            var relatedFlowVersionCount = await _unitOfWork.FlowVersionRepo.GetFlowVersionCountAsync(existingFlowVersion.FlowId);

            // Map the other properties from the DTO
            existingFlowVersion = flowVersionDto.Adapt(existingFlowVersion);

            // Map the updated properties
            existingFlowVersion.IsLocked = false;
            existingFlowVersion.IsDraft = false;
            existingFlowVersion.CreatedByUserId = _userId;
            existingFlowVersion.LastModifiedByUserId = _userId;
            existingFlowVersion.VersionNumber = relatedFlowVersionCount + 1;

            // Update the existing flow version
            _unitOfWork.FlowVersionRepo.Update(existingFlowVersion);

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = existingFlowVersion.Adapt<FlowVersionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow version updated successfully";
        }
        catch (Exception exception)
        {
            _logger.LogError(exception.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Updates the execution settings for the specified flow version.
    public async Task<ServiceResponse<bool>> UpdateFlowVersionSettingsAsync(Guid flowVersionId, ExecutionSettings executionSettings)
    {
        // Initialize ServiceResponse with a failed response by default.
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to update floe version settings. Please try again."
        };

        try
        {
            // Validate that the flow version exists and the user has access to it.
            var existingFlowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w => w.Id == flowVersionId)
                .Include(i => i.Flow)
                .SingleOrDefaultAsync();

            // Flow version does not exist.
            if (existingFlowVersion == null)
            {
                serviceResponse.Message = "Flow version does not exist.";
                return serviceResponse;
            }

            // Serialize and store the execution settings as a JSON object.
            existingFlowVersion.Settings = System.Text.Json.JsonSerializer.SerializeToDocument(executionSettings);

            // Update audit information.
            existingFlowVersion.LastModifiedByUserId = _userId;
            existingFlowVersion.LastModifiedOn = DateTimeOffset.UtcNow;

            // Mark the entity as modified.
            _unitOfWork.FlowVersionRepo.Update(existingFlowVersion);

            // Persist changes.
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Operation completed successfully.
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Execution settings updated successfully.";
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "An error occurred while updating execution settings for flow version {FlowVersionId}.",
                flowVersionId);
        }

        return serviceResponse;
    }

    //Deletes a flow version
    public async Task<ServiceResponse<bool>> DeleteFlowVersionAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400
        };

        try
        {
            //Try to get version using identifier
            var flowVersion = await _unitOfWork.FlowVersionRepo
            .GetByConditionAsync(w =>
                w.Id == id                
            )
            .Include(i => i.Flow)
            .SingleOrDefaultAsync();

            //Check if version not exists
            if (flowVersion == null)
            {
                serviceResponse.Message = "Version does not exist";
                return serviceResponse;
            }

            /*
            * TODO:
            * Create a dedicated PublishedFlows table.
            * Store a snapshot of published flows instead of relying on IsPublished flag.
            * This will make published versions immutable and safer.
            */
            // Prevent deletion if this version is published
            if (flowVersion.IsPublished)
            {
                _logger.LogWarning("Cannot delete a published flow version.");
                serviceResponse.Message = "Published versions cannot be deleted.";
                return serviceResponse;
            }
            var (canDelete, accessLevel) = await _resourceUserAccessService.GetResourceAccessAsync(
                _userId,
                flowVersion.Flow.Id,
                ResourceTypeEnum.Flow,
                flowVersion.Flow.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                }
            );

            if (!canDelete)
            {
                serviceResponse.Message = "You do not have access to delete this flow version.";
                return serviceResponse;
            }

            // // Check if the user is the creator or has the required access (Owner/Edit)
            // var flowUserAccess = flowVersion.Flow.FlowUsers?.FirstOrDefault(w =>
            //     w.FlowId == flowVersion.Flow.Id &&
            //     w.UserId == _userId &&
            //     (w.Type == ProjectUserAccessEnum.Owner)
            // );

            // // Allow access if the user is the creator, else check if they have access
            // if (flowVersion.Flow.CreatedByUserId != _userId && flowUserAccess == null)
            // {
            //     _logger.LogWarning($"User {_userId} is not authorized to modify this flow.");
            //     serviceResponse.Message = "You don't have access to modify this flow.";
            //     return serviceResponse;
            // }

            //Delete version
            _unitOfWork.FlowVersionRepo.Delete(flowVersion);

            //Delete-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Version deleted successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Searches flow versions by flow name and version, with an options to include unpublished versions and based on flow types.
    public async Task<ServiceResponse<IEnumerable<SearchFlowVersionResDto>>> SearchFlowVersionsAsync(SearchFlowVersionReqDto searchFlowVersionReqDto)
    {
        // Initialize ServiceResponse to indicate failure by default.
        var serviceResponse = new ServiceResponse<IEnumerable<SearchFlowVersionResDto>>
        {
            Data = null,
            Message = "Failed to search. Please try again"
        };

        try
        {
            // Validate the search request
            if (searchFlowVersionReqDto == null)
            {
                serviceResponse.Message = "Search request is required";
                return serviceResponse;
            }

            // Trim the search key and check if it can be parsed as an integer for version number filtering
            var searchKey = searchFlowVersionReqDto.SearchKey?.Trim() ?? string.Empty;

            // Try to retrieve the flow versions
            var flowVersions = await _unitOfWork.FlowVersionRepo
                       .GetByConditionAsync(w =>
                            (string.IsNullOrWhiteSpace(searchKey) || EF.Functions.ILike(w.Flow.Name, $"%{searchKey}%")) &&
                            w.Flow.Type == searchFlowVersionReqDto.Type &&
                            (w.CreatedByUserId == _userId || (w.Flow.FlowUsers != null && w.Flow.FlowUsers.Any(a => a.UserId == _userId)))
                       )
                       .AsNoTracking()
                       .Include(i => i.Flow)
                       .Include(c => c.CreatedByUser)
                       .Include(c => c.LastModifiedByUser)
                       .OrderByDescending(o => o.VersionNumber)
                       .ToListAsync();

            // If successful, map the retrieved flow versions to SearchFlowVersionResDto and set the response.
            serviceResponse.Data = flowVersions.Adapt<IEnumerable<SearchFlowVersionResDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Retrieved successfully";
        }
        catch (Exception ex)
        {
            // Log any exception and return the default service response.
            _logger.LogError(ex.ToString());
        }

        // Return the service response.
        return serviceResponse;
    }
}
