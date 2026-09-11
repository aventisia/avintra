using AspNetToolkit.Controllers;
using AspNetToolkit.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorkspaceAPIs.Features.Corsair;

namespace WorkspaceAPIs.Controllers;

/// <summary>
/// INTERNAL ONLY: Workspace API proxy for Corsair sidecar operations.
/// 
/// This controller proxies Corsair plugin invocation requests from workflow nodes to the private
/// Corsair sidecar. End users do not interact directly with Corsair — they see only
/// friendly plugin names and action descriptions in the Studio UI. The sidecar is
/// backend infrastructure that is NOT exposed to the public internet.
/// 
/// All authorization checks happen here in the Workspace API before forwarding to the sidecar.
/// </summary>
[Route("corsair")]
[ApiController]
[Authorize]
public class CorsairController : BaseApiController
{
    private readonly ICorsairInvokeService _corsairInvokeService;
    private readonly ICorsairSidecarService _corsairSidecarService;

    public CorsairController(ICorsairInvokeService corsairInvokeService, ICorsairSidecarService corsairSidecarService)
    {
        _corsairInvokeService = corsairInvokeService;
        _corsairSidecarService = corsairSidecarService;
    }

    /// <summary>
    /// Invokes a Corsair plugin operation using a Vault credential resolved by name.
    /// </summary>
    [HttpPost("invoke")]
    public async Task<ActionResult<ServiceResponse<CorsairInvokeResDto>>> Invoke([FromBody] CorsairInvokeReqDto request)
    {
        return ResultHelper(await _corsairInvokeService.InvokeAsync(request));
    }

    /// <summary>
    /// Reports whether the Corsair sidecar is reachable and healthy, plus the
    /// configured sidecar URL. Intended for diagnostics/testing (e.g. Bruno).
    /// Requires an authenticated session; it does not expose credentials.
    /// Always returns the JSON envelope so callers can read <c>data.status</c>
    /// and <c>data.sidecarUrl</c> regardless of health.
    /// </summary>
    [HttpGet("health")]
    public async Task<ActionResult<ServiceResponse<CorsairHealthResult>>> Health()
    {
        var result = await _corsairSidecarService.GetHealthAsync();
        var ok = string.Equals(result.Status, "ok", StringComparison.OrdinalIgnoreCase);
        return Ok(ServiceResponse<CorsairHealthResult>.Create(
            ok ? "Corsair sidecar is healthy." : "Corsair sidecar is unreachable.",
            200,
            result));
    }
}
