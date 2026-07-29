namespace WorkspaceAPIs.Controllers;

/// <summary>
/// Controller for managing skill registry CRUD operations.
/// </summary>
[Route("skill-registry")]
[ApiController]
[Authorize]
public class SkillRegistryController : BaseApiController
{
    private readonly ISkillRegistryService _skillRegistryService;

    public SkillRegistryController(ISkillRegistryService skillRegistryService)
    {
        _skillRegistryService = skillRegistryService;
    }

    // Retrieves all personal skills.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SkillDto>>>> GetPersonalSkills()
    {
        return ResultHelper(await _skillRegistryService.GetSkillsAsync(true));
    }

    // Retrieves all shared skills.
    [HttpGet("list/shared")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SkillDto>>>> GetSharedSkills()
    {
        return ResultHelper(await _skillRegistryService.GetSkillsAsync(false));
    }

    // Checks the availability of a skill name.
    [HttpPost("is-available")]
    [Authorize(Roles = "SA,TA,OM")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsSkillNameAvailable(
        [FromQuery] Guid? skillId,
        [FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _skillRegistryService.IsSkillNameAvailableAsync(skillId, checkAvailabilityDto));
    }

    // Retrieves a skill by its ID.
    [HttpGet("{skillId}")]
    public async Task<ActionResult<ServiceResponse<SkillDto>>> GetSkillById(Guid skillId)
    {
        return ResultHelper(await _skillRegistryService.GetSkillByIdAsync(skillId));
    }

    // Creates a new skill.
    [HttpPost]
    [Authorize(Roles = "SA,TA,OM")]
    public async Task<ActionResult<ServiceResponse<SkillDto>>> CreateSkill([FromBody] SkillDto skillDto)
    {
        return ResultHelper(await _skillRegistryService.InsertSkillAsync(skillDto));
    }

    // Updates an existing skill.
    [HttpPut]
    [Authorize(Roles = "SA,TA,OM")]
    public async Task<ActionResult<ServiceResponse<SkillDto>>> UpdateSkill([FromBody] SkillDto skillDto)
    {
        return ResultHelper(await _skillRegistryService.UpdateSkillAsync(skillDto));
    }

    // Deletes a skill by its ID.
    [HttpDelete("{skillId}")]
    [Authorize(Roles = "SA,TA,OM")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteSkill(Guid skillId)
    {
        return ResultHelper(await _skillRegistryService.DeleteSkillAsync(skillId));
    }

    // Deletes multiple skills.
    [HttpPost("delete-multiple")]
    [Authorize(Roles = "SA,TA,OM")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleSkills([FromBody] List<Guid> skillIds)
    {
        return ResultHelper(await _skillRegistryService.DeleteSkillsAsync(skillIds));
    }
}
