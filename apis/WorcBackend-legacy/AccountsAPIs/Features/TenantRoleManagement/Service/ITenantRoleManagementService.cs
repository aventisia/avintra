namespace AccountsAPIs.Services;

/// <summary>
/// Service interface for managing tenant roles within the application.
/// </summary>
public interface ITenantRoleManagementService
{
    /// <summary>
    /// Retrieves a list of all roles available in the application.
    /// </summary>
    /// <returns>A service response containing a list of tenant role DTOs.</returns>
    Task<ServiceResponse<IEnumerable<TenantRoleDto>>> GetRoleListAsync();

    /// <summary>
    /// Checks whether a role name is available for use.
    /// </summary>
    /// <param name="checkAvailabilityDto">DTO containing the name of the role to check.</param>
    /// <returns>A service response with a boolean result indicating availability.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsRoleAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Creates a new tenant role.
    /// </summary>
    /// <param name="tenantRoleDto">DTO containing details of the role to be created.</param>
    /// <returns>A service response containing the created role.</returns>
    Task<ServiceResponse<TenantRoleDto>> InsertRoleAsync(TenantRoleDto tenantRoleDto);

    /// <summary>
    /// Retrieves the details of a specific role by its unique identifier.
    /// </summary>
    /// <param name="tenantRoleId">The unique identifier of the role.</param>
    /// <returns>A service response containing the retrieved role DTO.</returns>
    Task<ServiceResponse<TenantRoleDto>> GetRoleByIdAsync(Guid tenantRoleId);

    /// <summary>
    /// Updates the details of an existing tenant role.
    /// </summary>
    /// <param name="tenantRoleDto">DTO containing updated role details.</param>
    /// <returns>A service response containing the updated role DTO.</returns>
    Task<ServiceResponse<TenantRoleDto>> UpdateRoleAsync(TenantRoleDto tenantRoleDto);

    /// <summary>
    /// Deletes a role based on its unique identifier.
    /// </summary>
    /// <param name="tenantRoleId">The unique identifier of the role to delete.</param>
    /// <returns>A service response containing a boolean value indicating success or failure.</returns>
    Task<ServiceResponse<bool>> DeleteRoleAsync(Guid tenantRoleId);

    /// <summary>
    /// Deletes multiple roles based on a collection of role IDs.
    /// </summary>
    /// <param name="tenantRoleIds">A collection of unique identifiers for the roles to delete.</param>
    /// <returns>A service response indicating whether the bulk deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteMultipleRolesAsync(IEnumerable<Guid> tenantRoleIds);

    /// <summary>
    /// Retrieves a list of account roles formatted as select options (e.g., for dropdowns).
    /// </summary>
    /// <returns>
    /// A service response containing a collection of <see cref="SelectOption"/> representing available account roles.
    /// </returns>
    Task<ServiceResponse<IEnumerable<SelectOption>>> GetRoleOptionListAsync();
}
