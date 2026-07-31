namespace WorkspaceAPIs.Controllers;

[Route("tools")]
[ApiController]
[Authorize]
public class ToolsController : BaseApiController
{
    private readonly IToolService _toolService;

    // Initializes a new instance of the <see cref="ToolsController"/> class.
    public ToolsController(IToolService toolService)
    {
        _toolService = toolService;
    }

    // Gets all personal tools.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ToolDto>>>> GetPersonalTools()
    {
        return ResultHelper(await _toolService.GetToolsAsync(true));
    }

    // Gets all shared tools.
    [HttpGet("list/shared")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ToolDto>>>> GetSharedTools()
    {
        return ResultHelper(await _toolService.GetToolsAsync(false));
    }

    // Checks whether a tool name is available.
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsToolNameAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _toolService.IsToolNameAvailableAsync(checkAvailabilityDto));
    }

    // Gets a tool by its ID.
    [HttpGet("{toolId}")]
    public async Task<ActionResult<ServiceResponse<ToolDto>>> GetToolById(Guid toolId)
    {
        return ResultHelper(await _toolService.GetToolByIdAsync(toolId));
    }

    // Creates a new tool.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<ToolDto>>> CreateTool([FromBody] ToolDto toolDto)
    {
        return ResultHelper(await _toolService.InsertToolAsync(toolDto));
    }

    // Updates an existing tool.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<ToolDto>>> UpdateTool([FromBody] ToolDto toolDto)
    {
        return ResultHelper(await _toolService.UpdateToolAsync(toolDto));
    }

    // Deletes a tool.
    [HttpDelete("{toolId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteTool(Guid toolId)
    {
        return ResultHelper(await _toolService.DeleteToolAsync(toolId));
    }

    // Deletes multiple tools.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleTools([FromBody] List<Guid> toolIds)
    {
        return ResultHelper(await _toolService.DeleteToolsAsync(toolIds));
    }

    // Tests a tool operation.
    [HttpPost("{toolId}/test")]
    public async Task<ActionResult<ServiceResponse<TestToolResponseDto>>> TestTool(Guid toolId, [FromBody] TestToolDto testToolDto)
    {
        return ResultHelper(await _toolService.TestToolAsync(toolId, testToolDto));
    }

    // Activates a tool.
    [HttpPost("{toolId}/activate")]
    public async Task<ActionResult<ServiceResponse<ToolDto>>> ActivateTool(Guid toolId)
    {
        return ResultHelper(await _toolService.ActivateToolAsync(toolId));
    }

    // Retrieves all platform (library) tools.
    [HttpGet("library")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ToolDto>>>> GetLibraryTools()
    {
        return ResultHelper(await _toolService.GetLibraryToolsAsync());
    }
}