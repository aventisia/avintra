namespace AccountsAPIs.Services;

/// <summary>
/// Defines contract methods for managing roles across tenants in the system.
/// </summary>
public interface IRoleManagementService
{
    /// <summary>
    /// Retrieves a list of all roles associated with the specified tenant.
    /// </summary>
    /// <param name="tenantId">Optional tenant ID for which roles are retrieved. If null, returns roles for all tenants.</param>
    /// <returns>A service response containing a collection of role DTOs.</returns>
    Task<ServiceResponse<IEnumerable<RoleManagementDto>>> GetRoleListAsync(Guid? tenantId);

    /// <summary>
    /// Checks whether a role name is available for the specified tenant.
    /// </summary>
    /// <param name="tenantId">The tenant ID to check the role name against.</param>
    /// <param name="checkAvailability">DTO containing the name to check for availability.</param>
    /// <returns>A service response containing a boolean result indicating name availability.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsRoleAvailableAsync(Guid tenantId, CheckAvailabilityDto checkAvailability);

    /// <summary>
    /// Inserts a new role for a tenant.
    /// </summary>
    /// <param name="roleDto">The role DTO containing details of the role to be created.</param>
    /// <returns>A service response containing the newly created role DTO.</returns>
    Task<ServiceResponse<RoleManagementDto>> InsertRoleAsync(RoleManagementDto roleDto);

    /// <summary>
    /// Retrieves the details of a specific role by its unique identifier.
    /// </summary>
    /// <param name="roleId">The unique identifier of the role to retrieve.</param>
    /// <returns>A service response containing the role DTO.</returns>
    Task<ServiceResponse<RoleManagementDto>> GetRoleByIdAsync(Guid roleId);

    /// <summary>
    /// Updates an existing role for a tenant.
    /// </summary>
    /// <param name="roleDto">The role DTO containing updated role information.</param>
    /// <returns>A service response containing the updated role DTO.</returns>
    Task<ServiceResponse<RoleManagementDto>> UpdateRoleAsync(RoleManagementDto roleDto);

    /// <summary>
    /// Deletes a specific role by its unique identifier.
    /// </summary>
    /// <param name="roleId">The unique identifier of the role to delete.</param>
    /// <returns>A service response indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteRoleAsync(Guid roleId);

    /// <summary>
    /// Deletes multiple roles by their unique identifiers.
    /// </summary>
    /// <param name="roleIds">A collection of role IDs to delete.</param>
    /// <returns>A service response indicating whether the bulk deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteMultipleRolesAsync(IEnumerable<Guid> roleIds);

    /// <summary>
    /// Retrieves a list of account roles formatted as select options (e.g., for dropdowns), filtered by tenant ID.
    /// </summary>
    /// <param name="tenantId">The unique identifier of the tenant whose roles should be retrieved.</param>
    /// <returns>
    /// A service response containing a collection of <see cref="SelectOption"/> representing available account roles.
    /// </returns>
    Task<ServiceResponse<IEnumerable<SelectOption>>> GetRoleOptionListAsync(Guid tenantId);
}
