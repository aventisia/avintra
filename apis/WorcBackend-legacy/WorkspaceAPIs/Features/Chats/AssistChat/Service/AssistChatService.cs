namespace WorkspaceAPIs.Services;

public class AssistChatService : IAssistChatService
{
    private readonly ILogger<AssistChatService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public AssistChatService(
        ILogger<AssistChatService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Extract and initialize current userId from JWT claims
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves all assigned (published) flow versions.
    public async Task<ServiceResponse<IEnumerable<AssistChatDto>>> GetPublishFlowVersionsAsync()
    {
        // Initialize response object with default failure state
        var serviceResponse = new ServiceResponse<IEnumerable<AssistChatDto>>
        {
            Data = null,
            Message = "Failed to retrieve assigned flow versions. Please try again."
        };

        try
        {
            // Fetch flow versions based on the following criteria:
            // - Flow must be of type ChatAgent
            // - Only published and non-archived flow versions are included
            // - Flow version must be assigned to the current user
            // - Must contain at least one non-archived conversation
            // - That conversation must have at least one message
            // - Includes only non-archived conversations with their messages
            var flowVersions = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    w.Flow.Type == FlowTypesEnum.ChatAgent &&
                    w.IsPublished &&
                    !w.IsArchived &&
                    w.FlowVersionUsers!.Any(a => a.UserId == _userId) &&
                    w.Conversations!.Any(c =>
                        c.Status != ConversationStatusEnum.Archived
                    )
                )
                .Include(i => i.Flow)
                .Include(i => i.FlowVersionUsers)
                .Include(i => i.Conversations!
                    .Where(w => w.Status != ConversationStatusEnum.Archived))
                    .ThenInclude(c => c.Messages)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .OrderBy(o => o.CreatedOn)
                .AsNoTracking()
                .ToListAsync();

            // Map entity list to DTO
            serviceResponse.Data = flowVersions.Adapt<IEnumerable<AssistChatDto>>();

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
    public async Task<ServiceResponse<IEnumerable<AssistChatDto>>> GetArchiveFlowVersionsAsync()
    {
        // Initialize response object
        var serviceResponse = new ServiceResponse<IEnumerable<AssistChatDto>>
        {
            Data = null,
            Message = "Failed to retrieve archived flow versions. Please try again."
        };

        try
        {
            // Fetch flow versions based on the following criteria:
            // - Flow must be of type ChatAgent
            // - Flow version must be assigned to the current user
            // - Must contain at least one archived conversation
            // - That archived conversation must have at least one message
            // - Includes only archived conversations that have messages, along with their messages
            var flowVersions = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    w.Flow.Type == FlowTypesEnum.ChatAgent &&
                    w.FlowVersionUsers != null &&
                    w.FlowVersionUsers.Any(a => a.UserId == _userId) &&
                    w.Conversations.Any(c =>
                        c.Status == ConversationStatusEnum.Archived &&
                        c.Messages.Any()
                ))
                .Include(i => i.Flow)
                .Include(i => i.FlowVersionUsers)
                .Include(i => i.Conversations!
                    .Where(w => w.Status == ConversationStatusEnum.Archived && w.Messages.Any()))
                    .ThenInclude(c => c.Messages)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .OrderBy(o => o.LastModifiedOn)
                .AsNoTracking()
                .ToListAsync();

            // Map to DTO
            serviceResponse.Data = flowVersions.Adapt<IEnumerable<AssistChatDto>>();

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
    public async Task<ServiceResponse<AssistChatDto>> UpdateFlowVersionAsync(AssistChatDto assistChatDto)
    {
        // Initialize response object
        var serviceResponse = new ServiceResponse<AssistChatDto>
        {
            Data = null,
            Message = "Failed to update flow version. Please try again."
        };

        try
        {
            // Fetch existing flow version by Id (condition check)
            var existingFlowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w => w.Id == assistChatDto.Id)
                .FirstOrDefaultAsync();

            // Check if flow version exists
            if (existingFlowVersion == null)
            {
                // Log failure case
                _logger.LogWarning(
                    "Flow version not found. FlowVersionId: {Id}",
                    assistChatDto.Id
                );

                serviceResponse.Message = "Flow version not found.";
                return serviceResponse;
            }

            // Update fields (assignment / state update)
            existingFlowVersion.IsArchived = assistChatDto.IsArchived;

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
                    assistChatDto.Id
                );

                return serviceResponse;
            }

            // Map updated entity to DTO
            serviceResponse.Data = existingFlowVersion.Adapt<AssistChatDto>();

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
                assistChatDto.Id
            );
        }

        return serviceResponse;
    }
}