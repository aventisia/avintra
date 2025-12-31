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
}