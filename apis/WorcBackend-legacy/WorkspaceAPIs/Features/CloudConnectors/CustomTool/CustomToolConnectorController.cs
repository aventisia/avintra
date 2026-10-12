using WorkspaceAPIs.DTOs;

namespace WorkspaceAPIs.Features.CloudConnectors.CustomTool;

/// <summary>
/// Runtime invoke endpoint for custom tools, using the shared cloud-connector request/response contract.
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
    /// Invokes the custom tool operation named by the request's action.
    /// </summary>
    [HttpPost("invoke")]
    public async Task<ActionResult<ServiceResponse<CloudConnectorResDto>>> InvokeCustomTool(
        [FromBody] CloudConnectorReqDto request)
    {
        return ResultHelper(await _customToolConnectorService.InvokeAsync(request, HttpContext.RequestAborted));
    }
}
