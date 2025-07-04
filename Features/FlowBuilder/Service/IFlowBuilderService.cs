namespace WorkspaceAPIs.Services;

/// <summary>
/// Represents a service for managing flow builder feature.
/// </summary>
public interface IFlowBuilderService
{
    /// <summary>
    /// Retrieves the flow record to load when the user opens it in the studio.
    /// </summary>
    /// <param name="flowId">The unique identifier of the flow record (Primary Key).</param>
    /// <param name="versionId">The optional identifier for the flow version to load. If not provided, the latest version will be used.</param>
    /// <returns>The task result contains the service response with the flow properties required for the studio on load.</returns>
    Task<ServiceResponse<LoadFlowDto>> GetFlowToLoadAsync(Guid flowId, Guid? versionId);

    /// <summary>
    /// Updates the flow's nodes, edges, etc. silently in the background whenever the user makes any changes
    /// </summary>
    /// <param name="flowSilentUpdateDto">The data required to update the flow silently.</param>
    /// <returns>The task result contains the service response indicating whether the update job was successful.</returns>
    Task<ServiceResponse<bool>> UpdateFlowSilentlyAsync(FlowSilentUpdateDto flowSilentUpdateDto);

    /// <summary>
    /// Publishes the flow version in the background whenever the user makes changes, without manual action.
    /// </summary>
    /// <param name="publishFlowVersionDto">The data required to publish the flow version silently.</param>
    /// <returns>A task that returns a service response indicating whether the publish operation was successful.</returns>
    Task<ServiceResponse<bool>> PublishFlowVersionAsync(PublishFlowVersionDto publishFlowVersionDto);
}