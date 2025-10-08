namespace AccountsAPIs.Services;

/// <summary>
/// Defines the contract for a service responsible for managing subscription plans via Razorpay.
/// </summary>
public interface IPlanService
{
    /// <summary>
    /// Creates a new subscription plan in Razorpay based on the provided details.
    /// </summary>
    /// <param name="request">The request object containing details for the new subscription plan.</param>
    Task<ServiceResponse<PlanResponseDto>> CreatePlanAsync(PlanRequestDto request);

    /// <summary>
    /// Retrieves a specific subscription plan by its unique ID from Razorpay.
    /// </summary>
    /// <param name="planId">The unique identifier for the plan (e.g., "plan_xxxxxxxxxxxxxx").</param>
    Task<ServiceResponse<PlanResponseDto>> GetPlanByIdAsync(string planId);

    /// <summary>
    /// Retrieves a list of all available subscription plans from Razorpay, with optional pagination support.
    /// </summary>
    Task<ServiceResponse<List<PlanResponseDto>>> GetAllPlansAsync();
}
