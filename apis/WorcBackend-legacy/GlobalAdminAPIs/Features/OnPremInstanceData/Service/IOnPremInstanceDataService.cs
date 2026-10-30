namespace GlobalAdminAPIs.Services;

/// <summary>
/// Defines the service operations for managing on-premises instance data, including availability checks, 
/// CRUD (Create, Read, Update, Delete) operations, and bulk removal of instance data.
/// </summary>
public interface IOnPremInstanceDataService
{
    /// <summary>
    /// Retrieves all instance data associated with an on-premises tenant, optionally filtered by a date range.
    /// </summary>
    /// <param name="onPremInstanceId">The unique identifier for the on-premises tenant instance.</param>
    /// <param name="startDate">The optional start date for filtering the usage period. If not provided, no start date filter is applied.</param>
    /// <param name="endDate">The optional end date for filtering the usage period. If not provided, no end date filter is applied.</param>
    /// <returns>A ServiceResponse containing a list of OnPremInstanceDataDto objects, filtered by the provided date range if applicable.</returns>
    Task<ServiceResponse<IEnumerable<OnPremInstanceDataDto>>> GetAllOnPremInstanceDataAsync(Guid onPremInstanceId, DateTimeOffset? startDate = null, DateTimeOffset? endDate = null);

    /// <summary>
    /// Retrieves specific instance data for an on-premises tenant by its unique ID.
    /// </summary>
    /// <param name="onPremInstanceDataId">The unique ID of the on-premises instance data.</param>
    /// <returns>A ServiceResponse containing the specified on-premises instance data.</returns>
    Task<ServiceResponse<OnPremInstanceDataDto>> GetOnPremInstanceDataByIdAsync(Guid onPremInstanceDataId);

    /// <summary>
    /// Adds new on-premises instance data to the system.
    /// </summary>
    /// <param name="onPremInstanceDataDto">The on-premises instance data to be added.</param>
    /// <returns>A ServiceResponse containing the details of the newly added instance data.</returns>
    Task<ServiceResponse<OnPremInstanceDataDto>> InsertOnPremInstanceDataAsync(OnPremInstanceDataDto onPremInstanceDataDto);

    /// <summary>
    /// Updates the details of existing on-premises instance data.
    /// </summary>
    /// <param name="onPremInstanceDataDto">The updated instance data to be saved.</param>
    /// <returns>A ServiceResponse containing the updated on-premises instance data.</returns>
    Task<ServiceResponse<OnPremInstanceDataDto>> UpdateOnPremInstanceDataAsync(OnPremInstanceDataDto onPremInstanceDataDto);

    /// <summary>
    /// Removes a specific instance data entry for an on-premises tenant by its unique ID.
    /// </summary>
    /// <param name="onPremInstanceDataId">The unique ID of the instance data to be removed.</param>
    /// <returns>A ServiceResponse indicating the success or failure of the removal operation.</returns>
    Task<ServiceResponse<bool>> DeleteOnPremInstanceDataAsync(Guid onPremInstanceDataId);

    /// <summary>
    /// Removes multiple on-premises instance data entries based on a list of unique IDs.
    /// </summary>
    /// <param name="onPremInstanceDataIds">A list of unique IDs for the instance data entries to be removed.</param>
    /// <returns>A ServiceResponse indicating the success or failure of the bulk removal operation.</returns>
    Task<ServiceResponse<bool>> DeleteMultipleOnPremInstanceDataAsync(IEnumerable<Guid> onPremInstanceDataIds);
}
