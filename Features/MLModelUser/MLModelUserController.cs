namespace MLModelBuilderAPIs.Controllers;

[Route("ai-model-user")]
[ApiController]
[Authorize]
public class MLModelUserController : BaseApiController
{
    private readonly IMLModelUserService _mlModelUserService;

    public MLModelUserController(IMLModelUserService mlModelUserService)
    {
        _mlModelUserService = mlModelUserService;
    }

    // Gets list of MLModel users for a specific ML model using its mlModelId.
    [HttpGet("list/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<MLModelUserDto>>>> GetMLModelUsers(Guid mlModelId)
    {
        return ResultHelper(await _mlModelUserService.GetMLModelUsersByMLModelIdAsync(mlModelId));
    }

    // Retrieves a specific MLModel user by their unique identifier.
    [HttpGet("{MLModelUserId}")]
    public async Task<ActionResult<ServiceResponse<MLModelUserDto>>> GetMLModelUserById(Guid MLModelUserId)
    {
        return ResultHelper(await _mlModelUserService.GetMLModelUserByIdAsync(MLModelUserId));
    }

    // Adds a new user to a specific ML model.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<MLModelUserDto>>> InsertMLModelUser([FromBody] MLModelUserDto mlModelUserDto)
    {
        return ResultHelper(await _mlModelUserService.InsertMLModelUserAsync(mlModelUserDto));
    }

    // Assign new users to a specific ML model.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<bool>>> AssignMLModelUser([FromBody] AssignMLModelUserDto assignMLModelUserDto)
    {
        return ResultHelper(await _mlModelUserService.AssignMLModelUserAsync(assignMLModelUserDto));
    }

    // Updates an existing MLModel user.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<MLModelUserDto>>> UpdateMLModelUser([FromBody] MLModelUserDto mlModelUserDto)
    {
        return ResultHelper(await _mlModelUserService.UpdateMLModelUserAsync(mlModelUserDto));
    }

    // Deletes an MLModel user from the ML model permanently.
    [HttpDelete("{MLModelUserId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMLModelUser(Guid MLModelUserId)
    {
        return ResultHelper(await _mlModelUserService.DeleteMLModelUserAsync(MLModelUserId));
    }

    // Deletes multiple MLModel users by a list of their unique identifiers.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleMLModelUsers([FromBody] IEnumerable<Guid> MLModelUserIds)
    {
        return ResultHelper(await _mlModelUserService.DeleteMultipleMLModelUsersAsync(MLModelUserIds));
    }
}
