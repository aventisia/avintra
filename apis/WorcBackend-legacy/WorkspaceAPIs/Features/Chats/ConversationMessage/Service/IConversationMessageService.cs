namespace WorkspaceAPIs.Services;

/// <summary>
/// Provides operations to manage conversation messages, including sending messages,
/// retrieving chat history, and supporting search functionality.
/// </summary>
public interface IConversationMessageService
{
    /// <summary>
    /// Sends a message within a conversation. If a conversation does not exist, a new one will be created automatically.
    /// </summary>
    /// <param name="conversationMessageDto"> The request containing message content, and optional conversation identifier.  </param>
    /// <returns> A service response containing the processed message and associated conversation identifier. </returns>
    Task<ServiceResponse<ConversationMessageDto>> SendMessageAsync(ConversationMessageDto conversationMessageDto);

    /// <summary>
    /// Retrieves all messages for a specific conversation. Typically used to load the complete chat history on initial page load or refresh.
    /// </summary>
    /// <param name="conversationId">The unique identifier of the conversation.</param>
    /// <returns> A service response containing an ordered list of messages for the conversation. </returns>
    Task<ServiceResponse<IEnumerable<ConversationMessageDto>>> GetMessagesAsync(Guid conversationId);

    /// <summary>
    /// Retrieves the most recent messages from a conversation. Useful for limiting context size when interacting with an LLM.
    /// </summary>
    /// <param name="conversationId">The unique identifier of the conversation.</param>
    /// <param name="count">The number of recent messages to retrieve.</param>
    /// <returns> A service response containing the latest messages in chronological order. </returns>
    Task<ServiceResponse<IEnumerable<ConversationMessageDto>>> GetRecentMessagesAsync(Guid conversationId, int count);

    /// <summary>
    /// Searches messages across all conversations for the current user. Used to support global search functionality in the "My Chats" experience.
    /// </summary>
    /// <param name="query">The search keyword or phrase.</param>
    /// <returns> A service response containing messages that match the search criteria. </returns>
    Task<ServiceResponse<IEnumerable<SearchConversationMessageDto>>> SearchMessagesAsync(string query);

    /// <summary>
    /// Stores the current user's rating on the reply to one user turn of their conversation.
    /// </summary>
    /// <param name="conversationId">The unique identifier of the conversation.</param>
    /// <param name="feedback">The user turn and its rating.</param>
    /// <returns> A service response that is true once the rating is stored. </returns>
    Task<ServiceResponse<bool>> SetFeedbackAsync(Guid conversationId, MessageFeedbackDto feedback);
}