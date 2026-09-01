using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorkspaceAPIs.Features.CloudConnectors.CamelV2.Models;
using WorkspaceAPIs.Features.CloudConnectors.CamelV2.Services;

namespace WorkspaceAPIs.Features.CloudConnectors.CamelV2;

/// <summary>
/// Generic, catalog-driven Apache Camel connector endpoint (CamelV2).
///
/// Accepts:
///   <c>POST /cloud-connector/camelv2/invoke</c>
///   <c>POST /cloud-connector/camelv2/{family}/invoke</c>  (NodeExecutor path)
///   <c>GET  /cloud-connector/camelv2/connectors</c>
///   <c>GET  /cloud-connector/camelv2/connectors/{connector}/operations</c>
///   <c>POST /cloud-connector/camelv2/refresh</c>  (admin)
///
/// The request carries the connector family in <c>Provider</c> (e.g.
/// "CamelV2/Github" or "github") and the action in <c>Action</c>. The service
/// resolves the connector config (or falls back to the schema) and builds the
/// structured harness request.
/// </summary>
[Route("cloud-connector/camelv2")]
[ApiController]
[Authorize]
public class CamelV2ConnectorController : BaseApiController
{
    private readonly ICamelV2ConnectorService _service;
    private readonly WorkspaceDbContext _dbContext;

    public CamelV2ConnectorController(
        ICamelV2ConnectorService service,
        WorkspaceDbContext dbContext)
    {
        _service = service;
        _dbContext = dbContext;
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
    public async Task<ActionResult<ServiceResponse<IReadOnlyDictionary<string, CamelV2ConnectorSchema>>>> GetConnectors()
    {
        var catalog = await _service.GetCatalogAsync();
        return ResultHelper(new ServiceResponse<IReadOnlyDictionary<string, CamelV2ConnectorSchema>>
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
        var generated = await _service.RefreshAsync(_dbContext);
        return ResultHelper(new ServiceResponse<int>
        {
            Data = generated,
            StatusCode = 200,
            Message = $"CamelV2 refresh complete. Generated {generated} node configs."
        });
    }
}
