namespace WorkspaceAPIs.Services;

public interface IAssistChatTableService
{
    /// <summary>
    /// Retrieves all assigned (published) flow versions.
    /// </summary>
    /// <returns>A list of assigned flow versions.</returns>
    Task<ServiceResponse<IEnumerable<AssistChatTableDto>>> GetPublishFlowVersionsAsync();

    /// <summary>
    /// Retrieves all archived flow versions.
    /// </summary>
    /// <returns>A list of archived flow versions.</returns>
    Task<ServiceResponse<IEnumerable<AssistChatTableDto>>> GetArchiveFlowVersionsAsync();

    /// <summary>
    /// Updates the details of a specific flow version.
    /// </summary>
    /// <param name="assistChatTableDto">The DTO containing updated flow version details.</param>
    /// <returns>A service response containing the updated flow version data.</returns>
    Task<ServiceResponse<AssistChatTableDto>> UpdateFlowVersionAsync(AssistChatTableDto assistChatTableDto);
}