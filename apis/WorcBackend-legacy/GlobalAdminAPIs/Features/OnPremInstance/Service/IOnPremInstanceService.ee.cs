namespace GlobalAdminAPIs.Services;

/// <summary>
/// Defines the service operations for managing on-premises tenant instances, including availability checks, 
/// CRUD (Create, Read, Update, Delete) operations, and bulk deletion of tenant instances.
/// </summary>
public interface IOnPremInstanceService
{
    /// <summary>
    /// Verifies if a specific on-premises tenant instance name is available for use.
    /// </summary>
    /// <param name="onPremTenantId">The unique identifier of the on-premises tenant.</param>
    /// <param name="checkAvailabilityDto">The DTO containing the tenant instance name and additional context to check availability.</param>
    /// <returns>A ServiceResponse containing a TrueFalseResultDto indicating whether the specified tenant instance name is available or not.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsOnPremInstanceNameAvailableAsync(Guid onPremTenantId, CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Fetches all the on-premises instances associated with the specified tenant.
    /// </summary>
    /// <returns>A ServiceResponse containing a collection of OnPremInstanceDto objects.</returns>
    Task<ServiceResponse<IEnumerable<OnPremInstanceDto>>> GetAllOnPremInstancesAsync(Guid onPremTenantId);

    /// <summary>
    /// Retrieves a specific on-premises tenant instance by its unique identifier.
    /// </summary>
    /// <param name="OnPremInstanceId">The unique identifier for the on-premises tenant instance.</param>
    /// <returns>A ServiceResponse containing the details of the specified on-premises tenant instance.</returns>
    Task<ServiceResponse<OnPremInstanceDto>> GetOnPremInstanceAsync(Guid OnPremInstanceId);

    /// <summary>
    /// Retrieves a specific on-premises tenant instance by its name.
    /// </summary>
    /// <param name="tenantInstanceName">The name of the on-premises tenant instance.</param>
    /// <returns>A ServiceResponse containing the details of the specified on-premises tenant instance.</returns>
    Task<ServiceResponse<OnPremInstanceDto>> GetOnPremInstanceByNameAsync(string tenantInstanceName);

    /// <summary>
    /// Inserts a new on-premises tenant instance into the system.
    /// </summary>
    /// <param name="OnPremInstanceDto">The DTO containing the on-premises tenant instance data to be added.</param>
    /// <returns>A ServiceResponse containing the details of the newly created on-premises tenant instance.</returns>
    Task<ServiceResponse<OnPremInstanceDto>> InsertOnPremInstanceAsync(OnPremInstanceDto OnPremInstanceDto);

    /// <summary>
    /// Updates an existing on-premises tenant instance in the system.
    /// </summary>
    /// <param name="OnPremInstanceDto">The DTO containing the updated on-premises tenant instance data.</param>
    /// <returns>A ServiceResponse containing the updated details of the on-premises tenant instance.</returns>
    Task<ServiceResponse<OnPremInstanceDto>> UpdateOnPremInstanceAsync(OnPremInstanceDto OnPremInstanceDto);

    /// <summary>
    /// Deletes a specific on-premises tenant instance by its unique identifier.
    /// </summary>
    /// <param name="OnPremInstanceId">The unique identifier of the on-premises tenant instance to be deleted.</param>
    /// <returns>A ServiceResponse indicating whether the deletion was successful or not.</returns>
    Task<ServiceResponse<bool>> DeleteOnPremInstanceAsync(Guid OnPremInstanceId);

    /// <summary>
    /// Deletes multiple on-premises tenant instances based on a list of unique identifiers.
    /// </summary>
    /// <param name="OnPremInstanceIds">The list of unique identifiers for the on-premises tenant instances to be deleted.</param>
    /// <returns>A ServiceResponse indicating the success or failure of the bulk deletion process.</returns>
    Task<ServiceResponse<bool>> DeleteMultipleOnPremInstancesAsync(IEnumerable<Guid> OnPremInstanceIds);

    /// <summary>
    /// Searches for on-premises tenant instances by their name, returning tenant instances that match the provided search term.
    /// </summary>
    /// <param name="tenantInstanceName">The name (or part of the name) of the on-premises tenant instances to search for.</param>
    /// <returns>A ServiceResponse containing a collection of OnPremInstanceDto objects that match the search term.</returns>
    Task<ServiceResponse<IEnumerable<OnPremInstanceDto>>> SearchOnPremInstancesByNameAsync(string tenantInstanceName);

    /// <summary>
    /// Retrieves the statistics for a specific on-premises tenant instance by its unique identifier.
    /// </summary>
    /// <param name="onPremInstanceId">The unique identifier of the on-premises tenant instance.</param>
    /// <returns>A ServiceResponse containing the statistics for the specified on-premises tenant instance.</returns>
    Task<ServiceResponse<OnpremInstanceStaticDto>> GetOnPremInstanceStatsAsync(Guid onPremInstanceId);

    /// <summary>
    /// Retrieves the statistics for a specific on-premises tenant instance by its name.
    /// </summary>
    /// <param name="tenantInstanceName">The name of the on-premises tenant instance.</param>
    /// <returns>A ServiceResponse containing the statistics for the specified on-premises tenant instance.</returns>
    Task<ServiceResponse<OnpremInstanceStaticDto>> GetOnPremInstanceStatsByNameAsync(string tenantInstanceName);
}

