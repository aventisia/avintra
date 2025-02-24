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

  // Retrive plan list
  [HttpGet]
  public async Task<ActionResult<ServiceResponse<IEnumerable<PlanListDto>>>> GetPlan()
  {
    return ResultHelper(await _planService.GetPlansAsync());
  }
  
  // Retrive plan by Id
  [HttpGet("{id}")]
  public async Task<ActionResult<ServiceResponse<PlanListDto>>> GetPlanById (Guid id)
  {
    return ResultHelper(await _planService.GetPlanAsync(id));
  }

  // Retrive plan status list
  [HttpGet("status")]
  public async Task<ActionResult<ServiceResponse<IEnumerable<PlanDto>>>> GetPlanStatus(PlanStatusEnum status)
  {
    return ResultHelper(await _planService.GetPlanStatusAsync(status));
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

  // Update Plan Feature
  [HttpPut("update-plan-feature")]
  public async Task<ActionResult<ServiceResponse<PlanFeaturesDto>>> UpdatePlanFeature([FromBody] PlanFeaturesDto PlanFeatureDto)
  {
    return ResultHelper(await _planService.UpdatePlanFeatureAsync(PlanFeatureDto));
  }

  // Delete plan by Id
  [HttpDelete("delete/{id}")]
  public async Task<ActionResult<ServiceResponse<bool>>> DeletePlan (Guid id)
  {
    return ResultHelper(await _planService.DeletePlanAsync(id));
  }
}