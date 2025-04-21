namespace AccountsAPIs.Services;

/// <summary>
/// Provides functionality to manage pricing plans within a multi-tenant system.
/// </summary>
public interface IPricingPlanManagementService
{
    /// <summary>
    /// Asynchronously retrieves all pricing plans, optionally filtered by tenant.
    /// </summary>
    /// <param name="tenantId">Optional tenant ID to filter pricing plans specific to a tenant.</param>
    /// <returns>A task that represents the asynchronous operation, containing a service response with a collection of pricing plans.</returns>
    Task<ServiceResponse<IEnumerable<PricingPlanTableDto>>> GetAllPricingPlansAsync(Guid? tenantId);

    /// <summary>
    /// Asynchronously retrieves a specific pricing plan by its unique identifier.
    /// </summary>
    /// <param name="pricingPlanId">The unique identifier of the pricing plan.</param>
    /// <returns>A task representing the asynchronous operation, containing a service response with the pricing plan details.</returns>
    Task<ServiceResponse<PricingPlanTableDto>> GetPricingPlanDetailsAsync(Guid pricingPlanId);

    /// <summary>
    /// Asynchronously creates a new pricing plan.
    /// </summary>
    /// <param name="pricingPlanTableDto">The pricing plan details to be created.</param>
    /// <returns>A task that represents the asynchronous operation, containing a service response with the created pricing plan.</returns>
    Task<ServiceResponse<PricingPlanTableDto>> CreatePricingPlanAsync(PricingPlanTableDto pricingPlanTableDto);

    /// <summary>
    /// Asynchronously updates an existing pricing plan.
    /// </summary>
    /// <param name="pricingPlanTableDto">The updated pricing plan details.</param>
    /// <returns>A task that represents the asynchronous operation, containing a service response with the updated plan data.</returns>
    Task<ServiceResponse<PricingPlanTableDto>> UpdatePricingPlanAsync(PricingPlanTableDto pricingPlanTableDto);

    /// <summary>
    /// Asynchronously deletes a pricing plan by its unique identifier.
    /// </summary>
    /// <param name="pricingPlanId">The unique identifier of the pricing plan to be deleted.</param>
    /// <returns>A task representing the asynchronous operation, containing a service response indicating success or failure.</returns>
    Task<ServiceResponse<bool>> DeletePricingPlanByIdAsync(Guid pricingPlanId);

    /// <summary>
    /// Asynchronously deletes multiple pricing plans based on their unique identifiers.
    /// </summary>
    /// <param name="pricingPlanIds">A list of pricing plan IDs to be deleted.</param>
    /// <returns>A task representing the asynchronous operation, containing a service response indicating success or failure.</returns>
    Task<ServiceResponse<bool>> DeleteMultiplePricingPlansAsync(List<Guid> pricingPlanIds);


    /// <summary>
    /// Asynchronously retrieves a list of available currencies used in pricing plans, formatted as selectable options.
    /// </summary>
    /// <returns>A task representing the asynchronous operation, containing a service response with currency options.</returns>
    Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetPricingPlanCurrencySelectOptionsAsync();

    /// <summary>
    /// Asynchronously retrieves a list of pricing plans formatted as selectable options.
    /// </summary>
    /// <returns>A task representing the asynchronous operation, containing a service response with selectable plan options.</returns>
    Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetPricingPlanSelectOptionsAsync();

    /// <summary>
    /// Asynchronously retrieves a pricing plan by its associated component and optionally by tenant ID.
    /// </summary>
    /// <param name="pricingComponent">The component associated with the pricing plan.</param>
    /// <param name="tenantId">An optional tenant ID to filter pricing plans. If null, all tenant pricing plans for the component are returned.</param>
    /// <returns>A task representing the asynchronous operation, containing a service response with the retrieved pricing plan details.</returns>
    Task<ServiceResponse<PricingPlanTableDto>> GetPricingPlanByComponentAsync(string pricingComponent, Guid? tenantId);
}