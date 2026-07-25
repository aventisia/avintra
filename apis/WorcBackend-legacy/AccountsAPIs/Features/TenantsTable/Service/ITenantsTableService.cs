namespace AccountsAPIs.Services;

public interface ITenantsTableService
{
    /// <summary>
    /// Retrieves all tenants.
    /// </summary>
    /// <param name="tenantFilterQuery">The filter criteria to apply when retrieving tenants.</param>
    /// <returns>A task representing the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> with the list of retrieved tenants.</returns>
    Task<ServiceResponse<IEnumerable<TenantsTableDto>>> GetTenantsAsync(TenantFilterQuery tenantFilterQuery);

    /// <summary>
    /// Retrieves all tenants.
    /// </summary>
    /// <returns>A task representing the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> with the tenant.</returns>
    Task<ServiceResponse<TenantsTableDto>> GetTenantAsync(Guid? id);

    /// <summary>
    /// Asynchronously retrieves a collection of tenant options based on the specified tenant type.
    /// </summary>
    /// <param name="tenantType">The type of tenant to filter the results. If null, all tenant types are included.</param>
    /// <returns>A task representing the asynchronous operation, containing a service response with an enumerable of select option DTOs.</returns>
    Task<ServiceResponse<IEnumerable<SelectOption>>> GetTenantOptionListAsync(TenantTypesEnum? tenantType);

    /// <summary>
    /// Asynchronously retrieves a collection of tenant options based on the specified tenant type.
    /// </summary>
    /// <param name="SearchSelectOptionDto">The type of tenant to filter the results. If null, all tenant types are included.</param>
    /// <returns>A task representing the asynchronous operation, containing a service response with an enumerable of select option DTOs.</returns>
    Task<ServiceResponse<IEnumerable<SelectOption>>> SearchTenantOptionListAsync(SearchSelectOptionDto searchOption);

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

    /// <summary>
    /// Disable multiple tenants by their IDs.
    /// </summary>
    /// <param name="ids">The IDs of the tenants to disable.</param>
    /// <returns>The task result contains the service response indicating whether the tenants were successfully disabled.</returns>
    /// <remarks>
    /// It is recommended to use this method to disable multiple tenants at once to reduce the number of requests to the server.
    /// </remarks>
    Task<ServiceResponse<bool>> DisableTenantsAsync(List<Guid> ids);
}
