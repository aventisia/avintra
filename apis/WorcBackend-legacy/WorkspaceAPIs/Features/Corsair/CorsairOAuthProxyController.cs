using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorkspaceAPIs.Services;

namespace WorkspaceAPIs.Features.Corsair;

/// <summary>
/// Browser-facing OAuth proxy for the Corsair sidecar.
///
/// The Corsair sidecar is internal-only and never exposed to the public internet.
/// The provider redirects the browser to these endpoints during the OAuth consent
/// flow, so they are intentionally unauthenticated (no JWT is present on the
/// provider redirect). They are protected by the HMAC-signed <c>state</c> parameter
/// that the sidecar verifies before exchanging the code for tokens.
///
/// These endpoints simply forward the browser to/from the sidecar; they never
/// expose sidecar internals or credentials to the caller.
///
/// The route uses the generic "integration" path so end users never see the
/// internal "corsair" service name in browser URLs.
/// </summary>
[Route("integration")]
[ApiController]
[AllowAnonymous]
public class CorsairOAuthProxyController : ControllerBase
{
    private readonly ICorsairSidecarService _corsairSidecarService;
    private readonly ILogger<CorsairOAuthProxyController> _logger;

    public CorsairOAuthProxyController(
        ICorsairSidecarService corsairSidecarService,
        ILogger<CorsairOAuthProxyController> logger)
    {
        _corsairSidecarService = corsairSidecarService;
        _logger = logger;
    }

    /// <summary>
    /// Proxies the OAuth consent page. The provider redirects the browser here
    /// with a signed <c>state</c>; we resolve it to the provider's authorization
    /// URL and redirect the browser onward.
    /// </summary>
    [HttpGet("connect")]
    public async Task<IActionResult> Connect([FromQuery] string? state)
    {
        if (string.IsNullOrWhiteSpace(state))
        {
            return BadRequest("Missing state.");
        }

        var oauthUrl = await _corsairSidecarService.ResolveConnectAsync(state);
        if (string.IsNullOrWhiteSpace(oauthUrl))
        {
            return BadRequest("Invalid connect state.");
        }

        return Redirect(oauthUrl);
    }

    /// <summary>
    /// Proxies the provider OAuth callback. The provider redirects the browser
    /// here with <c>code</c> + <c>state</c>; we forward to the sidecar, which
    /// exchanges the code for tokens and stores them per tenant, then redirect
    /// the browser back to the workspace app with the result.
    /// </summary>
    [HttpGet("oauth-callback")]
    public async Task<IActionResult> OAuthCallback([FromQuery] string? code, [FromQuery] string? state)
    {
        if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(state))
        {
            return BadRequest("Missing code or state.");
        }

        var redirectUrl = await _corsairSidecarService.ProcessOAuthCallbackAsync(code, state);
        if (string.IsNullOrWhiteSpace(redirectUrl))
        {
            _logger.LogWarning("Corsair OAuth callback failed for state {StatePrefix}.", state[..Math.Min(8, state.Length)]);
            return BadRequest("OAuth callback failed.");
        }

        return Redirect(redirectUrl);
    }
}
