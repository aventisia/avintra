using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorkspaceAPIs.Features.CloudConnectors.Camel.Models;
using WorkspaceAPIs.Features.CloudConnectors.Camel.Services;

namespace WorkspaceAPIs.Features.CloudConnectors.Camel;

/// <summary>
/// Single, generic Apache Camel connector endpoint (consolidated from the legacy
/// <c>camel</c> and <c>camelv2</c> endpoints).
///
/// Accepts:
///   <c>POST /cloud-connector/camel/invoke</c>
///   <c>POST /cloud-connector/camel/{family}/invoke</c>  (NodeExecutor path)
///   <c>GET  /cloud-connector/camel/connectors</c>
///   <c>GET  /cloud-connector/camel/connectors/{connector}/operations</c>
///   <c>POST /cloud-connector/camel/refresh</c>  (admin)
///
/// The request carries the connector family in <c>Provider</c> (e.g.
/// "Camel/Github" or "github") and the action in <c>Action</c>. The service
/// resolves the connector config (or falls back to the harness schema) and
/// builds the structured harness request. The <c>{family}</c> route segment is
/// accepted for backward compatibility with the NodeExecutor runtime path but is
/// not used — the family is always resolved from <c>Provider</c>.
/// </summary>
[Route("cloud-connector/camel")]
[ApiController]
[Authorize]
public class CamelConnectorController : BaseApiController
{
    private readonly ICamelConnectorService _service;

    public CamelConnectorController(ICamelConnectorService service)
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

    [HttpGet("connectors")]
    public async Task<ActionResult<ServiceResponse<IReadOnlyDictionary<string, CamelConnectorSchema>>>> GetConnectors()
    {
        var catalog = await _service.GetCatalogAsync();
        return ResultHelper(new ServiceResponse<IReadOnlyDictionary<string, CamelConnectorSchema>>
        {
            Data = catalog,
            StatusCode = 200,
            Message = $"Returned {catalog.Count} Camel connectors."
        });
    }

    [HttpGet("connectors/{connector}/operations")]
    public async Task<ActionResult<ServiceResponse<IReadOnlyList<string>>>> GetOperations(string connector)
    {
        var operations = await _service.GetOperationsAsync(connector);
        return ResultHelper(new ServiceResponse<IReadOnlyList<string>>
        {
            Data = operations,
            StatusCode = 200,
            Message = $"Returned {operations.Count} operations for Camel connector '{connector}'."
        });
    }

    [HttpPost("refresh")]
    [Authorize(Roles = "SA")]
    public async Task<ActionResult<ServiceResponse<int>>> Refresh()
    {
        var count = await _service.RefreshCatalogAsync();
        return ResultHelper(new ServiceResponse<int>
        {
            Data = count,
            StatusCode = 200,
            Message = $"Camel catalog refresh complete. {count} connectors available."
        });
    }
}
