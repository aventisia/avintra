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
}