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
    /// Builds a binary office file from a spec block and stores it as a generated artifact.
    /// </summary>
    /// <param name="generateFromSpecDto">The conversation and spec block to synthesize.</param>
    /// <returns>A service response containing the stored artifact.</returns>
    Task<ServiceResponse<ChatArtifactDto>> GenerateFromSpecAsync(GenerateFromSpecDto generateFromSpecDto);

    /// <summary>
    /// Deletes an existing chat artifact.
    /// </summary>
    /// <param name="chatArtifactId">The unique identifier of the artifact to delete.</param>
    /// <returns>A service response indicating success or failure.</returns>
    Task<ServiceResponse<bool>> DeleteChatArtifactAsync(Guid chatArtifactId);

    /// <summary>
    /// Shares a chat artifact by issuing a read-only token (idempotent).
    /// </summary>
    /// <param name="chatArtifactId">The unique identifier of the artifact.</param>
    /// <returns>A service response containing the read-only share token.</returns>
    Task<ServiceResponse<string>> ShareChatArtifactAsync(Guid chatArtifactId);

    /// <summary>
    /// Stops sharing a chat artifact by clearing its read-only token.
    /// </summary>
    /// <param name="chatArtifactId">The unique identifier of the artifact.</param>
    /// <returns>A service response indicating success or failure.</returns>
    Task<ServiceResponse<bool>> UnshareChatArtifactAsync(Guid chatArtifactId);

    /// <summary>
    /// Retrieves a shared chat artifact by its read-only token.
    /// </summary>
    /// <param name="shareToken">The read-only share token.</param>
    /// <returns>A service response containing the shared artifact.</returns>
    Task<ServiceResponse<ChatArtifactDto>> GetSharedChatArtifactAsync(string shareToken);

    /// <summary>
    /// Deletes multiple chat artifacts by their IDs.
    /// </summary>
    /// <param name="chatArtifactIds">A collection of artifact IDs to delete.</param>
    /// <returns>A service response containing the number of artifacts deleted.</returns>
    Task<ServiceResponse<int>> DeleteMultipleChatArtifactsAsync(IEnumerable<Guid> chatArtifactIds);

    /// <summary>
    /// Stores the file a finished landing reply wrote, if any, as a generated artifact of its conversation.
    /// </summary>
    /// <param name="conversationId">The conversation the reply belongs to.</param>
    /// <param name="replyText">The reply's full text.</param>
    /// <param name="cancellationToken">Cancels the lookups.</param>
    Task SaveGeneratedFileAsync(Guid conversationId, string replyText, CancellationToken cancellationToken);
}
