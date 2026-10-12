namespace WorkspaceAPIs.Controllers;

[Route("tools")]
[ApiController]
[Authorize]
public class ToolsController : BaseApiController
{
    private readonly IToolService _toolService;
    private readonly IToolCatalogService _toolCatalogService;
    private readonly IToolVerificationService _toolVerificationService;

    /// <summary>
    /// Initializes a new instance of the <see cref="ToolsController"/> class.
    /// </summary>
    public ToolsController(
        IToolService toolService,
        IToolCatalogService toolCatalogService,
        IToolVerificationService toolVerificationService)
    {
        _toolService = toolService;
        _toolCatalogService = toolCatalogService;
        _toolVerificationService = toolVerificationService;
    }

    /// <summary>
    /// Gets all personal tools.
    /// </summary>
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ToolDto>>>> GetPersonalTools()
    {
        return ResultHelper(await _toolService.GetToolsAsync(true));
    }

    /// <summary>
    /// Gets all shared tools.
    /// </summary>
    [HttpGet("list/shared")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ToolDto>>>> GetSharedTools()
    {
        return ResultHelper(await _toolService.GetToolsAsync(false));
    }

    /// <summary>
    /// Gets the custom tools the current user can use.
    /// </summary>
    [HttpGet("usable")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<UsableToolDto>>>> GetUsableTools()
    {
        return ResultHelper(await _toolCatalogService.GetUsableToolsAsync());
    }

    /// <summary>
    /// Gets the operations exposed by a usable tool.
    /// </summary>
    [HttpGet("usable/{toolId}/operations")]
    public async Task<ActionResult<ServiceResponse<UsableToolOperationsDto>>> GetUsableToolOperations(Guid toolId)
    {
        return ResultHelper(await _toolCatalogService.GetUsableToolOperationsAsync(toolId));
    }

    /// <summary>
    /// Gets the usable tools together with their enriched operations in a single payload.
    /// </summary>
    [HttpGet("usable/catalog")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<UsableToolCatalogItemDto>>>> GetUsableToolCatalog()
    {
        return ResultHelper(await _toolCatalogService.GetUsableToolCatalogAsync());
    }

    /// <summary>
    /// Checks whether a tool name is available.
    /// </summary>
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsToolNameAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _toolService.IsToolNameAvailableAsync(checkAvailabilityDto));
    }

    /// <summary>
    /// Gets a tool by its ID.
    /// </summary>
    [HttpGet("{toolId}")]
    public async Task<ActionResult<ServiceResponse<ToolDto>>> GetToolById(Guid toolId)
    {
        return ResultHelper(await _toolService.GetToolByIdAsync(toolId));
    }

    /// <summary>
    /// Gets a tool by its name within the current environment.
    /// </summary>
    [HttpGet("by-name/{toolName}")]
    public async Task<ActionResult<ServiceResponse<ToolDto>>> GetToolByName(string toolName)
    {
        return ResultHelper(await _toolService.GetToolByNameAsync(toolName));
    }

    /// <summary>
    /// Creates a new tool.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<ToolDto>>> CreateTool([FromBody] ToolDto toolDto)
    {
        return ResultHelper(await _toolService.InsertToolAsync(toolDto));
    }

    /// <summary>
    /// Updates an existing tool.
    /// </summary>
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<ToolDto>>> UpdateTool([FromBody] ToolDto toolDto)
    {
        return ResultHelper(await _toolService.UpdateToolAsync(toolDto));
    }

    /// <summary>
    /// Deletes a tool.
    /// </summary>
    [HttpDelete("{toolId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteTool(Guid toolId)
    {
        return ResultHelper(await _toolService.DeleteToolAsync(toolId));
    }

    /// <summary>
    /// Deletes multiple tools.
    /// </summary>
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<int>>> DeleteMultipleTools([FromBody] List<Guid> toolIds)
    {
        return ResultHelper(await _toolService.DeleteToolsAsync(toolIds));
    }

    /// <summary>
    /// Tests a tool operation.
    /// </summary>
    [HttpPost("{toolId}/test")]
    public async Task<ActionResult<ServiceResponse<TestToolResponseDto>>> TestTool(Guid toolId, [FromBody] TestToolDto testToolDto)
    {
        var accessToken = Request.Cookies[CookieNamesEnum.AccessToken.ToString()]
            ?? Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        return ResultHelper(await _toolVerificationService.TestToolAsync(toolId, testToolDto, accessToken));
    }

    /// <summary>
    /// Activates or deactivates a tool.
    /// </summary>
    [HttpPost("{toolId}/active-state")]
    public async Task<ActionResult<ServiceResponse<ToolDto>>> SetToolActiveState(Guid toolId, [FromBody] SetToolActiveStateRequest request)
    {
        return ResultHelper(await _toolService.SetToolActiveStateAsync(toolId, request.IsActive));
    }

    /// <summary>
    /// Retrieves all platform tools.
    /// </summary>
    [HttpGet("platform")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ToolDto>>>> GetPlatformTools()
    {
        return ResultHelper(await _toolCatalogService.GetPlatformToolsAsync());
    }
}
