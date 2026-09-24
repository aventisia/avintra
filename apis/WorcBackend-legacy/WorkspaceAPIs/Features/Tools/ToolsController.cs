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

    // Gets the custom tools the current user can use.
    [HttpGet("usable")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<UsableToolDto>>>> GetUsableTools()
    {
        return ResultHelper(await _toolService.GetUsableToolsAsync());
    }

    // Gets the operations exposed by a usable tool.
    [HttpGet("usable/{toolId}/operations")]
    public async Task<ActionResult<ServiceResponse<UsableToolOperationsDto>>> GetUsableToolOperations(Guid toolId)
    {
        return ResultHelper(await _toolService.GetUsableToolOperationsAsync(toolId));
    }

    // Gets the usable tools together with their enriched operations in a single payload.
    [HttpGet("usable/catalog")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<UsableToolCatalogItemDto>>>> GetUsableToolCatalog()
    {
        return ResultHelper(await _toolService.GetUsableToolCatalogAsync());
    }

    // Gets the dynamic-config-panel node config for a custom-tool action node
    // ("CustomTool/{toolName}.{operationId}"; legacy "{toolId}.{operationId}" still accepted). Returns the raw config JSON (no service-response
    // envelope), matching the cloud-connector config-file contract that the
    // studio node-config loader consumes. Registered before the generic {toolId}
    // route so ASP.NET route matching does not swallow it.
    [HttpGet("node-config/{*nodeName}")]
    public async Task<ActionResult<JsonDocument?>> GetCustomToolNodeConfig(string nodeName)
    {
        var config = await _toolService.GetCustomToolNodeConfigAsync(nodeName);
        if (config is null)
        {
            return NotFound();
        }

        return Ok(config);
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

    // Gets a tool by its name within the current environment.
    [HttpGet("by-name/{toolName}")]
    public async Task<ActionResult<ServiceResponse<ToolDto>>> GetToolByName(string toolName)
    {
        return ResultHelper(await _toolService.GetToolByNameAsync(toolName));
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

    // Activates or deactivates a tool.
    [HttpPost("{toolId}/active-state")]
    public async Task<ActionResult<ServiceResponse<ToolDto>>> SetToolActiveState(Guid toolId, [FromBody] SetToolActiveStateRequest request)
    {
        return ResultHelper(await _toolService.SetToolActiveStateAsync(toolId, request.IsActive));
    }

    // Retrieves all platform tools.
    [HttpGet("platform")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ToolDto>>>> GetPlatformTools()
    {
        return ResultHelper(await _toolService.GetPlatformToolsAsync());
    }
}