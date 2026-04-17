namespace WorkspaceAPIs.Services;

public interface IAdminConversationService
{
    /// <summary>
    /// Retrieves conversations for administrative monitoring and analysis based on the provided filters.
    /// Includes metadata such as token usage, message count, cost, and user details.
    /// </summary>
    /// <param name="isArchived">Indicates whether to include archived conversations.</param>
    /// <param name="startDate">Optional start date to filter conversations.</param>
    /// <param name="endDate">Optional end date to filter conversations.</param>
    /// <param name="userIds">Optional list of user IDs to filter conversations.</param>
    /// <param name="flowVersionIds">Optional list of flow version IDs (agent names) to filter conversations.</param>
    /// <returns>A collection of conversations with monitoring-related information.</returns>
    Task<ServiceResponse<IEnumerable<AdminConversationDto>>> GetAdminConversationsAsync(ConversationFilterDto conversationFilterDto);

    /// <summary>
    /// Retrieves the complete message history for a given conversation.
    /// </summary>
    /// <param name="conversationId">The unique identifier of the conversation.</param>
    /// <returns> A detailed conversation object containing all associated messages. </returns>
    Task<ServiceResponse<AdminConversationMessageDto>> GetMessagesByConversationIdAsync(Guid conversationId);
}