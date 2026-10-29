namespace AccountsAPIs.Services;

/// <summary>
/// Provides operations for managing credit plans and related data.
/// </summary>
public interface ICreditPlanService
{
    /// <summary>
    /// Retrieves all credit plans in the system.
    /// </summary>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains a collection of all <see cref="CreditPlanDto"/>.
    /// </returns>
    Task<ServiceResponse<IEnumerable<CreditPlanDto>>> GetAllCreditPlansAsync();

    /// <summary>
    /// Retrieves a list of credit plans formatted as selectable options, typically used in dropdowns or selection lists.
    /// </summary>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains a collection of <see cref="SelectOption"/> representing available credit plans.
    /// </returns>
    Task<ServiceResponse<IEnumerable<SelectOption>>> GetSelectableCreditPlanOptionsAsync();

    /// <summary>
    /// Retrieves the details of a specific credit plan by its unique identifier.
    /// </summary>
    /// <param name="creditPlanId">The unique identifier of the credit plan.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the <see cref="CreditPlanDto"/> if found.
    /// </returns>
    Task<ServiceResponse<CreditPlanDto>> GetCreditPlanByIdAsync(Guid creditPlanId);

    /// <summary>
    /// Creates a new credit plan with the provided details.
    /// </summary>
    /// <param name="creditPlanDto">The data required to create the new credit plan.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the newly created <see cref="CreditPlanDto"/>.
    /// </returns>
    Task<ServiceResponse<CreditPlanDto>> CreateCreditPlanAsync(CreditPlanDto creditPlanDto);

    /// <summary>
    /// Checks if a credit plan name is available (not already taken).
    /// </summary>
    /// <param name="checkAvailabilityDto">DTO containing the credit plan name to check.</param>
    /// <returns>A service response indicating whether the name is available.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsCreditPlanNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Updates the information of an existing credit plan.
    /// </summary>
    /// <param name="creditPlanDto">The updated credit plan data.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the updated <see cref="CreditPlanDto"/>.
    /// </returns>
    Task<ServiceResponse<CreditPlanDto>> UpdateCreditPlanAsync(CreditPlanDto creditPlanDto);

    /// <summary>
    /// Deletes a specific credit plan by its unique identifier.
    /// </summary>
    /// <param name="creditPlanId">The unique identifier of the credit plan to delete.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result indicates whether the deletion was successful.
    /// </returns>
    Task<ServiceResponse<bool>> DeleteCreditPlanAsync(Guid creditPlanId);

    /// <summary>
    /// Deletes multiple credit plans identified by a list of unique identifiers.
    /// </summary>
    /// <param name="creditPlanIds">A list of credit plan IDs to delete.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result indicates the success of the batch deletion.
    /// </returns>
    Task<ServiceResponse<bool>> DeleteCreditPlansAsync(List<Guid> creditPlanIds);
}
