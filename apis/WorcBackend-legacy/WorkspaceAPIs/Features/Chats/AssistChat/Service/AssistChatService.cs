namespace WorkspaceAPIs.Services;

public class AssistChatService : IAssistChatService
{
    private readonly ILogger<AssistChatService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IResourceFlowAccessService _resourceFlowAccessService;
    private readonly Guid _userId;

    public AssistChatService(
        ILogger<AssistChatService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IResourceFlowAccessService resourceFlowAccessService)
    {
        // Extract and initialize current userId from JWT claims
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _resourceFlowAccessService = resourceFlowAccessService;
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
            // - Flow type must be ChatAgent
            // - Only published and non-archived flow versions are included
            // - Flow version must be assigned to the current user
            var flowVersions = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    w.Flow.Type == FlowTypesEnum.ChatAgent &&
                    w.IsPublished &&
                    !w.IsArchived &&
                     (w.IsTenantWideAccess || w.FlowVersionUsers!.Any(a => a.UserId == _userId))
                )
                .Select(s => new AssistChatDto
                {
                    Id = s.Id,

                    // Flow metadata
                    Name = s.Flow != null ? s.Flow.Name : string.Empty,
                    Description = s.Flow != null ? s.Flow.Description : null,
                    VersionNumber = s.VersionNumber,
                    IsArchived = s.IsArchived,
                    DefaultActions = FlowDefinitionUtil.GetDefaultActions(
                        s.FlowVersionHistories
                            .OrderByDescending(h => h.CreatedOn)
                            .Select(h => h.ReactFlowObject)
                            .FirstOrDefault() ?? string.Empty),

                    // Last modification details
                    LastModifiedByUsername = s.LastModifiedByUser != null
                        ? s.LastModifiedByUser.UserName
                        : null,

                    LastModifiedBy = s.LastModifiedByUser != null
                        ? s.LastModifiedByUser.FirstName + " " + s.LastModifiedByUser.LastName
                        : null,

                    LastModifiedOn = s.LastModifiedOn,

                    Timestamp = s.Conversations.Any() ? s.Conversations
                        .Where(w1 => w1.Status != ConversationStatusEnum.Archived && w1.UserId == _userId)
                        .Select(s1 => s1.Messages
                            .OrderByDescending(o => o.CreatedOn)
                            .Select(s2 => (DateTimeOffset?)s2.CreatedOn)
                            .FirstOrDefault() ?? s1.CreatedOn)
                        .OrderByDescending(o => o)
                        .FirstOrDefault()
                        : s.CreatedOn,

                    // Project conversations with latest activity details
                    Conversations = s.Conversations
                        // Include only active (non-archived) conversations
                        .Where(w1 => w1.Status != ConversationStatusEnum.Archived && w1.UserId == _userId)
                        .Select(s1 => new ConversationSummaryDto
                        {
                            Id = s1.Id,

                            // Use latest message content as conversation title
                            // Falls back to default if no messages exist
                            Title = s1.Messages
                                .OrderByDescending(o => o.CreatedOn)
                                .Select(s2 => s2.Content)
                                .FirstOrDefault() ?? "Untitled Conversation",

                            // Use latest message timestamp as activity indicator
                            // Falls back to conversation creation time if no messages exist
                            Timestamp = s1.Messages
                                .OrderByDescending(o => o.CreatedOn)
                                .Select(s2 => (DateTimeOffset?)s2.CreatedOn)
                                .FirstOrDefault() ?? s1.CreatedOn,

                            Status = s1.Status
                        })
                        // Order conversations by most recent activity (latest message timestamp)
                        .OrderByDescending(o => o.Timestamp)
                        .ToList()
                })

                // Order flow versions by latest conversation activity (descending)
                .OrderByDescending(o => o.Conversations
                    .Max(m => (DateTimeOffset?)m.Timestamp))
                .AsNoTracking()
                .ToListAsync();

            // Map entity list to DTO
            serviceResponse.Data = flowVersions;

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
            // - Flow version must be published and not archived
            // - Flow version must be assigned to the current user
            // - Must contain at least one non-archived conversation
            // - Each conversation can have messages (used to determine title and timestamp)
            // - Includes only non-archived conversations with their latest message details
            var flowVersions = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    w.Flow.Type == FlowTypesEnum.ChatAgent &&
                    w.IsPublished &&
                    !w.IsArchived &&
                    (w.IsTenantWideAccess || w.FlowVersionUsers!.Any(a => a.UserId == _userId)) &&
                    w.Conversations.Any(a =>
                        a.Status == ConversationStatusEnum.Archived &&
                        a.UserId == _userId &&
                        a.Messages.Any())
                )
                .Select(s => new AssistChatDto
                {
                    Id = s.Id,
                    Name = s.Flow != null ? s.Flow.Name : string.Empty,
                    Description = s.Flow != null ? s.Flow.Description : null,
                    VersionNumber = s.VersionNumber,
                    IsArchived = s.IsArchived,
                    DefaultActions = FlowDefinitionUtil.GetDefaultActions(
                        s.FlowVersionHistories
                            .OrderByDescending(h => h.CreatedOn)
                            .Select(h => h.ReactFlowObject)
                            .FirstOrDefault() ?? string.Empty),
                    LastModifiedByUsername = s.LastModifiedByUser != null
                        ? s.LastModifiedByUser.UserName
                        : null,

                    LastModifiedBy = s.LastModifiedByUser != null
                        ? s.LastModifiedByUser.FirstName + " " + s.LastModifiedByUser.LastName
                        : null,

                    LastModifiedOn = s.LastModifiedOn,

                    Timestamp = s.Conversations.Any() ? s.Conversations
                    .Where(w1 => w1.Status != ConversationStatusEnum.Archived && w1.UserId == _userId)
                    .Select(s1 => s1.Messages
                        .OrderByDescending(o => o.CreatedOn)
                        .Select(s2 => (DateTimeOffset?)s2.CreatedOn)
                        .FirstOrDefault() ?? s1.CreatedOn)
                    .OrderByDescending(o => o)
                    .FirstOrDefault()
                     : s.CreatedOn,

                    Conversations = s.Conversations
                        // Include only non-archived conversations
                        .Where(w1 => w1.Status == ConversationStatusEnum.Archived && w1.UserId == _userId && w1.Messages.Any())
                        .Select(s1 => new ConversationSummaryDto
                        {
                            Id = s1.Id,

                            // Latest message content used as conversation title
                            Title = s1.Messages
                                .OrderByDescending(o => o.CreatedOn)
                                .Select(s2 => s2.Content)
                                .FirstOrDefault() ?? "Untitled Conversation",

                            // Latest message timestamp; fallback to conversation creation time if no messages exist
                            Timestamp = s1.Messages
                                .OrderByDescending(o => o.CreatedOn)
                                .Select(s2 => (DateTimeOffset?)s2.CreatedOn)
                                .FirstOrDefault() ?? s1.CreatedOn,

                            Status = s1.Status
                        })
                        // Sort conversations by most recent activity (latest message)
                        .OrderByDescending(o => o.Timestamp)
                        .ToList()
                })

                // Sort flow versions by most recent conversation activity
                .OrderByDescending(o => o.Conversations
                    .Max(m => (DateTimeOffset?)m.Timestamp))
                .AsNoTracking()
                .ToListAsync();

            // Map to DTO
            serviceResponse.Data = flowVersions;

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

            if (!existingFlowVersion.IsArchived && assistChatDto.IsArchived)
            {
                await _resourceFlowAccessService.DeleteFlowAccessesIfArchivedAsync(existingFlowVersion.FlowId, existingFlowVersion.Id);
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