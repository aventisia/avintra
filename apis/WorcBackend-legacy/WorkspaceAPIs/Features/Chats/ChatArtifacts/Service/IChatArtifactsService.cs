namespace WorkspaceAPIs.Services;

/// <summary>
/// Service interface for managing landing chat artifacts.
/// </summary>
public interface IChatArtifactsService
{
    /// <summary>
    /// Retrieves list of chat artifacts.
    /// </summary>
    /// <param name="conversationId">The unique identifier of the conversation.</param>
    /// <returns>A service response containing the conversation artifacts.</returns>
    Task<ServiceResponse<IEnumerable<ChatArtifactDto>>> GetChatArtifactsAsync(Guid conversationId);

    /// <summary>
    /// Retrieves list of all chat artifacts.
    /// </summary>
    /// <returns>A service response containing the caller artifacts.</returns>
    Task<ServiceResponse<IEnumerable<ChatArtifactDto>>> GetAllChatArtifactsAsync();

    /// <summary>
    /// Retrieves a chat artifact by its ID.
    /// </summary>
    /// <param name="chatArtifactId">The unique identifier of the artifact.</param>
    /// <returns>A service response containing the artifact.</returns>
    Task<ServiceResponse<ChatArtifactDto>> GetChatArtifactAsync(Guid chatArtifactId);

    /// <summary>
    /// Inserts a new chat artifact.
    /// </summary>
    /// <param name="insertChatArtifactDto">The artifact to store.</param>
    /// <returns>A service response containing the stored artifact.</returns>
    Task<ServiceResponse<ChatArtifactDto>> InsertChatArtifactAsync(InsertChatArtifactDto insertChatArtifactDto);

    /// <summary>
    /// Deletes an existing chat artifact.
    /// </summary>
    /// <param name="chatArtifactId">The unique identifier of the artifact to delete.</param>
    /// <returns>A service response indicating success or failure.</returns>
    Task<ServiceResponse<bool>> DeleteChatArtifactAsync(Guid chatArtifactId);

    /// <summary>
    /// Deletes multiple chat artifacts by their IDs.
    /// </summary>
    /// <param name="chatArtifactIds">A collection of artifact IDs to delete.</param>
    /// <returns>A service response containing the number of artifacts deleted.</returns>
    Task<ServiceResponse<int>> DeleteMultipleChatArtifactsAsync(IEnumerable<Guid> chatArtifactIds);
}
