namespace AccountsAPIs.Services;
public interface IPlanService
{
    /// <summary>
    /// Get plan list .
    /// </summary>
    /// <returns>The task result contains the service response with the get plan details.</returns>

    Task<ServiceResponse<IEnumerable<PlanDto>>> GetPlanAsync();

    Task<ServiceResponse<IEnumerable<PlanDto>>> GetPlanStatusAsync(PlanStatusEnum status);

    /// <summary>
    /// Inserts a new plan.
    /// </summary>
    /// <param name="PlanDto">The data required to insert the plan.</param>
    /// <returns>The task result contains the service response with the inserted plan details.</returns>
    Task<ServiceResponse<PlanDto>> InsertPlanAsync (PlanDto planDto);
    
    /// <summary>
    /// Update plan.
    /// </summary>
    /// <param name="PlanDto">The data required to update the plan.</param>
    /// <returns>The task result contains the service response with the updated plan details.</returns>
    Task<ServiceResponse<PlanDto>> UpdatePlanAsync (PlanDto planDto);
    Task<ServiceResponse<PlanFeaturesDto>> UpdatePlanFeatureAsync (PlanFeaturesDto planFeatureDto);

    /// <summary>
    /// Delete plan.
    /// </summary>
    /// <param name="id">The data required to update the plan.</param>
    /// <returns>The task result contains the service response with the delete plan details.</returns>

    Task<ServiceResponse<bool>> DeletePlanAsync (Guid id);
}