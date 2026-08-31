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

    public CorsairController(ICorsairInvokeService corsairInvokeService)
    {
        _corsairInvokeService = corsairInvokeService;
    }

    /// <summary>
    /// Invokes a Corsair plugin operation using a Vault credential resolved by name.
    /// </summary>
    [HttpPost("invoke")]
    public async Task<ActionResult<ServiceResponse<CorsairInvokeResDto>>> Invoke([FromBody] CorsairInvokeReqDto request)
    {
        return ResultHelper(await _corsairInvokeService.InvokeAsync(request));
    }
}
