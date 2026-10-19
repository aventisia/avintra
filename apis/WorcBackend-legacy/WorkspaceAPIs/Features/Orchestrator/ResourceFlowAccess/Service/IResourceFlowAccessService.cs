namespace WorkspaceAPIs.Services;

/// <summary>
/// Manages the flows granted access to a resource.
/// </summary>
public interface IResourceFlowAccessService
{
    /// <summary>
    /// Assigns the given flows to a resource, replacing the existing assignment set.
    /// </summary>
    /// <param name="resourceType">The type of resource.</param>
    /// <param name="resourceId">The resource identifier.</param>
    /// <param name="flowIds">The complete set of flow identifiers to assign; an empty set removes all and opens the tool to every flow.</param>
    /// <returns>A service response with the assigned and removed counts and the published flows left outside the list.</returns>
    Task<ServiceResponse<AssignResourceFlowsResultDto>> AssignFlowsAsync(ResourceTypeEnum resourceType, Guid resourceId, IEnumerable<Guid> flowIds);

    /// <summary>
    /// Retrieves the flows currently assigned to a resource.
    /// </summary>
    /// <param name="resourceType">The type of resource.</param>
    /// <param name="resourceId">The resource identifier.</param>
    /// <returns>A service response containing the assigned flows.</returns>
    Task<ServiceResponse<IEnumerable<ResourceAssignedFlowDto>>> GetAssignedFlowsAsync(ResourceTypeEnum resourceType, Guid resourceId);

    /// <summary>
    /// Retrieves, in one query, the identifiers of the flows assigned to each of the given resources.
    /// Resources without rows are absent from the result.
    /// </summary>
    /// <param name="resourceType">The type of resource.</param>
    /// <param name="resourceIds">The resource identifiers.</param>
    /// <returns>The assigned flow identifiers keyed by resource identifier.</returns>
    Task<Dictionary<Guid, HashSet<Guid>>> GetAssignedFlowIdsAsync(ResourceTypeEnum resourceType, IEnumerable<Guid> resourceIds);

    /// <summary>
    /// Stages the removal of every flow assignment for a resource.
    /// </summary>
    /// <param name="resourceType">The type of resource.</param>
    /// <param name="resourceId">The resource identifier.</param>
    Task DeleteResourceFlowAccessesAsync(ResourceTypeEnum resourceType, Guid resourceId);

    /// <summary>
    /// Stages the removal of every flow assignment for the given resources.
    /// </summary>
    /// <param name="resourceType">The type of resource.</param>
    /// <param name="resourceIds">The resource identifiers.</param>
    Task DeleteResourceFlowAccessesAsync(ResourceTypeEnum resourceType, IEnumerable<Guid> resourceIds);

    /// <summary>
    /// Stages the removal of every flow assignment for a flow left without an active version by the archive.
    /// </summary>
    /// <param name="flowId">The flow identifier.</param>
    /// <param name="archivingVersionId">The identifier of the version being archived.</param>
    Task DeleteFlowAccessesIfArchivedAsync(Guid flowId, Guid archivingVersionId);
}
