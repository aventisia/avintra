namespace AccountsAPIs.Services;

/// <summary>
/// Provides operations for managing subscription or pricing plans in a multi-tenant environment.
/// </summary>
public interface IPlanTableService
{
    /// <summary>
    /// Retrieves all available plans in the system.
    /// </summary>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains a collection of all <see cref="PlanTableDto"/>.
    /// </returns>
    Task<ServiceResponse<IEnumerable<PlanTableDto>>> GetAllPricingPlansAsync();

    /// <summary>
    /// Retrieves the details of a specific plan by its unique identifier.
    /// </summary>
    /// <param name="planId">The unique identifier of the plan.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the <see cref="PlanTableDto"/> if found.
    /// </returns>
    Task<ServiceResponse<PlanTableDto>> GetPricingPlanByIdAsync(Guid planId);

    /// <summary>
    /// Creates a new plan with the provided details.
    /// </summary>
    /// <param name="planTableDto">The data required to create the new plan.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the newly created <see cref="PlanTableDto"/>.
    /// </returns>
    Task<ServiceResponse<PlanTableDto>> CreatePricingPlanAsync(PlanTableDto planTableDto);

    /// <summary>
    /// Updates the information of an existing plan.
    /// </summary>
    /// <param name="planTableDto">The updated plan data.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the updated <see cref="PlanTableDto"/>.
    /// </returns>
    Task<ServiceResponse<PlanTableDto>> UpdatePricingPlanAsync(PlanTableDto planTableDto);

    /// <summary>
    /// Deletes a specific plan by its unique identifier.
    /// </summary>
    /// <param name="planId">The unique identifier of the plan to delete.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result indicates whether the deletion was successful.
    /// </returns>
    Task<ServiceResponse<bool>> DeletePricingPlanAsync(Guid planId);

    /// <summary>
    /// Deletes multiple plans identified by a list of unique identifiers.
    /// </summary>
    /// <param name="planIds">A list of plan IDs to delete.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result indicates the success of the batch deletion.
    /// </returns>
    Task<ServiceResponse<bool>> DeletePricingPlansAsync(List<Guid> planIds);

    /// <summary>
    /// Retrieves a list of selectable plan options for use in UI components such as dropdowns.
    /// Includes tenant-specific and default plans, grouped by pricing component and frequency.
    /// </summary>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains a collection of <see cref="SelectOptionDto"/>.
    /// </returns>
    Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetPricingPlansOptionListAsync();

    /// <summary>
    /// Retrieves the details of a pricing plan based on its pricing component name.
    /// </summary>
    /// <param name="pricingComponent">The unique name of the pricing component.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the <see cref="PricingPlanTableDto"/> if found.
    /// </returns>
    Task<ServiceResponse<PricingPlanTableDto>> GetPricingPlanByComponentAsync(string pricingComponent);

    /// <summary>
    /// Asynchronously retrieves a list of pricing plan options.
    /// </summary>
    /// <returns>A task representing the asynchronous operation, containing a service response with an enumerable of select option DTOs.</returns>
    Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetPlanOptionListAsync();

}
