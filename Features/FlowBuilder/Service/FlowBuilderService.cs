namespace WorkspaceAPIs.Services;

public class FlowBuilderService : IFlowBuilderService
{
    private readonly ILogger<FlowBuilderService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserManagementGuardService _userManagementGuardService;
    private readonly Guid _userId;

    public FlowBuilderService(
        ILogger<FlowBuilderService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IUserManagementGuardService userManagementGuardService)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _userManagementGuardService = userManagementGuardService;
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
                        (w.IsPublished && _userManagementGuardService.HasRole("OM"))
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
            // Step 1: Validate required parameters based on the specified publish type
            if ((publishFlowVersionDto.Type == PublishTypesEnum.Block ||
                 publishFlowVersionDto.Type == PublishTypesEnum.BlockTemplate ||
                 publishFlowVersionDto.Type == PublishTypesEnum.AgentTemplate) &&
                string.IsNullOrEmpty(publishFlowVersionDto.Name))
            {
                // Log warning if 'Name' is not provided for Block, BlockTemplate, or AgentTemplate types
                _logger.LogWarning("PublishFlowVersionAsync: 'Name' is required for Block, BlockTemplate, or AgentTemplate types.");
                serviceResponse.Message = "'Name' is a mandatory field for the selected type.";
                return serviceResponse;
            }

            if (publishFlowVersionDto.Type == PublishTypesEnum.Block && publishFlowVersionDto.AccessType == null)
            {
                // Log warning if 'AccessType' is missing for Block type
                _logger.LogWarning("PublishFlowVersionAsync: Missing 'AccessType' for Block type.");
                serviceResponse.Message = "'AccessType' must be specified for the Block type.";
                return serviceResponse;
            }

            // Step 2: Fetch the flow version with matching ID, flow ID, and ownership or shared access by current user
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

            // Step 3: Handle publish based on the type specified in the DTO
            switch (publishFlowVersionDto.Type)
            {
                case PublishTypesEnum.Agent:
                    // Log the start of publishing Agent type
                    _logger.LogInformation($"Publishing flow version as Agent. FlowVersionId: {publishFlowVersionDto.Id}, FlowId: {publishFlowVersionDto.Id}");

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
                        _logger.LogError("Failed to save changes while publishing the flow version as Agent.");
                        return serviceResponse;
                    }

                    // Log success and set response message
                    _logger.LogInformation("Flow version successfully published as Agent.");
                    serviceResponse.Message = "Flow version published successfully as Agent.";
                    break;

                case PublishTypesEnum.Block:
                    // Log the start of publishing Block type
                    _logger.LogInformation($"Publishing flow version as Block. FlowVersionId: {publishFlowVersionDto.Id}, FlowId: {publishFlowVersionDto.Id}");

                    // Create a new Block using values from the DTO
                    var block = new Block
                    {
                        Name = !string.IsNullOrEmpty(publishFlowVersionDto.Name) ? publishFlowVersionDto.Name : string.Empty,
                        Description = !string.IsNullOrEmpty(publishFlowVersionDto.Description) ? publishFlowVersionDto.Description : null,
                        Type = publishFlowVersionDto.AccessType ?? AccessTypesEnum.TenantLevel,
                        FlowVersionId = flowVersion.Id,
                        InputOutputObject = publishFlowVersionDto.InputOutputObject,
                        ReactFlowObject = publishFlowVersionDto.ReactFlowObject,
                        FlowVariablesObject = publishFlowVersionDto.FlowVariablesObject,
                        CreatedByUserId = _userId,
                        LastModifiedByUserId = _userId
                    };

                    // Insert and persist changes
                    await _unitOfWork.BlockRepo.InsertAsync(block);
                    if (!await _unitOfWork.SaveAsync())
                    {
                        _logger.LogError("Failed to save changes while publishing the flow version as Block.");
                        return serviceResponse;
                    }

                    // Log success and set response message
                    _logger.LogInformation("Flow version successfully published as Block.");
                    serviceResponse.Message = "Block added successfully.";
                    break;

                case PublishTypesEnum.AgentTemplate:
                case PublishTypesEnum.BlockTemplate:
                    // Log the start of publishing Template type (AgentTemplate/BlockTemplate)
                    _logger.LogInformation($"Publishing flow version as Template. FlowVersionId: {publishFlowVersionDto.Id}, FlowId: {publishFlowVersionDto.Id}");

                    // Create a new template (WorcTemplate)
                    var template = new ProjectTemplate
                    {
                        Name = !string.IsNullOrEmpty(publishFlowVersionDto.Name) ? publishFlowVersionDto.Name : string.Empty,
                        Description = publishFlowVersionDto.Description,
                        RefId = flowVersion.Id,
                        Schema = publishFlowVersionDto.ReactFlowObject,
                        AccessPath = $"/agent?f={flowVersion.FlowId}&v={flowVersion.Id}",
                        SchemaVersion = flowVersion.VersionNumber,
                        CreatedByUserId = _userId,
                        LastModifiedByUserId = _userId
                    };

                    // Insert and persist changes
                    await _unitOfWork.ProjectTemplateRepo.InsertAsync(template);
                    if (!await _unitOfWork.SaveAsync())
                    {
                        _logger.LogError("Failed to save changes while publishing the flow version as Template.");
                        return serviceResponse;
                    }

                    // Log success and set response message
                    _logger.LogInformation("Flow version successfully published as Template.");
                    serviceResponse.Message = "Template added successfully.";
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

    // Updates the flow version nodes, edges, and viewport in the background when the user makes changes
    public async Task<ServiceResponse<bool>> UpdateFlowSilentlyAsync(FlowSilentUpdateDto flowSilentUpdateDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to update the flow version. Please try again."
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

            // Flow version does not exist, log and return failure
            if (flowVersion == null)
            {
                _logger.LogInformation($"No flow version found for Id {flowSilentUpdateDto.Id}. The flow version could not be updated.");
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

            flowSilentUpdateDto.VersionId = flowVersion.Id;

            // Map the updated properties from the DTO to the flow version
            flowSilentUpdateDto.Adapt(flowVersion);
            flowVersion.LastModifiedByUserId = _userId;
            flowVersion.LastModifiedOn = DateTimeOffset.UtcNow;

            // Attempt to update the flow version
            _unitOfWork.FlowVersionRepo.Update(flowVersion);

            // Save changes to the database, log failure if saving fails
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while updating flow version silently.");
                return serviceResponse;
            }

            // Successful update, log and return success
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow version updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }
}