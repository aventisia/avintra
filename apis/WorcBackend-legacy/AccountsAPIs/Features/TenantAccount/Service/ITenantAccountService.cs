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
    /// Updates the tenant's single sign-on state.
    /// </summary>
    /// <param name="tenantSsoStateDto">The DTO containing the requested single sign-on state.</param>
    /// <returns>A task representing the asynchronous operation, returning the updated tenant preferences.</returns>
    Task<ServiceResponse<TenantPreferenceDto>> UpdateTenantSsoStateAsync(TenantSsoStateDto tenantSsoStateDto);

    /// <summary>
    /// Generates the administrator consent URL for connecting the tenant's identity provider.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation, containing the consent URL.</returns>
    Task<ServiceResponse<string>> GetSsoAdminConsentUrlAsync();

    /// <summary>
    /// Binds the tenant granted by the identity provider to the tenant's single sign-on configuration.
    /// </summary>
    /// <param name="grantedTenantId">The external tenant identifier returned by the identity provider.</param>
    /// <param name="state">The single-use OAuth state returned by the identity provider.</param>
    /// <returns>A task that represents the asynchronous operation, containing the updated tenant preferences.</returns>
    Task<ServiceResponse<TenantPreferenceDto>> CompleteSsoAdminConsentAsync(string grantedTenantId, string? state);

    /// <summary>
    /// Retrieves the tenant's automatic notification settings, applying per-type defaults
    /// for any missing keys (FR-2, FR-6).
    /// </summary>
    /// <returns>A task representing the asynchronous operation, containing the tenant's notification settings.</returns>
    Task<ServiceResponse<NotificationSettingsDto>> GetNotificationSettingsAsync();

    /// <summary>
    /// Updates the tenant's automatic notification settings (FR-3). The full settings
    /// object is applied; the numeric configuration properties are validated to be greater
    /// than zero before persisting.
    /// </summary>
    /// <param name="settingsDto">The notification settings to apply.</param>
    /// <returns>A task representing the asynchronous operation, returning the updated notification settings.</returns>
    Task<ServiceResponse<NotificationSettingsDto>> UpdateNotificationSettingsAsync(NotificationSettingsDto settingsDto);
}