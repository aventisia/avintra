namespace AccountsAPIs.Services;

/// <summary>
/// Defines a service for managing license credits within a multi-tenant system.
/// </summary>
public interface ILicenseCreditManagementService
{
    /// <summary>
    /// Retrieves all license credits for the specified tenant.
    /// </summary>
    /// <param name="tenantId">The optional tenant ID to filter license credits. If null, returns credits for all tenants (if applicable).</param>
    /// <returns>A task representing the asynchronous operation, containing a collection of <see cref="ManageLicenseCreditDto"/> objects.</returns>
    Task<ServiceResponse<IEnumerable<ManageLicenseCreditDto>>> GetAllLicenseCreditsAsync(Guid? tenantId);

    /// <summary>
    /// Retrieves license credit options formatted for selection lists, for the specified tenant.
    /// </summary>
    /// <param name="tenantId">The optional tenant ID to filter the options.</param>
    /// <returns>A task representing the asynchronous operation, containing a collection of <see cref="SelectOptionDto"/>.</returns>
    Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetLicenseCreditOptionsAsync(Guid tenantId);

    /// <summary>
    /// Retrieves a single license credit by its unique ID.
    /// </summary>
    /// <param name="licenseCreditId">The ID of the license credit to retrieve.</param>
    /// <returns>A task representing the asynchronous operation, containing the matching <see cref="ManageLicenseCreditDto"/>.</returns>
    Task<ServiceResponse<ManageLicenseCreditDto>> GetLicenseCreditByIdAsync(Guid licenseCreditId);

    /// <summary>
    /// Creates a new license credit in the system.
    /// </summary>
    /// <param name="licenseCreditDto">The data required to create the new license credit.</param>
    /// <returns>A task representing the asynchronous operation, containing the newly created <see cref="LicenseCreditDto"/>.</returns>
    Task<ServiceResponse<ManageLicenseCreditDto>> CreateLicenseCreditAsync(ManageLicenseCreditDto licenseCreditDto);

    /// <summary>
    /// Submits a new request for a license credit.
    /// </summary>
    /// <param name="licenseCreditDto">The details of the license credit request.</param>
    /// <returns>A task representing the asynchronous operation, containing the requested <see cref="ManageLicenseCreditDto"/> information.</returns>
    Task<ServiceResponse<ManageLicenseCreditDto>> SubmitLicenseCreditRequestAsync(RequestLicenseCreditDto licenseCreditDto);

    /// <summary>
    /// Approves a pending license credit request.
    /// </summary>
    /// <param name="licenseCreditDto">The license credit request details to approve.</param>
    /// <returns>A task representing the asynchronous operation, containing the approved <see cref="ManageLicenseCreditDto"/>.</returns>
    Task<ServiceResponse<ManageLicenseCreditDto>> ApproveLicenseCreditRequestAsync(RequestLicenseCreditDto licenseCreditDto);

    /// <summary>
    /// Records a license credit transaction and returns the updated details.
    /// </summary>
    /// <param name="licenseCreditDto">The data required to record the license credit transaction.</param>
    /// <returns>A task representing the asynchronous operation, containing the recorded <see cref="LicenseCreditDto"/>.</returns>
    Task<ServiceResponse<ManageLicenseCreditDto>> RecordLicenseCreditTransactionAsync(RecordLicenseCreditDto licenseCreditDto);

    /// <summary>
    /// Updates an existing license credit with new data.
    /// </summary>
    /// <param name="licenseCreditDto">The updated license credit details.</param>
    /// <returns>A task representing the asynchronous operation, containing the updated <see cref="LicenseCreditDto"/>.</returns>
    Task<ServiceResponse<ManageLicenseCreditDto>> UpdateLicenseCreditAsync(ManageLicenseCreditDto licenseCreditDto);

    /// <summary>
    /// Deletes a license credit by its unique ID.
    /// </summary>
    /// <param name="licenseCreditId">The ID of the license credit to delete.</param>
    /// <returns>A task representing the asynchronous operation, containing a result indicating success or failure.</returns>
    Task<ServiceResponse<bool>> DeleteLicenseCreditByIdAsync(Guid licenseCreditId);

    /// <summary>
    /// Deletes multiple license credits identified by a list of IDs.
    /// </summary>
    /// <param name="licenseCreditIds">A list of license credit IDs to delete.</param>
    /// <returns>A task representing the asynchronous operation, containing a result indicating the overall success of the operation.</returns>
    Task<ServiceResponse<bool>> DeleteMultipleLicenseCreditsAsync(List<Guid> licenseCreditIds);
}