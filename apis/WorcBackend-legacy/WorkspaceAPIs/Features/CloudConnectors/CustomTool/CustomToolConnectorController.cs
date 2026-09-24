using WorkspaceAPIs.DTOs;

namespace WorkspaceAPIs.Features.CloudConnectors.CustomTool;
/// <summary>
/// Runtime invoke endpoint for custom tools, using the shared cloud-connector
/// request/response contract. The executor's custom-tool preprocessing routes
/// <c>CustomTool/{toolName}.{operationId}</c> nodes here with
/// <c>Provider = "customtool"</c> and <c>Action = "{toolName}.{operationId}"</c>;
/// the service resolves the tool, operation and credential server-side.
/// </summary>
[Route("cloud-connector/custom-tool")]
[ApiController]
[Authorize]
public class CustomToolConnectorController : BaseApiController
{
    private readonly ICustomToolConnectorService _customToolConnectorService;

    public CustomToolConnectorController(ICustomToolConnectorService customToolConnectorService)
    {
        _customToolConnectorService = customToolConnectorService;
    }

    /// <summary>
    /// Invokes a custom tool operation. The action must be the
    /// <c>{toolName}.{operationId}</c> reference matching the node name convention
    /// (legacy <c>{toolId}.{operationId}</c> references are still accepted).
    /// </summary>
    [HttpPost("invoke")]
    public async Task<ActionResult<ServiceResponse<CloudConnectorResDto>>> InvokeCustomTool(
        [FromBody] CloudConnectorReqDto request)
    {
        return ResultHelper(await _customToolConnectorService.InvokeAsync(request));
    }
}