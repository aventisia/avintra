namespace AccountsAPIs.Services;

/// <summary>
/// Defines a service for managing license credits within a multi-tenant system.
/// </summary>
public interface ILicenseCreditService
{
    /// <summary>
    /// Retrieves all available license credits.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation, containing a <see cref="ServiceResponse{T}"/> with a collection of <see cref="LicenseCreditDto"/>.</returns>
    Task<ServiceResponse<IEnumerable<LicenseCreditDto>>> GetLicenseCreditsAsync();

    /// <summary>
    /// Retrieves my all available license credits.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation, containing a <see cref="ServiceResponse{T}"/> with a collection of <see cref="MyLicenseCreditDto"/>.</returns>
    Task<ServiceResponse<IEnumerable<MyLicenseCreditDto>>> GetMyLicenseCreditsAsync();

    /// <summary>
    /// Asynchronously retrieves a list of all license credit options for the current user.
    /// </summary>
    /// <returns>A <see cref="ServiceResponse{IEnumerable{SelectOptionDto}}"/> containing the license credit options.</returns>
    Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetLicenseCreditOptionListAsync();

    /// <summary>
    /// Retrieves a license credit by its ID.
    /// </summary>
    /// <param name="licenseCreditId">The ID of the license credit to retrieve.</param>
    /// <returns>A <see cref="ServiceResponse{LicenseCreditDto}"/> containing the license credit data if found, otherwise an error message.</returns>
    Task<ServiceResponse<LicenseCreditDto>> GetLicenseCreditByIdAsync(Guid licenseCreditId);

    /// <summary>
    /// Creates a new license credit in the system.
    /// </summary>
    /// <param name="licenseCreditDto">The data required to create the new license credit.</param>
    /// <returns>A task that represents the asynchronous operation, containing a <see cref="ServiceResponse{T}"/> with the details of the newly created license credit.</returns>
    Task<ServiceResponse<LicenseCreditDto>> InsertLicenseCreditAsync(LicenseCreditDto licenseCreditDto);

    /// <summary>
    /// Requests a new license credit.
    /// </summary>
    /// <param name="licenseCreditDto">Details for the license credit request.</param>
    /// <returns>A task with the response containing the license credit information.</returns>
    Task<ServiceResponse<LicenseCreditDto>> RequestLicenseCreditAsync(RequestLicenseCreditDto licenseCreditDto);

    /// <summary> 
    /// Approve exiting license credit request.
    /// </summary> 
    /// <param name="licenseCreditDto">Information related to the license credit approval.</param> 
    /// <returns>A task that yields a response with the license credit details.</returns>   
    Task<ServiceResponse<LicenseCreditDto>> ApproveLicenseCreditAsync(RequestLicenseCreditDto licenseCreditDto);

    /// <summary>
    /// Updates the details of an existing license credit.
    /// </summary>
    /// <param name="licenseCreditDto">The updated data for the license credit.</param>
    /// <returns>A task that represents the asynchronous operation, yielding a <see cref="ServiceResponse{T}"/> with the updated license credit details.</returns>
    Task<ServiceResponse<LicenseCreditDto>> UpdateLicenseCreditAsync(LicenseCreditDto licenseCreditDto);

    /// <summary>
    /// Deletes a license credit identified by its ID.
    /// </summary>
    /// <param name="licenseCreditId">The ID of the license credit to delete.</param>
    /// <returns>A task that represents the asynchronous operation, containing a <see cref="ServiceResponse{T}"/> indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteLicenseCreditAsync(Guid licenseCreditId);

    /// <summary>
    /// Deletes multiple license credits based on their IDs.
    /// </summary>
    /// <param name="licenseCreditIds">A list of IDs of the license credits to delete.</param>
    /// <returns>A task that represents the asynchronous operation, yielding a <see cref="ServiceResponse{T}"/> indicating the success of the deletion operation.</returns>
    /// <remarks>
    /// This method is intended to optimize performance by allowing multiple deletions in a single request.
    /// </remarks>
    Task<ServiceResponse<bool>> DeleteLicenseCreditsAsync(List<Guid> licenseCreditIds);
}
