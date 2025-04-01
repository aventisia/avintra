namespace AccountsAPIs.Controllers;

[Route("plan")]
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
        return ResultHelper(await _planTableService.GetPlansAsync());
    }

    // Checks the availability of a plan name.
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsPlanNameAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _planTableService.IsPlanNameAvailableAsync(checkAvailabilityDto));
    }

    // Inserts a new plan.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<PlanTableDto>>> InsertPlan([FromBody] PlanTableDto planTableDto)
    {
        return ResultHelper(await _planTableService.InsertPlanAsync(planTableDto));
    }

    // Updates an existing plan.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<PlanTableDto>>> UpdatePlan([FromBody] PlanTableDto planTableDto)
    {
        return ResultHelper(await _planTableService.UpdatePlanAsync(planTableDto));
    }

    // Deletes a plan by its ID.
    [HttpDelete("{planId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeletePlan(Guid planId)
    {
        return ResultHelper(await _planTableService.DeletePlanAsync(planId));
    }

    // Deletes multiple plans by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeletePlans([FromBody] List<Guid> planIds)
    {
        return ResultHelper(await _planTableService.DeletePlansAsync(planIds));
    }
}
