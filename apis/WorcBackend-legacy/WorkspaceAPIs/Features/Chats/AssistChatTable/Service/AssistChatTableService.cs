namespace WorkspaceAPIs.Services;

public class AssistChatTableService : IAssistChatTableService
{
    private readonly ILogger<AssistChatTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public AssistChatTableService(
        ILogger<AssistChatTableService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Extract and initialize current userId from JWT claims
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves all assigned (published) flow versions.
    public async Task<ServiceResponse<IEnumerable<AssistChatTableDto>>> GetPublishFlowVersionsAsync()
    {
        // Initialize response object with default failure state
        var serviceResponse = new ServiceResponse<IEnumerable<AssistChatTableDto>>
        {
            Data = null,
            Message = "Failed to retrieve assigned flow versions. Please try again."
        };

        try
        {
            // Fetch flow versions based on the following criteria:
            // - Flow must be of type ChatAgent
            // - Only published flow versions are included
            // - Excludes archived flow versions
            // - Ensures the flow version is assigned to the current user
            var flowVersions = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    w.Flow.Type == FlowTypesEnum.ChatAgent &&
                    w.IsPublished &&
                    !w.IsArchived &&
                    w.FlowVersionUsers != null &&
                    w.FlowVersionUsers.Any(a => a.UserId == _userId)
                )
                .Include(i => i.Flow)
                .Include(i => i.FlowVersionUsers)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .OrderBy(o => o.CreatedOn)
                .AsNoTracking()
                .ToListAsync();

            // Map entity list to DTO
            serviceResponse.Data = flowVersions.Adapt<IEnumerable<AssistChatTableDto>>();

            // Update response to success
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Assigned flow versions retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log failure with context
            _logger.LogError(ex, "Error retrieving assigned flow versions.");
        }

        return serviceResponse;
    }

    // Retrieves all archived flow versions.
    public async Task<ServiceResponse<IEnumerable<AssistChatTableDto>>> GetArchiveFlowVersionsAsync()
    {
        // Initialize response object
        var serviceResponse = new ServiceResponse<IEnumerable<AssistChatTableDto>>
        {
            Data = null,
            Message = "Failed to retrieve archived flow versions. Please try again."
        };

        try
        {
            // Fetch flow versions based on the following criteria:
            // - Flow must be of type ChatAgent
            // - Only IsArchived flow versions are included
            // - Ensures the flow version is assigned to the current user
            var flowVersions = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    w.Flow.Type == FlowTypesEnum.ChatAgent &&
                    w.IsArchived &&
                    w.FlowVersionUsers != null &&
                    w.FlowVersionUsers.Any(a => a.UserId == _userId)
                )
                .Include(i => i.Flow)
                .Include(i => i.FlowVersionUsers)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .OrderBy(o => o.LastModifiedOn)
                .AsNoTracking()
                .ToListAsync();

            // Map to DTO
            serviceResponse.Data = flowVersions.Adapt<IEnumerable<AssistChatTableDto>>();

            // Success response
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Archived flow versions retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log error
            _logger.LogError(ex, "Error retrieving archived flow versions.");
        }

        return serviceResponse;
    }

    // Updates a flow version.
    public async Task<ServiceResponse<AssistChatTableDto>> UpdateFlowVersionAsync(AssistChatTableDto assistChatTableDto)
    {
        // Initialize response object
        var serviceResponse = new ServiceResponse<AssistChatTableDto>
        {
            Data = null,
            Message = "Failed to update flow version. Please try again."
        };

        try
        {
            // Fetch existing flow version by Id (condition check)
            var existingFlowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w => w.Id == assistChatTableDto.Id)
                .FirstOrDefaultAsync();

            // Check if flow version exists
            if (existingFlowVersion == null)
            {
                // Log failure case
                _logger.LogWarning(
                    "Flow version not found. FlowVersionId: {Id}",
                    assistChatTableDto.Id
                );

                serviceResponse.Message = "Flow version not found.";
                return serviceResponse;
            }

            // Update fields (assignment / state update)
            existingFlowVersion.IsArchived = assistChatTableDto.IsArchived;
            existingFlowVersion.IsDisabled = assistChatTableDto.IsDisabled;

            // Set audit field
            existingFlowVersion.LastModifiedByUserId = _userId;

            // Mark entity as updated
            _unitOfWork.FlowVersionRepo.Update(existingFlowVersion);

            // Save changes (condition check)
            if (!await _unitOfWork.SaveAsync())
            {
                // Log failure if DB save fails
                _logger.LogWarning(
                    "Save failed while updating flow version. FlowVersionId: {Id}",
                    assistChatTableDto.Id
                );

                return serviceResponse;
            }

            // Map updated entity to DTO
            serviceResponse.Data = existingFlowVersion.Adapt<AssistChatTableDto>();

            // Success response
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow version updated successfully.";
        }
        catch (Exception ex)
        {
            // Log unexpected exception with context
            _logger.LogError(
                ex,
                "Error updating flow version. FlowVersionId: {Id}",
                assistChatTableDto.Id
            );
        }

        return serviceResponse;
    }
}