namespace WorkspaceAPIs.Services;

/// <summary>
/// Represents a service for managing flow builder feature.
/// </summary>
public interface IFlowBuilderService
{
    /// <summary>
    /// Retrieves the flow record to load when the user opens it in the studio.
    /// </summary>
    /// <param name="id">The ID of the flow record (Primary Key).</param>
    /// <returns>The task result contains the service response with the flow properties required for the studio on load.</returns>
    Task<ServiceResponse<LoadFlowDto>> GetFlowToLoadAsync(Guid id);

    /// <summary>
    /// Updates the flow's nodes, edges, etc. silently in the background whenever the user makes any changes
    /// </summary>
    /// <param name="flowSilentUpdateDto">The data required to update the flow silently.</param>
    /// <returns>The task result contains the service response indicating whether the update job was successful.</returns>
    Task<ServiceResponse<bool>> UpdateFlowSilentlyAsync(FlowSilentUpdateDto flowSilentUpdateDto);
}