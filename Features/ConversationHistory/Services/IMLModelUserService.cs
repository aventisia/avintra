namespace MLModelBuilderAPIs.Services;

public interface IConversationHistoryService
{
    /// <summary>
    /// Retrieves a list of conversation messages associated with a specific ML model, identified by the model's Id.
    /// </summary>
    /// <param name="mlModelId">The unique identifier of the ML model (Primary Key of MLModel Entity)</param>
    /// <param name="conversationId">An optional identifier for the conversation session to filter the messages by. If not provided, all messages for the given ML model will be retrieved.</param>
    /// <returns>A service response containing a list of conversation messages linked to the specified ML model Id</returns>
    Task<ServiceResponse<IEnumerable<ConversationHistoryDto>>> GetConversationHistoriesByMLModelIdAsync(Guid mlModelId, Guid? conversationId);

    /// <summary>
    /// Retrieves a specific conversation message by its unique identifier.
    /// </summary>
    /// <param name="conversationHistoryId">The unique identifier of the conversation history entry</param>
    /// <returns>A service response containing the ConversationHistoryDto if the entry is found, otherwise null</returns>
    Task<ServiceResponse<ConversationHistoryDto>> GetConversationHistoryByIdAsync(Guid conversationHistoryId);

    /// <summary>
    /// Adds a new conversation message to an ML model.
    /// </summary>
    /// <param name="conversationHistoryDto">The data representing the conversation message to be added</param>
    /// <returns>A service response containing the newly added conversation history entry</returns>
    Task<ServiceResponse<ConversationHistoryDto>> InsertConversationHistoryAsync(ConversationHistoryDto conversationHistoryDto);

    /// <summary>
    /// Updates the information of an existing conversation message.
    /// </summary>
    /// <param name="conversationHistoryDto">The data of the conversation message to be updated</param>
    /// <returns>A service response containing the updated conversation history entry</returns>
    Task<ServiceResponse<ConversationHistoryDto>> UpdateConversationHistoryAsync(ConversationHistoryDto conversationHistoryDto);

    /// <summary>
    /// Removes a conversation message from the ML model permanently.
    /// </summary>
    /// <param name="conversationHistoryId">The unique identifier of the conversation message to be deleted</param>
    /// <returns>A service response indicating whether the delete operation was successful</returns>
    Task<ServiceResponse<bool>> DeleteConversationHistoryAsync(Guid conversationHistoryId);

    /// <summary>
    /// Removes multiple conversation messages from the ML model based on a list of unique identifiers.
    /// </summary>
    /// <param name="conversationHistoryIds">A collection of GUIDs representing the conversation messages to be removed</param>
    /// <returns>A service response indicating whether the delete operation was successful</returns>
    Task<ServiceResponse<bool>> DeleteMultipleConversationHistoriesAsync(IEnumerable<Guid> conversationHistoryIds);
}
