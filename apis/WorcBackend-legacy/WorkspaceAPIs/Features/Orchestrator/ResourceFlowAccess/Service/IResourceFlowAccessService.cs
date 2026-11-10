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
    /// <param name="flowIds">The complete set of flow identifiers to assign; an empty set removes all and opens the resource to every flow.</param>
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
    /// Checks that a flow is assigned to every restricted resource its saved configuration references, resolved in the run's environment.
    /// </summary>
    /// <param name="tenantId">The tenant the run belongs to.</param>
    /// <param name="envType">The environment the run uses.</param>
    /// <param name="spaceId">The space the run resolves resources in; null or <see cref="Guid.Empty"/> means Central.</param>
    /// <param name="flowId">The flow (agent) that owns the root graph.</param>
    /// <param name="reactFlowObject">The saved React Flow graph of the root flow version.</param>
    /// <returns>A service response that is 200 when every reference is allowed, or 403 with a message naming each blocking resource.</returns>
    Task<ServiceResponse<bool>> ValidateRunResourceAccessAsync(Guid tenantId, ConfigureEnvironmentType envType, Guid? spaceId, Guid flowId, string? reactFlowObject);

    /// <summary>
    /// Retrieves, in one query, the identifiers of the resources assigned to each of the given flows.
    /// Flows without rows are absent from the result.
    /// </summary>
    /// <param name="resourceType">The type of resource.</param>
    /// <param name="flowIds">The flow identifiers.</param>
    /// <returns>The assigned resource identifiers keyed by flow identifier.</returns>
    Task<Dictionary<Guid, HashSet<Guid>>> GetAssignedResourceIdsAsync(ResourceTypeEnum resourceType, IEnumerable<Guid> flowIds);

    /// <summary>
    /// Retrieves, in one query, the names of the flows assigned to each of the given resources.
    /// Resources without rows are absent from the result.
    /// </summary>
    /// <param name="resourceType">The type of resource.</param>
    /// <param name="resourceIds">The resource identifiers.</param>
    /// <returns>The assigned flow names keyed by resource identifier.</returns>
    Task<Dictionary<Guid, List<string>>> GetAssignedFlowNamesAsync(ResourceTypeEnum resourceType, IEnumerable<Guid> resourceIds);

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
