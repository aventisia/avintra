namespace MLModelBuilderAPIs.Controllers
{
  [Route("ml-model")]
  [ApiController]
  [Authorize]
  public class AIProjectController : BaseApiController
  {
    private readonly IAIProjectService _aiProjectService;

    public AIProjectController(IAIProjectService aiProjectService)
    {
      _aiProjectService = aiProjectService;
    }

    // Retrieves the list of AI projects
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AIProjectDto>>>> GetAIProjectList()
    {
      return ResultHelper(await _aiProjectService.GetAIProjectListAsync());
    }

    // Checks if a specific AI project name is available
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsAIProjectNameAvailable(CheckAvailabilityDto checkAvailabilityDto)
    {
      return ResultHelper(await _aiProjectService.IsAIProjectNameAvailableAsync(checkAvailabilityDto));
    }

    // Inserts a new AI project
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<AIProjectDto>>> InsertAIProject([FromBody] AIProjectDto aiProjectDto)
    {
      return ResultHelper(await _aiProjectService.InsertAIProjectAsync(aiProjectDto));
    }

    // Updates an existing AI project
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<AIProjectDto>>> UpdateAIProject([FromBody] AIProjectDto aiProjectDto)
    {
      return ResultHelper(await _aiProjectService.UpdateAIProjectAsync(aiProjectDto));
    }

    // Deletes a single AI project by ID
    [HttpDelete("{aiProjecrId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteAIProject(Guid aiProjecrId)
    {
      return ResultHelper(await _aiProjectService.DeleteAIProjectAsync(aiProjecrId));
    }

    // Deletes multiple AI projects by a list of IDs
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleAIProjects([FromBody] IEnumerable<Guid> aiProjectIds)
    {
      return ResultHelper(await _aiProjectService.DeleteMultipleAIProjectsAsync(aiProjectIds));
    }

    // Retrieves an AI project by its ID
    [HttpGet("{aiProjecrId}")]
    public async Task<ActionResult<ServiceResponse<AIProjectDto>>> GetAIProjectById(Guid aiProjecrId)
    {
      return ResultHelper(await _aiProjectService.GetAIProjectByIdAsync(aiProjecrId));
    }

    // Retrieves the total count of published ai models.
    [HttpGet("total-published")]
    public async Task<ActionResult<ServiceResponse<int>>> GetTotalAIProjectVersions()
    {
      return ResultHelper(await _aiProjectService.GetTotalAIProjectVersionsAsync());
    }
  }
}
