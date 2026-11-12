namespace WorkspaceAPIs.Services;

/// <summary>
/// Provides operations for managing resource user access and user access permissions.
/// </summary>
public interface IResourceUserAccessService
{
    /// <summary>
    /// Gets all resources shared with the current user. Optionally filters results by resource type.
    /// </summary>
    /// <param name="resourceType"> Optional resource type used to filter shared resources. </param>
    /// <returns> A collection of resource user access details. </returns>
    Task<ServiceResponse<IEnumerable<ResourceUserAccessDto>>> GetMyResourceUserAccessesAsync(ResourceTypeEnum? resourceType = null);

    /// <summary>
    /// Gets all sharing records for a specific resource.
    /// </summary>
    /// <param name="resourceId"> The unique identifier of the resource. </param>
    /// <returns> A collection of users and access levels assigned to the resource. </returns>
    Task<ServiceResponse<IEnumerable<ResourceUserAccessDto>>> GetResourceUserAccessesAsync(Guid resourceId);

    /// <summary>
    /// Gets a resource user access by its unique identifier.
    /// </summary>
    /// <param name="resourceUserAccessId"> The unique identifier of the resource user access. </param>
    /// <returns> The resource user access details. </returns>
    Task<ServiceResponse<ResourceUserAccessDto>> GetResourceUserAccessByIdAsync(Guid resourceUserAccessId);

    /// <summary>
    /// Creates a new resource user access and grants access to a user.
    /// </summary>
    /// <param name="resourceUserAccessDto"> The resource user access information. </param>
    /// <returns> The created resource user access. </returns>
    Task<ServiceResponse<ResourceUserAccessDto>> CreateResourceUserAccessAsync(ResourceUserAccessDto resourceUserAccessDto);

    /// <summary>
    /// Creates resource user access records and grants access to multiple users for the specified resource.
    /// </summary>
    /// <param name="createResourceUserAccessDto"> The resource user access request containing the resource details and recipient access assignments. </param>
    /// <returns> A service response indicating whether the bulk resource user access operation completed successfully. </returns>
    Task<ServiceResponse<bool>> CreateBulkResourceUserAccessAsync(CreateResourceUserAccessDto createResourceUserAccessDto);

    /// <summary>
    /// Updates an existing resource user access.
    /// </summary>
    /// <param name="resourceUserAccessDto"> The updated resource user access information. </param>
    /// <returns> The updated resource user access. </returns>
    Task<ServiceResponse<ResourceUserAccessDto>> UpdateResourceUserAccessAsync(ResourceUserAccessDto resourceUserAccessDto);

    /// <summary>
    /// Enables or disables tenant-wide access for a resource.
    /// </summary>
    /// <param name="updateTenantWideAccessDto"> Contains the resource type, resource identifier, and whether tenant-wide access should be enabled. </param>
    /// <returns> A service response indicating whether the tenant-wide access setting was updated successfully.  </returns>
    Task<ServiceResponse<bool>> UpdateTenantWideAccessAsync(UpdateTenantWideAccessDto updateTenantWideAccessDto);

    /// <summary>
    /// Revokes the current user's access to the specified resource.
    /// </summary>
    /// <param name="resourceId"> The unique identifier of the resource. </param>
    /// <returns> A service response indicating whether the user's access was successfully revoked. </returns>
    Task<ServiceResponse<bool>> RevokeMyAccessAsync(Guid resourceId);

    /// <summary>
    /// Deletes a resource user access by its unique identifier.
    /// </summary>
    /// <param name="resourceUserAccessId"> The unique identifier of the resource user access. </param>
    /// <returns> <c>true</c> if deletion succeeded; otherwise, <c>false</c>. </returns>
    Task<ServiceResponse<bool>> DeleteResourceUserAccessAsync(Guid resourceUserAccessId);

    /// <summary>
    /// Deletes multiple resource user access records.
    /// </summary>
    /// <param name="resourceUserAccessIds"> The collection of resource user access identifiers. </param>
    /// <returns> <c>true</c> if all deletions succeeded; otherwise, <c>false</c>. </returns>
    Task<ServiceResponse<bool>> DeleteResourceUserAccessesAsync(IEnumerable<Guid> resourceUserAccessIds);

    /// <summary>
    /// Evaluates a user's access to a resource and returns both the authorization result and the user's effective access level.
    /// Access is automatically granted when the user is the resource creator or the resource is configured for tenant-wide access.
    /// </summary>
    /// <param name="userId">The user requesting access.</param>
    /// <param name="resourceId">The unique identifier of the resource.</param>
    /// <param name="resourceType">The type of resource being accessed.</param>
    /// <param name="createdByUserId">The identifier of the resource creator.</param>
    /// <param name="isTenantWideAccess"> Indicates whether the resource is accessible to all users within the tenant. </param>
    /// <param name="accessLevels"> The access levels permitted for the requested operation. </param>
    /// <returns> A tuple containing:
    /// <para>  <c>HasAccess</c> - Indicates whether the user is authorized to access the resource. </para>
    /// <para> <c>AccessLevel</c> - The user's effective access level, or <c>null</c> if no explicit access level exists. </para>
    /// </returns>
    Task<(bool HasAccess, ResourceAccessTypeEnum? AccessLevel)> GetResourceAccessAsync(
        Guid userId,
        Guid resourceId,
        ResourceTypeEnum resourceType,
        Guid createdByUserId,
        bool isTenantWideAccess = false,
        params ResourceAccessTypeEnum[] accessLevels);

    /// <summary>
    /// Checks whether the current user may share a resource.
    /// Only the resource creator or a holder of an Owner row may share it; tenant-wide access does not.
    /// </summary>
    /// <param name="resourceId">The unique identifier of the resource.</param>
    /// <param name="resourceType">The type of resource.</param>
    /// <returns><c>true</c> when the resource exists and the current user may share it; otherwise, <c>false</c>.</returns>
    Task<bool> CanShareResourceAsync(Guid resourceId, ResourceTypeEnum resourceType);

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
    /// Deletes all resource user access mappings associated with a single resource.
    /// </summary>
    /// <param name="resourceId"> The unique identifier of the resource. </param>
    /// <param name="resourceType"> The type of resource. </param>
    Task DeleteResourceUserAccessesAsync(Guid resourceId, ResourceTypeEnum resourceType);

    /// <summary>
    /// Deletes all resource user access mappings associated with multiple resources.
    /// </summary>
    /// <param name="resourceIds"> Collection of resource identifiers. </param>
    /// <param name="resourceType"> The type of resource. </param>
    Task DeleteResourceUserAccessesAsync(IEnumerable<Guid> resourceIds, ResourceTypeEnum resourceType);
}