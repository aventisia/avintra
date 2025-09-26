namespace AIProjectBuilderAPIs.Controllers;

[Route("ai-project-version")]
[ApiController]
[Authorize]
public class AIProjectVersionController : BaseApiController
{
    private readonly IAIProjectVersionService _aiProjectVersionService;

    public AIProjectVersionController(IAIProjectVersionService aiProjectVersionService)
    {
        _aiProjectVersionService = aiProjectVersionService;
    }

    // Get all versions of a specific AI project
    [HttpGet("list/{aiProjectId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AIProjectVersionDto>>>> GetAIProjectVersionsByProjectId(Guid aiProjectId)
    {
        return ResultHelper(await _aiProjectVersionService.GetAIProjectVersionsByProjectIdAsync(aiProjectId));
    }

    // Get a specific version of the AI project by ID
    [HttpGet("{aiProjectVersionId}")]
    public async Task<ActionResult<ServiceResponse<AIProjectVersionDto>>> GetAIProjectVersionById(Guid aiProjectVersionId)
    {
        return ResultHelper(await _aiProjectVersionService.GetAIProjectVersionByIdAsync(aiProjectVersionId));
    }

    // Inserts a new AI project version
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<AIProjectVersionDto>>> InsertAIProjectVersion([FromBody] AIProjectVersionDto aiProjectVersionDto)
    {
        return ResultHelper(await _aiProjectVersionService.CreateAIProjectVersionAsync(aiProjectVersionDto));
    }

    // Update a specific AI project version
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<AIProjectVersionDto>>> UpdateAIProjectVersion([FromBody] AIProjectVersionDto aiProjectVersionDto)
    {
        return ResultHelper(await _aiProjectVersionService.UpdateAIProjectVersionAsync(aiProjectVersionDto));
    }

    // Deletes an AI project version permanently
    [HttpDelete("{aiProjectVersionId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteAIProjectVersion(Guid aiProjectVersionId)
    {
        return ResultHelper(await _aiProjectVersionService.DeleteAIProjectVersionAsync(aiProjectVersionId));
    }

    // Bulk delete AI project versions
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleAIProjectVersions([FromBody] IEnumerable<Guid> aiProjectVersionIds)
    {
        return ResultHelper(await _aiProjectVersionService.DeleteMultipleAIProjectVersionsAsync(aiProjectVersionIds));
    }

    // Publishes an AI project version
    [HttpPost("publish")]
    public async Task<ActionResult<ServiceResponse<bool>>> PublishAIProjectVersion([FromBody] PublishAIProjectVersionDto publishAIProjectVersionDto)
    {
        return ResultHelper(await _aiProjectVersionService.PublishAIProjectVersionAsync(publishAIProjectVersionDto));
    }
}
