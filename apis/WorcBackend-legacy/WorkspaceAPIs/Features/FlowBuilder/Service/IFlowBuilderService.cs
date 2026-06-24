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
    /// <param name="versionId">The optional identifier for the flow version to load.</param>
    /// <returns>The task result contains the service response with the flow properties required for the studio on load.</returns>
    Task<ServiceResponse<LoadFlowDto>> GetFlowToLoadAsync(Guid flowId, Guid? versionId);

    /// <summary>
    /// Updates the flow's nodes, edges, etc., and saves the latest data to the current flow version. 
    /// If any changes are detected, it will increment the version number and store the flow version history.
    /// </summary>
    /// <param name="flowSilentUpdateDto">The data required to update the flow and save the latest data to the current version or create a new version if necessary.</param>
    /// <returns>A task result containing a service response indicating whether the update or version save was successful.</returns>
    Task<ServiceResponse<bool>> SaveFlowVersionAsync(FlowSilentUpdateDto flowSilentUpdateDto);

    /// <summary>
    /// Publishes the flow version in the background whenever the user makes changes, without manual action.
    /// </summary>
    /// <param name="publishFlowVersionDto">The data required to publish the flow version silently.</param>
    /// <returns>A task that returns a service response indicating whether the publish operation was successful.</returns>
    Task<ServiceResponse<bool>> PublishFlowVersionAsync(PublishFlowVersionDto publishFlowVersionDto);

    /// <summary>
    /// Fetches the parent flow details of a given parent flow version ID.
    /// </summary>
    /// <param name="parentFlowVersionId">The unique identifier of the parent flow version.</param>
    /// <returns>A task representing the service response containing the parent flow details.</returns>
    Task<ServiceResponse<FetchParentFlowDto>> FetchParentFlowAsync(Guid parentFlowVersionId);

    /// <summary>
    /// Fetch the reactFlowObject of given list of flow version ids
    /// </summary>
    /// <param name="subFlowIds">The list of flow version ids for which to fetch the reactFlowObject.</param>
    /// <returns>A task representing the service response containing the reactFlowObject for the specified flow version ids.</returns>
    Task<ServiceResponse<IEnumerable<FetchSubFlowDto>>> FetchSubFlowsAsync(IEnumerable<Guid> subFlowIds);
}