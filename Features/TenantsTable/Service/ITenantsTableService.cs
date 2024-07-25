namespace AccountsAPIs.Services;

public interface ITenantsTableService
{
    /// <summary>
    /// Retrieves all tenants.
    /// </summary>
    /// <returns>A task representing the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> with the list of retrieved tenants.</returns>
    Task<ServiceResponse<IEnumerable<TenantsTableDto>>> GetTenantsAsync();

    /// <summary>
    /// Checks the availability of a tenant name.
    /// </summary>
    /// <param name="checkAvailabilityDto">The DTO containing the tenant name to check.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> object with a <see cref="TrueFalseResultDto"/> indicating whether the tenant name is available or not.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsTenantNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Inserts a new tenant.
    /// </summary>
    /// <param name="tenantsTableDto">The data for the tenant to insert.</param>
    /// <returns>A task representing the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> with the ID of the inserted tenant.</returns>
    Task<ServiceResponse<TenantsTableDto>> InsertTenantAsync(TenantsTableDto tenantsTableDto);

    /// <summary>
    /// Updates an existing tenant.
    /// </summary>
    /// <param name="tenantsTableDto">The data for the tenant to update.</param>
    /// <returns>A task representing the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> indicating whether the update was successful.</returns>
    Task<ServiceResponse<TenantsTableDto>> UpdateTenantAsync(TenantsTableDto tenantsTableDto);

    /// <summary>
    /// Deletes a tenant by its ID.
    /// </summary>
    /// <param name="id">The ID of the tenant to delete.</param>
    /// <returns>A task representing the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteTenantAsync(Guid id);
}
