namespace WorkspaceAPIs.Controllers;

[Authorize]
[ApiController]
[Route("uibuilder-project-user")]
public class UiBuilderProjectUserController : BaseApiController
{
    private readonly IUiBuilderProjectUserService _uiBuilderProjectUserService;

    public UiBuilderProjectUserController(IUiBuilderProjectUserService uiBuilderProjectUserService)
    {
        _uiBuilderProjectUserService = uiBuilderProjectUserService;
    }

    /// <summary>
    /// Retrieves UI builder projects assigned to the current user.
    /// </summary>
    [HttpGet("my")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<UiBuilderProjectUserDto>>>> GetMyUiBuilderProjectUsers()
    {
        return ResultHelper(await _uiBuilderProjectUserService.GetMyUiBuilderProjectUsersAsync());
    }

    /// <summary>
    /// Retrieves users assigned to a specific UI builder project.
    /// </summary>
    [HttpGet("{uiBuilderProjectId}/list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<UiBuilderProjectUserDto>>>> GetUiBuilderProjectUsers(Guid uiBuilderProjectId)
    {
        return ResultHelper(await _uiBuilderProjectUserService.GetUiBuilderProjectUsersAsync(uiBuilderProjectId));
    }

    /// <summary>
    /// Retrieves a UI builder project user by its ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceResponse<UiBuilderProjectUserDto>>> GetUiBuilderProjectUser(Guid id)
    {
        return ResultHelper(await _uiBuilderProjectUserService.GetUiBuilderProjectUserByIdAsync(id));
    }

    /// <summary>
    /// Inserts a new UI builder project user.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<UiBuilderProjectUserDto>>> InsertUiBuilderProjectUser([FromBody] UiBuilderProjectUserDto uiBuilderProjectUserDto)
    {
        return ResultHelper(await _uiBuilderProjectUserService.InsertUiBuilderProjectUserAsync(uiBuilderProjectUserDto));
    }

    /// <summary>
    /// Inserts multiple UI builder project users.
    /// </summary>
    [HttpPost("bulk")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<UiBuilderProjectUserDto>>>> BulkInsertUiBuilderProjectUsers([FromBody] IEnumerable<UiBuilderProjectUserDto> uiBuilderProjectUserDtos)
    {
        return ResultHelper(await _uiBuilderProjectUserService.BulkInsertUiBuilderProjectUsersAsync(uiBuilderProjectUserDtos));
    }

    /// <summary>
    /// Updates an existing UI builder project user.
    /// </summary>
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<UiBuilderProjectUserDto>>> UpdateUiBuilderProjectUser([FromBody] UiBuilderProjectUserDto uiBuilderProjectUserDto)
    {
        return ResultHelper(await _uiBuilderProjectUserService.UpdateUiBuilderProjectUserAsync(uiBuilderProjectUserDto));
    }

    /// <summary>
    /// Deletes a UI builder project user by its ID.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteUiBuilderProjectUser(Guid id)
    {
        return ResultHelper(await _uiBuilderProjectUserService.DeleteUiBuilderProjectUserAsync(id));
    }

    /// <summary>
    /// Deletes multiple UI builder project users by their IDs.
    /// </summary>
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteUiBuilderProjectUsers([FromBody] IEnumerable<Guid> uiBuilderProjectUserIds)
    {
        return ResultHelper(await _uiBuilderProjectUserService.DeleteUiBuilderProjectUsersAsync(uiBuilderProjectUserIds));
    }
}
