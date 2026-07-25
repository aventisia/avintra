namespace AccountsAPIs.Controllers;

[Route("credit-plans")]
[ApiController]
[Authorize]
public class CreditPlanController : BaseApiController
{
    private readonly ICreditPlanService _creditPlanService;

    public CreditPlanController(ICreditPlanService creditPlanService)
    {
        _creditPlanService = creditPlanService;
    }


    // Retrieves all credit plans.
    [Authorize(Roles = "SA")]
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<CreditPlanDto>>>> GetAllCreditPlans()
    {
        return ResultHelper(await _creditPlanService.GetAllCreditPlansAsync());
    }

    // Gets a list of credit plans for selection options.
    [HttpGet("option-to-select")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOption>>>> GetSelectableCreditPlanOptions()
    {
        return ResultHelper(await _creditPlanService.GetSelectableCreditPlanOptionsAsync());
    }

    // Retrieves a specific credit plan by its unique identifier.
    [HttpGet("{creditPlanId}")]
    [Authorize(Roles = "SA")]
    public async Task<ActionResult<ServiceResponse<CreditPlanDto>>> GetCreditPlanById(Guid creditPlanId)
    {
        return ResultHelper(await _creditPlanService.GetCreditPlanByIdAsync(creditPlanId));
    }

    // Creates a new credit plan.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<CreditPlanDto>>> CreateCreditPlan([FromBody] CreditPlanDto creditPlanDto)
    {
        return ResultHelper(await _creditPlanService.CreateCreditPlanAsync(creditPlanDto));
    }

    // Checks the availability of a credit plan name.
    [Authorize(Roles = "SA")]
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsCreditPlanNameAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _creditPlanService.IsCreditPlanNameAvailableAsync(checkAvailabilityDto));
    }

    // Updates an existing credit plan.
    [Authorize(Roles = "SA")]
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<CreditPlanDto>>> UpdateCreditPlan([FromBody] CreditPlanDto creditPlanDto)
    {
        return ResultHelper(await _creditPlanService.UpdateCreditPlanAsync(creditPlanDto));
    }

    // Deletes a specific credit plan by its unique identifier.
    [Authorize(Roles = "SA")]
    [HttpDelete("{creditPlanId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteCreditPlan(Guid creditPlanId)
    {
        return ResultHelper(await _creditPlanService.DeleteCreditPlanAsync(creditPlanId));
    }

    // Deletes multiple credit plans by their IDs.
    [Authorize(Roles = "SA")]
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteCreditPlans([FromBody] List<Guid> creditPlanIds)
    {
        return ResultHelper(await _creditPlanService.DeleteCreditPlansAsync(creditPlanIds));
    }
}
