namespace WorkspaceAPIs.Services;

/// <summary>
/// Provides operations for managing resource sharing and user access permissions.
/// </summary>
public interface IResourceShareService
{
    /// <summary>
    /// Gets all resources shared with the current user. Optionally filters results by resource type.
    /// </summary>
    /// <param name="resourceType"> Optional resource type used to filter shared resources. </param>
    /// <returns> A collection of resource share details. </returns>
    Task<ServiceResponse<IEnumerable<ResourceShareDto>>> GetMyResourceSharesAsync(ResourceTypeEnum? resourceType = null);

    /// <summary>
    /// Gets all sharing records for a specific resource.
    /// </summary>
    /// <param name="resourceId"> The unique identifier of the resource. </param>
    /// <returns> A collection of users and access levels assigned to the resource. </returns>
    Task<ServiceResponse<IEnumerable<ResourceShareDto>>> GetResourceSharesAsync(Guid resourceId);

    /// <summary>
    /// Gets a resource share by its unique identifier.
    /// </summary>
    /// <param name="resourceShareId"> The unique identifier of the resource share. </param>
    /// <returns> The resource share details. </returns>
    Task<ServiceResponse<ResourceShareDto>> GetResourceShareByIdAsync(Guid resourceShareId);

    /// <summary>
    /// Creates a new resource share and grants access to a user.
    /// </summary>
    /// <param name="resourceShareDto"> The resource share information. </param>
    /// <returns> The created resource share. </returns>
    Task<ServiceResponse<ResourceShareDto>> CreateResourceShareAsync(ResourceShareDto resourceShareDto);

    /// <summary>
    /// Updates an existing resource share.
    /// </summary>
    /// <param name="resourceShareDto"> The updated resource share information. </param>
    /// <returns> The updated resource share. </returns>
    Task<ServiceResponse<ResourceShareDto>> UpdateResourceShareAsync(ResourceShareDto resourceShareDto);

    /// <summary>
    /// Deletes a resource share by its unique identifier.
    /// </summary>
    /// <param name="resourceShareId"> The unique identifier of the resource share. </param>
    /// <returns> <c>true</c> if deletion succeeded; otherwise, <c>false</c>. </returns>
    Task<ServiceResponse<bool>> DeleteResourceShareAsync(Guid resourceShareId);

    /// <summary>
    /// Deletes multiple resource shares.
    /// </summary>
    /// <param name="resourceShareIds"> The collection of resource share identifiers. </param>
    /// <returns> <c>true</c> if all deletions succeeded; otherwise, <c>false</c>. </returns>
    Task<ServiceResponse<bool>> DeleteResourceSharesAsync(IEnumerable<Guid> resourceShareIds);

    /// <summary>
    /// Validates whether a user has permission to perform an operation on a resource.
    /// Grants access automatically when the user is the creator or the resource is configured as tenant-wide access.
    /// </summary>
    /// <param name="userId">The user requesting access.</param>
    /// <param name="resourceId">The unique identifier of the resource.</param>
    /// <param name="resourceType">The type of resource being accessed.</param>
    /// <param name="createdByUserId">The identifier of the resource creator.</param>
    /// <param name="isTenantWideAccess"> Indicates whether the resource is accessible to all users in the tenant. </param>
    /// <param name="accessLevels"> Allowed access levels required for the operation. </param>
    /// <returns> <c>true</c> if access is granted; otherwise <c>false</c>. </returns>
    Task<bool> HasAccessAsync(
        Guid userId,
        Guid resourceId,
        ResourceTypeEnum resourceType,
        Guid createdByUserId,
        bool isTenantWideAccess = false,
        params ResourceAccessTypeEnum[] accessLevels);

    /// <summary>
    /// Retrieves identifiers of resources shared with a user based on allowed access levels.
    /// </summary>
    /// <param name="userId">The user identifier.</param>
    /// <param name="resourceType">The type of resource.</param>
    /// <param name="accessLevels"> Access levels used to filter accessible resources.
    /// </param>
    /// <returns>  Collection of resource identifiers the user can access. </returns>
    Task<List<Guid>> GetAccessibleResourceIdsAsync(Guid userId, ResourceTypeEnum resourceType, params ResourceAccessTypeEnum[] accessLevels);


    /// <summary>
    /// Retrieves resources accessible to the specified user for the given resource type
    /// and returns a mapping of resource identifiers to their corresponding access levels.
    /// </summary>
    /// <param name="userId"> The unique identifier of the user whose accessible resources are retrieved. </param>
    /// <param name="resourceType"> The type of resource to filter access mappings.  </param>
    /// <param name="accessLevels"> One or more access levels used to filter accessible resources. </param>
    /// <return> Returns an empty dictionary if no resources are found or an error occurs. </returns>
    Task<Dictionary<Guid, ResourceAccessTypeEnum>> GetAccessibleResourcesWithAccessAsync(Guid userId, ResourceTypeEnum resourceType, params ResourceAccessTypeEnum[] accessLevels);

    /// <summary>
    /// Assigns owner permission to a user after a resource is created.
    /// </summary>
    /// <param name="userId">The owner user identifier.</param>
    /// <param name="resourceId">The resource identifier.</param>
    /// <param name="resourceType">The resource type.</param>
    /// <returns> <c>true</c> if owner assignment succeeds; otherwise <c>false</c>. </returns>
    Task<bool> AssignOwnerAsync(Guid userId, Guid resourceId, ResourceTypeEnum resourceType);

    /// <summary>
    /// Deletes all resource share mappings associated with a single resource.
    /// </summary>
    /// <param name="resourceId"> The unique identifier of the resource. </param>
    /// <param name="resourceType"> The type of resource. </param>
    Task DeleteResourceSharesAsync(Guid resourceId, ResourceTypeEnum resourceType);

    /// <summary>
    /// Deletes all resource share mappings associated with multiple resources.
    /// </summary>
    /// <param name="resourceIds"> Collection of resource identifiers. </param>
    /// <param name="resourceType"> The type of resource. </param>
    Task DeleteResourceSharesAsync(IEnumerable<Guid> resourceIds, ResourceTypeEnum resourceType);
}