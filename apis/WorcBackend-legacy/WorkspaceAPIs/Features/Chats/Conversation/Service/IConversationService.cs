namespace WorkspaceAPIs.Services;

/// <summary>
/// Provides operations to manage conversations, including retrieval, creation, updates, archiving, and deletion.
/// </summary>
public interface IConversationService
{
    /// <summary>
    /// Retrieves all active conversations for a given flow version.
    /// </summary>
    /// <param name="flowVersionId">The unique identifier of the flow version.</param>
    /// <returns>
    /// A service response containing a collection of active conversations.
    /// </returns>
    Task<ServiceResponse<IEnumerable<ConversationDto>>> GetActiveConversationsAsync(Guid flowVersionId);

    /// <summary>
    /// Retrieves all archived conversations for a given flow version.
    /// </summary>
    /// <param name="flowVersionId">The unique identifier of the flow version.</param>
    /// <returns>
    /// A service response containing a collection of archived conversations.
    /// </returns>
    Task<ServiceResponse<IEnumerable<ConversationDto>>> GetArchivedConversationsAsync(Guid flowVersionId);

    /// <summary>
    /// Retrieves a specific conversation by its unique identifier.
    /// </summary>
    /// <param name="conversationId">The unique identifier of the conversation.</param>
    /// <returns>
    /// A service response containing the conversation details if found.
    /// </returns>
    Task<ServiceResponse<ConversationDto>> GetByIdAsync(Guid conversationId);

    /// <summary>
    /// Creates a new conversation.
    /// </summary>
    /// <param name="conversationDto">The data used to create the conversation.</param>
    /// <returns>
    /// A service response containing the newly created conversation.
    /// </returns>
    Task<ServiceResponse<ConversationDto>> CreateAsync(ConversationDto conversationDto);

    /// <summary>
    /// Updates an existing conversation.
    /// </summary>
    /// <param name="conversationDto">The updated conversation data.</param>
    /// <returns>
    /// A service response containing the updated conversation.
    /// </returns>
    Task<ServiceResponse<ConversationDto>> UpdateAsync(ConversationDto conversationDto);

    /// <summary>
    /// Archives a conversation, making it read-only and moving it to the archived list.
    /// </summary>
    /// <param name="conversationId">The unique identifier of the conversation.</param>
    /// <returns>
    /// A service response indicating whether the operation was successful.
    /// </returns>
    Task<ServiceResponse<bool>> ArchiveAsync(Guid conversationId);

    /// <summary>
    /// Restores an archived conversation back to the active state.
    /// </summary>
    /// <param name="conversationId">The unique identifier of the conversation.</param>
    /// <returns>
    /// A service response indicating whether the operation was successful.
    /// </returns>
    Task<ServiceResponse<bool>> UnarchiveAsync(Guid conversationId);

    /// <summary>
    /// Archives multiple conversations in a single operation.
    /// </summary>
    /// <param name="conversationIds">A collection of conversation identifiers.</param>
    /// <returns>
    /// A service response indicating whether all conversations were archived successfully.
    /// </returns>
    Task<ServiceResponse<bool>> ArchiveBulkAsync(IEnumerable<Guid> conversationIds);

    /// <summary>
    /// Deletes a conversation by its unique identifier.
    /// This operation should be used cautiously as conversations are typically retained for audit and billing purposes.
    /// </summary>
    /// <param name="conversationId">The unique identifier of the conversation.</param>
    /// <returns>
    /// A service response indicating whether the conversation was deleted successfully.
    /// </returns>
    Task<ServiceResponse<bool>> DeleteAsync(Guid conversationId);

    /// <summary>
    /// Deletes multiple conversations in a single operation.
    /// This operation should be used cautiously as conversations are typically retained for audit and billing purposes.
    /// </summary>
    /// <param name="conversationIds">A collection of conversation identifiers.</param>
    /// <returns>
    /// A service response indicating whether all conversations were deleted successfully.
    /// </returns>
    Task<ServiceResponse<bool>> DeleteBulkAsync(IEnumerable<Guid> conversationIds);
}