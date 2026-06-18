namespace AccountsAPIs.Services;

public interface ITenantAccountService
{
    // acccounts-api/tenant/user/
    // acccounts-api/tenant/users/
    // acccounts-api/tenant/add-user/
    // acccounts-api/tenant/add-users/
    // acccounts-api/tenant/update-user/
    // acccounts-api/tenant/delete-user/

    /// <summary>
    /// Retrieves the organization details associated with the tenant.
    /// </summary>
    /// <returns>A task representing the asynchronous operation, containing the tenant's organization details.</returns>
    Task<ServiceResponse<TenantOrganizationBillingDto>> GetTenantOrganizationAsync();

    /// <summary>
    /// Updates the organization details for the tenant.
    /// </summary>
    /// <param name="organizationDto">The DTO containing the updated organization information.</param>
    /// <returns>A task representing the asynchronous operation, returning a boolean indicating whether the update was successful.</returns>
    Task<ServiceResponse<TenantOrganizationBillingDto>> UpdateTenantOrganizationAsync(TenantOrganizationBillingDto organizationDto);

    /// <summary>
    /// Retrieves the tenant's preferences.
    /// </summary>
    /// <returns>A task representing the asynchronous operation, containing the tenant's preference details.</returns>
    Task<ServiceResponse<TenantPreferenceDto>> GetTenantPreferencesAsync();

    /// <summary>
    /// Updates the tenant's preferences.
    /// </summary>
    /// <param name="preferencesDto">The DTO containing the updated tenant preferences.</param>
    /// <returns>A task representing the asynchronous operation, returning the updated tenant preferences.</returns>
    Task<ServiceResponse<TenantPreferenceDto>> UpdateTenantPreferencesAsync(TenantPreferenceDto preferencesDto);

    /// <summary>
    /// Retrieves a list of account users whose properties match the provided search key.
    /// </summary>
    /// <param name="searchKey">The keyword to search account users by.</param>
    /// <param name="includeCurrentUser">A flag indicating whether to include the current user in the results.</param>
    /// <returns>A task that returns a service response with an enumerable collection of matching account user DTOs.</returns>
    Task<ServiceResponse<IEnumerable<AppUserBaseDto>>> SearchAccountUserAsync(string searchKey, bool includeCurrentUser);
}