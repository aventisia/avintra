namespace WorkspaceAPIs.Services;

/// <summary>
/// Provides methods for managing tool associations with flow versions.
/// </summary>
public interface IFlowVersionToolService
{
    /// <summary>
    /// Retrieves all tools linked to the specified flow version.
    /// </summary>
    /// <param name="flowVersionId">The identifier of the flow version.</param>
    /// <returns>A collection of linked tools.</returns>
    Task<ServiceResponse<IEnumerable<FlowVersionToolDto>>> GetFlowVersionToolsAsync(Guid flowVersionId);

    /// <summary>
    /// Links a tool to a flow version.
    /// </summary>
    /// <param name="flowVersionToolDto">The tool association details.</param>
    /// <returns>The created tool association.</returns>
    Task<ServiceResponse<FlowVersionToolDto>> LinkToolToFlowVersionAsync(FlowVersionToolDto flowVersionToolDto);

    /// <summary>
    /// Updates an existing tool association for a flow version.
    /// </summary>
    /// <param name="flowVersionToolDto">The updated tool association details.</param>
    /// <returns>The updated tool association.</returns>
    Task<ServiceResponse<FlowVersionToolDto>> UpdateFlowVersionToolAsync(FlowVersionToolDto flowVersionToolDto);

    /// <summary>
    /// Deletes a tool association from a flow version.
    /// </summary>
    /// <param name="flowVersionToolId">The identifier of the tool association.</param>
    /// <returns><c>true</c> if the association was deleted; otherwise, <c>false</c>.</returns>
    Task<ServiceResponse<bool>> DeleteFlowVersionToolAsync(Guid flowVersionToolId);
}