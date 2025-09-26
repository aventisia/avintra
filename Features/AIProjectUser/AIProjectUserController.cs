namespace AIProjectBuilderAPIs.Controllers;

[Route("ai-model-user")]
[ApiController]
[Authorize]
public class AIProjectUserController : BaseApiController
{
    private readonly IAIProjectUserService _aiProjectUserService;

    public AIProjectUserController(IAIProjectUserService aiProjectUserService)
    {
        _aiProjectUserService = aiProjectUserService;
    }

    // Gets list of AI Project users for a specific AI project using its id.
    [HttpGet("list/{aiProjectId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AIProjectUserDto>>>> GetAIProjectUsers(Guid aiProjectId)
    {
        return ResultHelper(await _aiProjectUserService.GetAIProjectUsersByAIProjectIdAsync(aiProjectId));
    }

    // Retrieves a specific AI Project user by their unique identifier.
    [HttpGet("{aiProjectUserId}")]
    public async Task<ActionResult<ServiceResponse<AIProjectUserDto>>> GetAIProjectUserById(Guid aiProjectUserId)
    {
        return ResultHelper(await _aiProjectUserService.GetAIProjectUserByIdAsync(aiProjectUserId));
    }

    // Adds a new user to a specific AI project.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<AIProjectUserDto>>> InsertAIProjectUser([FromBody] AIProjectUserDto aiProjectUserDto)
    {
        return ResultHelper(await _aiProjectUserService.InsertAIProjectUserAsync(aiProjectUserDto));
    }

    // Assign new users to a specific AI project.
    [HttpPost("assign")]
    public async Task<ActionResult<ServiceResponse<bool>>> AssignAIProjectUser([FromBody] AssignAIProjectUserDto assignAIProjectUserDto)
    {
        return ResultHelper(await _aiProjectUserService.AssignAIProjectUserAsync(assignAIProjectUserDto));
    }

    // Updates an existing AI Project user.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<AIProjectUserDto>>> UpdateAIProjectUser([FromBody] AIProjectUserDto aiProjectUserDto)
    {
        return ResultHelper(await _aiProjectUserService.UpdateAIProjectUserAsync(aiProjectUserDto));
    }

    // Deletes an AI Project user from the AI project permanently.
    [HttpDelete("{aiProjectUserId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteAIProjectUser(Guid aiProjectUserId)
    {
        return ResultHelper(await _aiProjectUserService.DeleteAIProjectUserAsync(aiProjectUserId));
    }

    // Deletes multiple AI Project users by a list of their unique identifiers.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleAIProjectUsers([FromBody] IEnumerable<Guid> aiProjectUserIds)
    {
        return ResultHelper(await _aiProjectUserService.DeleteMultipleAIProjectUsersAsync(aiProjectUserIds));
    }
}
