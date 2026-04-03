namespace WorkspaceAPIs.Services;

public interface IAssistChatService
{
    /// <summary>
    /// Retrieves all assigned (published) flow versions.
    /// </summary>
    /// <returns>A list of assigned flow versions.</returns>
    Task<ServiceResponse<IEnumerable<AssistChatDto>>> GetPublishFlowVersionsAsync();

    /// <summary>
    /// Retrieves all archived flow versions.
    /// </summary>
    /// <returns>A list of archived flow versions.</returns>
    Task<ServiceResponse<IEnumerable<AssistChatDto>>> GetArchiveFlowVersionsAsync();

    /// <summary>
    /// Updates the details of a specific flow version.
    /// </summary>
    /// <param name="assistChatDto">The DTO containing updated flow version details.</param>
    /// <returns>A service response containing the updated flow version data.</returns>
    Task<ServiceResponse<AssistChatDto>> UpdateFlowVersionAsync(AssistChatDto assistChatDto);
}