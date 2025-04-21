namespace AccountsAPIs.Controllers;

[Route("manage-pricing-plan")]
[ApiController]
[Authorize]
public class PricingPlanManagementController : BaseApiController
{
    private readonly IPricingPlanManagementService _pricingPlanManagementService;

    // Constructor that initializes the PricingPlanManagementService.
    public PricingPlanManagementController(IPricingPlanManagementService pricingPlanManagementService)
    {
        _pricingPlanManagementService = pricingPlanManagementService;
    }

    // Retrieves all pricing plans created by the user. Optionally filters by tenantId.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<PricingPlanTableDto>>>> GetAllPricingPlansAsync(Guid? tenantId)
    {
        // Calls the service method to fetch all pricing plans.
        return ResultHelper(await _pricingPlanManagementService.GetAllPricingPlansAsync(tenantId));
    }

    // Retrieves a specific pricing plan by its unique identifier.
    [HttpGet("{pricingPlanId}")]
    public async Task<ActionResult<ServiceResponse<PricingPlanTableDto>>> GetPricingPlanDetailsAsync(Guid pricingPlanId)
    {
        // Calls the service method to fetch pricing plan details by ID.
        return ResultHelper(await _pricingPlanManagementService.GetPricingPlanDetailsAsync(pricingPlanId));
    }

    // Creates a new pricing plan using the provided pricing plan data.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<PricingPlanTableDto>>> CreatePricingPlanAsync([FromBody] PricingPlanTableDto pricingPlanTableDto)
    {
        // Calls the service method to create a new pricing plan.
        return ResultHelper(await _pricingPlanManagementService.CreatePricingPlanAsync(pricingPlanTableDto));
    }

    // Updates an existing pricing plan with the new data provided.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<PricingPlanTableDto>>> UpdatePricingPlanAsync([FromBody] PricingPlanTableDto pricingPlanTableDto)
    {
        // Calls the service method to update an existing pricing plan.
        return ResultHelper(await _pricingPlanManagementService.UpdatePricingPlanAsync(pricingPlanTableDto));
    }

    // Deletes a specific pricing plan by its unique identifier.
    [HttpDelete("{pricingPlanId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeletePricingPlanByIdAsync(Guid pricingPlanId)
    {
        // Calls the service method to delete the pricing plan by ID.
        return ResultHelper(await _pricingPlanManagementService.DeletePricingPlanByIdAsync(pricingPlanId));
    }

    // Deletes multiple pricing plans by their respective IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultiplePricingPlansAsync([FromBody] List<Guid> pricingPlanIds)
    {
        // Calls the service method to delete multiple pricing plans.
        return ResultHelper(await _pricingPlanManagementService.DeleteMultiplePricingPlansAsync(pricingPlanIds));
    }

    // Retrieves a list of available currency options for pricing plans.
    [HttpGet("currencies-to-select")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOptionDto>>>> GetPricingPlanCurrencySelectOptionsAsync()
    {
        // Calls the service method to fetch currency options for pricing plans.
        return ResultHelper(await _pricingPlanManagementService.GetPricingPlanCurrencySelectOptionsAsync());
    }

    // Retrieves a list of pricing plan options for the user to select from.
    [HttpGet("options-to-select")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOptionDto>>>> GetPricingPlanSelectOptionsAsync()
    {
        // Calls the service method to fetch pricing plan options.
        return ResultHelper(await _pricingPlanManagementService.GetPricingPlanSelectOptionsAsync());
    }


    // Retrieves a specific pricing plan by its unique identifier.
    [HttpGet("component/{pricingComponent}")]
    public async Task<ActionResult<ServiceResponse<PricingPlanTableDto>>> GetPricingPlanByComponentAsync(string pricingComponent, Guid? tenantId)
    {
        // Calls the service method to fetch pricing plan details by ID.
        return ResultHelper(await _pricingPlanManagementService.GetPricingPlanByComponentAsync(pricingComponent, tenantId));
    }
}