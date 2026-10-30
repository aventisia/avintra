namespace GlobalAdminAPIs.Services;

/// <summary>
/// Defines the service operations for managing on-premises tenants, including availability checks, 
/// CRUD (Create, Read, Update, Delete) operations, and bulk deletion of tenants.
/// </summary>
public interface IOnPremTenantService
{
    /// <summary>
    /// Checks the availability of a specific tenant name.
    /// </summary>
    /// <param name="checkAvailabilityDto">The DTO containing the tenant name and other relevant context to verify availability.</param>
    /// <returns>A ServiceResponse containing a TrueFalseResultDto indicating whether the tenant name is available.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsOnPremTenantNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Retrieves all on-premises tenants.
    /// </summary>
    /// <returns>A ServiceResponse containing a collection of OnPremTenantDto objects.</returns>
    Task<ServiceResponse<IEnumerable<OnPremTenantDto>>> GetAllOnPremTenantsAsync();

    /// <summary>
    /// Retrieves a specific on-premises tenant by its unique identifier.
    /// </summary>
    /// <param name="onPremTenantId">The unique identifier for the on-premises tenant.</param>
    /// <returns>A ServiceResponse containing the details of the specified on-premises tenant.</returns>
    Task<ServiceResponse<OnPremTenantDto>> GetOnPremTenantAsync(Guid onPremTenantId);

    /// <summary>
    /// Retrieves a specific on-premises tenant by its name.
    /// </summary>
    /// <param name="tenantName">The name of the on-premises tenant.</param>
    /// <returns>A ServiceResponse containing the details of the specified on-premises tenant.</returns>
    Task<ServiceResponse<OnPremTenantDto>> GetOnPremTenantByNameAsync(string tenantName);

    /// <summary>
    /// Inserts a new on-premises tenant into the system.
    /// </summary>
    /// <param name="onPremTenantDto">The DTO containing the on-premises tenant data to be added.</param>
    /// <returns>A ServiceResponse containing the details of the newly created on-premises tenant.</returns>
    Task<ServiceResponse<OnPremTenantDto>> InsertOnPremTenantAsync(OnPremTenantDto onPremTenantDto);

    /// <summary>
    /// Updates an existing on-premises tenant in the system.
    /// </summary>
    /// <param name="onPremTenantDto">The DTO containing the updated on-premises tenant data.</param>
    /// <returns>A ServiceResponse containing the updated details of the on-premises tenant.</returns>
    Task<ServiceResponse<OnPremTenantDto>> UpdateOnPremTenantAsync(OnPremTenantDto onPremTenantDto);

    /// <summary>
    /// Deletes a specific on-premises tenant by its unique identifier.
    /// </summary>
    /// <param name="onPremTenantId">The unique identifier of the on-premises tenant to be deleted.</param>
    /// <returns>A ServiceResponse indicating whether the deletion was successful or not.</returns>
    Task<ServiceResponse<bool>> DeleteOnPremTenantAsync(Guid onPremTenantId);

    /// <summary>
    /// Deletes multiple on-premises tenants based on a list of unique identifiers.
    /// </summary>
    /// <param name="onPremTenantIds">The list of unique identifiers for the on-premises tenants to be deleted.</param>
    /// <returns>A ServiceResponse indicating the success or failure of the bulk deletion process.</returns>
    Task<ServiceResponse<bool>> DeleteMultipleOnPremTenantsAsync(IEnumerable<Guid> onPremTenantIds);

    /// <summary>
    /// Searches for on-premises tenants by their name, returning tenants that match the provided search term.
    /// </summary>
    /// <param name="tenantName">The name (or part of the name) of the on-premises tenants to search for.</param>
    /// <returns>A ServiceResponse containing a collection of OnPremTenantDto objects that match the search term.</returns>
    Task<ServiceResponse<IEnumerable<OnPremTenantDto>>> SearchOnPremTenantsByNameAsync(string tenantName);

    /// <summary>
    /// Retrieves the statistics for a specific on-premises tenant by its unique identifier.
    /// </summary>
    /// <param name="onPremTenantId">The unique identifier of the on-premises tenant.</param>
    /// <returns>A ServiceResponse containing the statistics for the specified on-premises tenant.</returns>
    Task<ServiceResponse<OnpremInstanceStaticDto>> GetOnPremTenantStatsByIdAsync(Guid onPremTenantId);

    /// <summary>
    /// Retrieves the statistics for a specific on-premises tenant by its name.
    /// </summary>
    /// <param name="onPremTenantName">The name of the on-premises tenant.</param>
    /// <returns>A ServiceResponse containing the statistics for the specified on-premises tenant.</returns>
    Task<ServiceResponse<OnpremInstanceStaticDto>> GetOnPremTenantStatsByNameAsync(string onPremTenantName);
}