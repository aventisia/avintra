namespace AccountsAPIs.Services;

/// <summary>
/// Defines a service for managing plans within a multi-tenant system.
/// </summary>
public interface IPlanTableService
{
    /// <summary>
    /// Retrieves all available plans.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation, containing a <see cref="ServiceResponse{T}"/> with a collection of <see cref="PlanTableDto"/>.</returns>
    Task<ServiceResponse<IEnumerable<PlanTableDto>>> GetPlansAsync();

    /// <summary>
    /// Retrieves a plan by its ID.
    /// </summary>
    /// <param name="planId">The ID of the plan to retrieve.</param>
    /// <returns>A <see cref="ServiceResponse{PlanTableDto}"/> containing the plan data if found, otherwise an error message.</returns>
    Task<ServiceResponse<PlanTableDto>> GetPlanByIdAsync(Guid planId);

    /// <summary>
    /// Asynchronously retrieves a list of plan options without filtering by tenant type.
    /// </summary>
    /// <returns>A task representing the asynchronous operation, containing a service response with an enumerable of select option DTOs.</returns>
    Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetPlanOptionListAsync();

    /// <summary>
    /// Creates a new plan in the system.
    /// </summary>
    /// <param name="planTableDto">The data required to create the new plan.</param>
    /// <returns>A task that represents the asynchronous operation, containing a <see cref="ServiceResponse{T}"/> with the details of the newly created plan.</returns>
    Task<ServiceResponse<PlanTableDto>> InsertPlanAsync(PlanTableDto planTableDto);

    /// <summary>
    /// Updates the details of an existing plan.
    /// </summary>
    /// <param name="planTableDto">The updated data for the plan.</param>
    /// <returns>A task that represents the asynchronous operation, yielding a <see cref="ServiceResponse{T}"/> with the updated plan details.</returns>
    Task<ServiceResponse<PlanTableDto>> UpdatePlanAsync(PlanTableDto planTableDto);

    /// <summary>
    /// Deletes a plan identified by its ID.
    /// </summary>
    /// <param name="planId">The ID of the plan to delete.</param>
    /// <returns>A task that represents the asynchronous operation, containing a <see cref="ServiceResponse{T}"/> indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeletePlanAsync(Guid planId);

    /// <summary>
    /// Deletes multiple plans based on their IDs.
    /// </summary>
    /// <param name="planIds">A list of IDs of the plans to delete.</param>
    /// <returns>A task that represents the asynchronous operation, yielding a <see cref="ServiceResponse{T}"/> indicating the success of the deletion operation.</returns>
    /// <remarks>
    /// This method is intended to optimize performance by allowing multiple deletions in a single request.
    /// </remarks>
    Task<ServiceResponse<bool>> DeletePlansAsync(List<Guid> planIds);
}
