namespace AccountsAPIs.Controllers;

[Route("pricing-plan")]
[ApiController]
[Authorize]
public class PlanTableController : BaseApiController
{
    private readonly IPlanTableService _planTableService;

    public PlanTableController(IPlanTableService planTableService)
    {
        _planTableService = planTableService;
    }

    // Retrieves all plans created by the user.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<PlanTableDto>>>> GetPlans()
    {
        return ResultHelper(await _planTableService.GetAllPricingPlansAsync());
    }

    // Retrieves a list of plan options.
    [HttpGet("option-to-select")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOptionDto>>>> GetPlanOptionList()
    {
        return ResultHelper(await _planTableService.GetPricingPlansOptionListAsync());
    }

    // Retrieves a specific pricing plan by its unique identifier.
    [HttpGet("component/{pricingComponent}")]
    public async Task<ActionResult<ServiceResponse<PricingPlanTableDto>>> GetByComponent(string pricingComponent)
    {
        // Calls the service method to fetch pricing plan details by ID.
        return ResultHelper(await _planTableService.GetPricingPlanByComponentAsync(pricingComponent));
    }


    // Retrieves plan by the Id.
    [HttpGet("{pricingPlanId}")]
    public async Task<ActionResult<ServiceResponse<PlanTableDto>>> GetPlanByIdAsync(Guid pricingPlanId)
    {
        return ResultHelper(await _planTableService.GetPricingPlanByIdAsync(pricingPlanId));
    }

    // Inserts a new plan.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<PlanTableDto>>> InsertPlan([FromBody] PlanTableDto planTableDto)
    {
        return ResultHelper(await _planTableService.CreatePricingPlanAsync(planTableDto));
    }

    // Updates an existing plan.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<PlanTableDto>>> UpdatePlan([FromBody] PlanTableDto planTableDto)
    {
        return ResultHelper(await _planTableService.UpdatePricingPlanAsync(planTableDto));
    }

    // Deletes a plan by its ID.
    [HttpDelete("{pricingPlanId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeletePlan(Guid pricingPlanId)
    {
        return ResultHelper(await _planTableService.DeletePricingPlanAsync(pricingPlanId));
    }

    // Deletes multiple plans by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeletePlans([FromBody] List<Guid> pricingPlanIds)
    {
        return ResultHelper(await _planTableService.DeletePricingPlansAsync(pricingPlanIds));
    }
}
