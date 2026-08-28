namespace WorkspaceAPIs.Features.CloudConnectors.Camel;

/// <summary>
/// Single, generic, configuration-driven Apache Camel connector endpoint.
///
/// Accepts both:
///   <c>POST /cloud-connector/camel/invoke</c>
///   <c>POST /cloud-connector/camel/{family}/invoke</c>  (legacy per-family path)
///
/// The request carries the connector family in <c>Provider</c> (e.g.
/// "Camel/Github" or "github") and the action in <c>Action</c>; the service
/// resolves the connector config and builds the structured harness request.
/// The <c>{family}</c> route segment is accepted for backward compatibility with
/// the NodeExecutor runtime path but is not used — the family is always resolved
/// from <c>Provider</c>.
/// </summary>
[Route("cloud-connector/camel")]
[ApiController]
[Authorize]
public class CamelConnectorController : BaseApiController
{
    private readonly CamelConnectorService _service;

    public CamelConnectorController(CamelConnectorService service)
    {
        _service = service;
    }

    [HttpPost("invoke")]
    [HttpPost("{family}/invoke")]
    public async Task<ActionResult<ServiceResponse<CloudConnectorResDto>>> Invoke(
        string? family,
        [FromBody] CloudConnectorReqDto request)
    {
        return ResultHelper(await _service.InvokeAsync(request));
    }
}
