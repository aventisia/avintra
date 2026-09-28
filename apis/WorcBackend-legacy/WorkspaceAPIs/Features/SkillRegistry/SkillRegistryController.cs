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
    // Any authenticated user may check availability; creation is authorized per-record in the service.
    [HttpPost("is-available")]
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

    // Retrieves a skill by its name within the current environment.
    [HttpGet("by-name/{skillName}")]
    public async Task<ActionResult<ServiceResponse<SkillDto>>> GetSkillByName(string skillName)
    {
        return ResultHelper(await _skillRegistryService.GetSkillByNameAsync(skillName));
    }

    // Creates a new skill.
    // Creation is open to all roles (e.g. TD); ownership is assigned in the service.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<SkillDto>>> CreateSkill([FromBody] SkillDto skillDto)
    {
        return ResultHelper(await _skillRegistryService.InsertSkillAsync(skillDto));
    }

    // Updates an existing skill.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<SkillDto>>> UpdateSkill([FromBody] SkillDto skillDto)
    {
        return ResultHelper(await _skillRegistryService.UpdateSkillAsync(skillDto));
    }

    // Deletes a skill by its ID.
    [HttpDelete("{skillId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteSkill(Guid skillId)
    {
        return ResultHelper(await _skillRegistryService.DeleteSkillAsync(skillId));
    }

    // Deletes multiple skills.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleSkills([FromBody] List<Guid> skillIds)
    {
        return ResultHelper(await _skillRegistryService.DeleteSkillsAsync(skillIds));
    }

    // Retrieves all skills and files for desktop sync.
    [HttpGet("sync")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SkillSyncDto>>>> GetSkillsForSync()
    {
        return ResultHelper(await _skillRegistryService.GetSkillsForSyncAsync());
    }

    // Retrieves all platform (library) skills.
    [HttpGet("library")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SkillDto>>>> GetLibrarySkills()
    {
        return ResultHelper(await _skillRegistryService.GetLibrarySkillsAsync());
    }

    // Retrieves skills in select-option format for dropdowns.
    [HttpGet("skills-to-select")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOption>>>> GetSelectableSkillOptions()
    {
        return ResultHelper(await _skillRegistryService.GetSelectableSkillOptionsAsync());
    }
}
