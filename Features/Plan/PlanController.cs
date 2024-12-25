namespace AccountsAPIs.Controllers;

[Route("plan")]
[ApiController]
[Authorize]

public class PlanController : BaseApiController
{
  private readonly IPlanService _planService;
   public PlanController(IPlanService planService)
   {
    _planService = planService;
   }

  // Retrive plan by Id
  [HttpGet("{id}")]
  public async Task<ActionResult<ServiceResponse<PlanDto>>> GetPlan(Guid id)
  {
    return ResultHelper(await _planService.GetPlanAsync(id));
  }

  // Create a new Plan
  [HttpPost("insert-plan")]
  public async Task<ActionResult<ServiceResponse<PlanDto>>> InsertPlan([FromBody] PlanDto PlanDto)
  {
    return ResultHelper(await _planService.InsertPlanAsync(PlanDto));
  }

  // Update Plan
  [HttpPut("update-plan")]
  public async Task<ActionResult<ServiceResponse<PlanDto>>> UpdatePlan([FromBody] PlanDto PlanDto)
  {
    return ResultHelper(await _planService.UpdatePlanAsync(PlanDto));
  }

  // Delete plan by Id
  [HttpDelete("delete/{id}")]
  public async Task<ActionResult<ServiceResponse<bool>>> DeletePlan (Guid id)
  {
    return ResultHelper(await _planService.DeletePlanAsync(id));
  }
}