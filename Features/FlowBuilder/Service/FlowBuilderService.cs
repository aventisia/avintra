namespace WorkspaceAPIs.Services;

public class FlowBuilderService : IFlowBuilderService
{
    private readonly ILogger<FlowBuilderService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public FlowBuilderService(
        ILogger<FlowBuilderService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
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
                    w.FlowId == flowId &&
                    w.CreatedByUserId == _userId &&
                    (versionId == null || w.Id == versionId)
                )
                .Include(u => u.CreatedByUser)
                .Include(lm => lm.LastModifiedByUser)
                .Include(f => f.Flow)
                .OrderByDescending(a => a.CreatedOn) // Ensure the latest version is retrieved
                .FirstOrDefaultAsync();

            // No flow version found, log and return response
            if (flowVersion == null)
            {
                _logger.LogInformation($"No unpublished flow version found for FlowId {flowId}. VersionId: {versionId?.ToString() ?? "N/A"}.");
                serviceResponse.Message = "Flow version does not exist.";
                return serviceResponse;
            }

            // Successfully retrieved the flow version, log and return response
            _logger.LogInformation($"Successfully retrieved flow version for FlowId {flowId}. VersionId: {flowVersion.Id}.");
            serviceResponse.Data = flowVersion.Adapt<LoadFlowDto>();
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

    public async Task<ServiceResponse<bool>> PublishFlowVersionAsync(FlowSilentUpdateDto flowSilentUpdateDto)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400,
            Message = "Failed to publish the flow version. Please try again."
        };

        try
        {
            // Validate that the flow version exists and is owned by the current user
            var flowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    (flowSilentUpdateDto.VersionId == null || w.Id == flowSilentUpdateDto.VersionId) &&
                    w.FlowId == flowSilentUpdateDto.Id &&
                    w.CreatedByUserId == _userId)
                .OrderByDescending(a => a.CreatedOn)
                .SingleOrDefaultAsync();

            if (flowVersion == null)
            {
                _logger.LogInformation($"No flow version found for FlowId {flowSilentUpdateDto.Id}.");
                serviceResponse.Message = "Flow version does not exist.";
                return serviceResponse;
            }

            flowSilentUpdateDto.VersionId = flowVersion.Id;

            // Adapt DTO changes and set publish status
            flowSilentUpdateDto.Adapt(flowVersion);
            flowVersion.IsPublished = true;
            flowVersion.LastModifiedByUserId = _userId;
            flowVersion.LastModifiedOn = DateTimeOffset.UtcNow;

            // Update and save
            _unitOfWork.FlowVersionRepo.Update(flowVersion);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while publishing the flow version.");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow version published successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
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
                                            (flowSilentUpdateDto.VersionId == null || w.Id == flowSilentUpdateDto.VersionId) &&
                                            w.FlowId == flowSilentUpdateDto.Id &&
                                            w.CreatedByUserId == _userId 
                                        )
                                        .OrderByDescending(a => a.CreatedOn)
                                        .SingleOrDefaultAsync();

            // Flow version does not exist, log and return failure
            if (flowVersion == null)
            {
                _logger.LogInformation($"No flow version found for Id {flowSilentUpdateDto.Id}. The flow version could not be updated.");
                serviceResponse.Message = "Flow version does not exist.";
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