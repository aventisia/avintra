namespace WorkspaceAPIs.Services;

public class FlowBuilderService : IFlowBuilderService
{
    private readonly ILogger<FlowBuilderService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserManagementGuardService _userManagementGuardService;
    private readonly IFlowVersionHistoryService _flowVersionHistoryService;
    private readonly Guid _userId;

    public FlowBuilderService(
        ILogger<FlowBuilderService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IUserManagementGuardService userManagementGuardService,
        IFlowVersionHistoryService flowVersionHistoryService)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _userManagementGuardService = userManagementGuardService;
        _flowVersionHistoryService = flowVersionHistoryService;
    }

    // Retrieves the flow version record to load when the user opens it in the studio.
    public async Task<ServiceResponse<LoadFlowDto>> GetFlowToLoadAsync(Guid flowId, Guid? versionId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<LoadFlowDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Attempt to retrieve the latest flow version based on provided conditions
            var flowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    (!versionId.HasValue || w.Id == versionId) &&
                    w.FlowId == flowId &&
                    (
                        w.CreatedByUserId == _userId ||
                        (w.Flow.FlowUsers != null && w.Flow.FlowUsers.Any(a => a.UserId == _userId)) ||
                        (
                            w.IsPublished &&
                            (
                                _userManagementGuardService.HasRole(CustomRolesEnum.OM.ToString()) ||
                                _userManagementGuardService.HasRole(CustomRolesEnum.TU.ToString())
                            )
                        )
                    )
                )
                .Include(u => u.CreatedByUser)
                .Include(lm => lm.LastModifiedByUser)
                .Include(f => f.Flow)
                    .ThenInclude(i2 => i2.FlowUsers)
                .OrderByDescending(o => o.CreatedOn) // Ensure the latest version is retrieved
                .FirstOrDefaultAsync();

            // No flow version found, log and return response
            if (flowVersion == null)
            {
                _logger.LogInformation($"No unpublished flow version found for FlowId {flowId}. VersionId: {versionId}.");
                serviceResponse.Message = "Flow version does not exist.";
                return serviceResponse;
            }

            // Convert the flow version to a LoadFlowDto instance using the Adapt method
            var loadFlowDto = flowVersion.Adapt<LoadFlowDto>();

            // Retrieve the user's access information for the flow, if available
            var userAccess = flowVersion.Flow?.FlowUsers?.FirstOrDefault(u => u.UserId == _userId);

            // Set the user's access type in the LoadFlowDto
            // If the user is the creator of the flow, assign 'Owner' access
            // Otherwise, use the access type from FlowUsers or default to null if not found
            loadFlowDto.AccessType = flowVersion.Flow.CreatedByUserId == _userId ? ProjectUserAccessEnum.Owner : userAccess?.Type;

            // Successfully retrieved the flow version, log and return response
            _logger.LogInformation($"Successfully retrieved flow version for FlowId {flowId}. VersionId: {flowVersion.Id}.");
            serviceResponse.Data = loadFlowDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow version retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Publishes a flow version based on the specified type (Agent, Block, Template).
    public async Task<ServiceResponse<bool>> PublishFlowVersionAsync(PublishFlowVersionDto publishFlowVersionDto)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to publish the flow version. Please try again."
        };

        try
        {
            // Fetch the flow version with matching ID, flow ID, and ownership or shared access by current user
            var flowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    w.Id == publishFlowVersionDto.Id &&
                    w.FlowId == publishFlowVersionDto.FlowId &&
                    (
                        w.CreatedByUserId == _userId ||
                        (
                            w.Flow.FlowUsers != null && w.Flow.FlowUsers.Any(a => a.UserId == _userId)
                        )
                    ))
                .Include(fv => fv.Flow)
                .ThenInclude(flow => flow.FlowUsers)
                .OrderByDescending(fv => fv.CreatedOn)
                .SingleOrDefaultAsync();

            // If the flow version is not found, return failure message
            if (flowVersion == null)
            {
                _logger.LogInformation($"No flow version found for FlowId {publishFlowVersionDto.FlowId} with VersionId {publishFlowVersionDto.Id}.");
                serviceResponse.Message = "Flow version does not exist.";
                return serviceResponse;
            }

            // Check if the user is the creator or has the required access (Owner/Edit)
            var flowUserAccess = flowVersion.Flow.FlowUsers?.FirstOrDefault(w =>
                w.FlowId == flowVersion.Flow.Id &&
                w.UserId == _userId &&
                (w.Type == ProjectUserAccessEnum.Owner || w.Type == ProjectUserAccessEnum.Edit)
            );

            // Allow access if the user is the creator, else check if they have access
            if (flowVersion.Flow.CreatedByUserId != _userId && flowUserAccess == null)
            {
                _logger.LogWarning($"User {_userId} is not authorized to modify this flow.");
                serviceResponse.Message = "You don't have access to modify this flow.";
                return serviceResponse;
            }

            // Handle publish based on the type specified in the DTO
            switch (publishFlowVersionDto.Type)
            {
                case PublishTypesEnum.Agent:
                case PublishTypesEnum.Block:
                    // Determine the publish type for logging and message purposes
                    var publishType = publishFlowVersionDto.Type.ToString();

                    // Log the start of publishing
                    _logger.LogInformation($"Publishing flow version as {publishType}. FlowVersionId: {publishFlowVersionDto.Id}, FlowId: {publishFlowVersionDto.Id}");

                    // Adapt the DTO values into the flow version object
                    publishFlowVersionDto.Adapt(flowVersion);

                    // Mark the flow version as published
                    flowVersion.IsPublished = true;
                    flowVersion.LastModifiedByUserId = _userId;
                    flowVersion.LastModifiedOn = DateTimeOffset.UtcNow;

                    // Update and persist changes
                    _unitOfWork.FlowVersionRepo.Update(flowVersion);
                    if (!await _unitOfWork.SaveAsync())
                    {
                        _logger.LogError($"Failed to save changes while publishing the flow version as {publishType}.");
                        return serviceResponse;
                    }

                    // Log success and set response message
                    _logger.LogInformation($"Flow version successfully published as {publishType}.");
                    serviceResponse.Message = $"{publishType} published successfully.";
                    break;

                default:
                    // Log message for invalid publish type
                    _logger.LogWarning($"Invalid publish type encountered: {publishFlowVersionDto.Type}");
                    serviceResponse.Message = "Invalid publish type provided.";
                    return serviceResponse;
            }

            // Final success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur
            _logger.LogError($"Exception occurred in PublishFlowVersionAsync: {ex.Message}");
        }

        return serviceResponse;
    }

    // Saves the flow version nodes, edges, and viewport in the background when the user makes changes. 
    // It creates a new flow version and stores version history if changes are detected.
    public async Task<ServiceResponse<bool>> SaveFlowVersionAsync(FlowSilentUpdateDto flowSilentUpdateDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to save the flow version. Please try again."
        };

        try
        {
            // Validate that the flow version exists and is owned by the current user
            var flowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    w.Id == flowSilentUpdateDto.VersionId &&
                    w.FlowId == flowSilentUpdateDto.Id &&
                    (
                        w.CreatedByUserId == _userId ||
                        (w.Flow.FlowUsers != null && w.Flow.FlowUsers.Any(a => a.UserId == _userId))
                    )
                )
                .Include(i => i.Flow)
                .ThenInclude(i2 => i2.FlowUsers)
                .OrderByDescending(a => a.CreatedOn)
                .SingleOrDefaultAsync();

            // If no flow version is found, log and return failure
            if (flowVersion == null)
            {
                _logger.LogInformation($"No flow version found for Id {flowSilentUpdateDto.VersionId}. The flow version could not be saved.");
                serviceResponse.Message = "Flow version does not exist.";
                return serviceResponse;
            }

            // Check if the user is the creator or has the required access (Owner/Edit)
            var flowUserAccess = flowVersion.Flow.FlowUsers?.FirstOrDefault(w =>
                w.FlowId == flowVersion.Flow.Id &&
                w.UserId == _userId &&
                (w.Type == ProjectUserAccessEnum.Owner || w.Type == ProjectUserAccessEnum.Edit)
            );

            // Allow access if the user is the creator, else check if they have access (Owner/Edit)
            if (flowVersion.Flow.CreatedByUserId != _userId && flowUserAccess == null)
            {
                _logger.LogWarning($"User {_userId} is not authorized to modify this flow.");
                serviceResponse.Message = "You don't have access to modify this flow.";
                return serviceResponse;
            }
            flowSilentUpdateDto.VersionId = flowVersion.Id;


            // Create a flow version history record if there are changes in the ReactFlow data
            await _flowVersionHistoryService.CreateHistoryIfReactFlowChangedAsync(flowVersion, flowSilentUpdateDto);

            // Map the updated properties from the DTO to the flow version
            flowSilentUpdateDto.Adapt(flowVersion);
            flowVersion.LastModifiedByUserId = _userId;
            flowVersion.LastModifiedOn = DateTimeOffset.UtcNow;

            // Attempt to update the flow version
            _unitOfWork.FlowVersionRepo.Update(flowVersion);
            // Save changes to the database, log failure if saving fails
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while saving flow version silently.");
                return serviceResponse;
            }


            // Successful save, log and return success
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow version saved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }
}