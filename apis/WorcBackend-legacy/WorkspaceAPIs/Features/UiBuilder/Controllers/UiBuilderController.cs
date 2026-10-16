namespace WorkspaceAPIs.Controllers;

[Route("ui-builder")]
[ApiController]
[Authorize]
public class UiBuilderController : BaseApiController
{
    private readonly IUiBuilderService _uiBuilderService;

    public UiBuilderController(IUiBuilderService uiBuilderService)
    {
        _uiBuilderService = uiBuilderService;
    }

    /// <summary>
    /// Retrieves all custom UI builder projects created by the user.
    /// </summary>
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<UiBuilderProjectDto>>>> GetUiBuilderProjects()
    {
        return ResultHelper(await _uiBuilderService.GetUiBuilderProjectsAsync(true));
    }

    /// <summary>
    /// Retrieves all custom UI builder projects shared tenant-wide.
    /// </summary>
    [HttpGet("list/shared")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<UiBuilderProjectDto>>>> GetSharedUiBuilderProjects()
    {
        return ResultHelper(await _uiBuilderService.GetUiBuilderProjectsAsync(false));
    }

    /// <summary>
    /// Retrieves a custom UI builder project by its ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceResponse<UiBuilderProjectDto>>> GetUiBuilderProject(Guid id)
    {
        return ResultHelper(await _uiBuilderService.GetUiBuilderProjectAsync(id));
    }

    /// <summary>
    /// Retrieves all generated versions of a custom UI builder project.
    /// </summary>
    [HttpGet("{id}/versions")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<UiBuilderVersionDto>>>> GetUiBuilderVersions(Guid id)
    {
        return ResultHelper(await _uiBuilderService.GetUiBuilderVersionsAsync(id));
    }

    /// <summary>
    /// Inserts a new custom UI builder project.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<UiBuilderProjectDto>>> InsertUiBuilderProject([FromBody] UiBuilderProjectDto uiBuilderProjectDto)
    {
        return ResultHelper(await _uiBuilderService.InsertUiBuilderProjectAsync(uiBuilderProjectDto));
    }

    /// <summary>
    /// Updates an existing custom UI builder project.
    /// </summary>
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<UiBuilderProjectDto>>> UpdateUiBuilderProject([FromBody] UiBuilderProjectDto uiBuilderProjectDto)
    {
        return ResultHelper(await _uiBuilderService.UpdateUiBuilderProjectAsync(uiBuilderProjectDto));
    }

    /// <summary>
    /// Deletes a custom UI builder project by its ID.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteUiBuilderProject(Guid id)
    {
        return ResultHelper(await _uiBuilderService.DeleteUiBuilderProjectAsync(id));
    }

    /// <summary>
    /// Deletes multiple custom UI builder projects by their IDs.
    /// </summary>
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<int>>> DeleteUiBuilderProjects([FromBody] List<Guid> ids)
    {
        return ResultHelper(await _uiBuilderService.DeleteUiBuilderProjectsAsync(ids));
    }

    /// <summary>
    /// Checks the availability of a custom UI builder project name.
    /// </summary>
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsUiBuilderNameAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _uiBuilderService.IsUiBuilderNameAvailableAsync(checkAvailabilityDto));
    }

    /// <summary>
    /// Inserts a new generated version for a custom UI builder project.
    /// </summary>
    [HttpPost("{id}/versions")]
    public async Task<ActionResult<ServiceResponse<UiBuilderVersionDto>>> InsertUiBuilderVersion(Guid id, [FromBody] UiBuilderVersionDto uiBuilderVersionDto)
    {
        return ResultHelper(await _uiBuilderService.InsertUiBuilderVersionAsync(id, uiBuilderVersionDto));
    }

    /// <summary>
    /// Restores a custom UI builder project version as a new head version.
    /// </summary>
    [HttpPost("{id}/restore/{versionNumber}")]
    public async Task<ActionResult<ServiceResponse<UiBuilderVersionDto>>> RestoreUiBuilderVersion(Guid id, int versionNumber)
    {
        return ResultHelper(await _uiBuilderService.RestoreUiBuilderVersionAsync(id, versionNumber));
    }

    /// <summary>
    /// Pins the current head version of a custom UI builder project as its published version.
    /// </summary>
    [HttpPost("{id}/publish")]
    public async Task<ActionResult<ServiceResponse<UiBuilderProjectDto>>> PublishUiBuilderProject(Guid id)
    {
        return ResultHelper(await _uiBuilderService.PublishUiBuilderProjectAsync(id));
    }

    /// <summary>
    /// Retrieves all published custom UI builder projects.
    /// </summary>
    [HttpGet("published")]
    [Authorize(Roles = "OM")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<UiBuilderProjectDto>>>> GetPublishedUiBuilderProjects()
    {
        return ResultHelper(await _uiBuilderService.GetPublishedUiBuilderProjectsAsync());
    }

    /// <summary>
    /// Retrieves all published custom UI builder projects assigned to the user.
    /// </summary>
    [HttpGet("my")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<UiBuilderProjectDto>>>> GetMyUiBuilderProjects()
    {
        return ResultHelper(await _uiBuilderService.GetMyUiBuilderProjectsAsync());
    }

    /// <summary>
    /// Retrieves a published custom UI builder project and its pinned published version for an assigned user.
    /// </summary>
    [HttpGet("published/{id}/view")]
    public async Task<ActionResult<ServiceResponse<UiBuilderProjectViewDto>>> GetPublishedUiBuilderView(Guid id)
    {
        return ResultHelper(await _uiBuilderService.GetPublishedUiBuilderViewAsync(id));
    }

    /// <summary>
    /// Retrieves a published custom UI builder project and its pinned published version for the orchestrator preview.
    /// </summary>
    [HttpGet("published/{id}/om-view")]
    [Authorize(Roles = "OM")]
    public async Task<ActionResult<ServiceResponse<UiBuilderProjectViewDto>>> GetOmUiBuilderView(Guid id)
    {
        return ResultHelper(await _uiBuilderService.GetOmUiBuilderViewAsync(id));
    }
}
