namespace AccountsAPIs.Controllers;

[Route("scripts")]
[ApiController]
public class ScriptsController : BaseApiController
{
    private readonly IClientBinariesService _clientBinariesService;

    public ScriptsController(IClientBinariesService clientBinariesService)
    {
        _clientBinariesService = clientBinariesService;
    }

    // GET: /scripts/Install-AvintraRunnerService.ps1
    // Public install-script endpoint. The proxy rewrites /files/scripts/* to /api/scripts/*,
    // so this action route is intentionally a plain "scripts" prefix without any
    // /binaries/runner/ segment.
    [HttpGet("Install-AvintraRunnerService.ps1")]
    public IActionResult GetInstallScript()
    {
        var result = _clientBinariesService.GetInstallScript();
        if (string.IsNullOrEmpty(result.FilePath))
            return NotFound(result.Message);

        // Serve as inline UTF-8 text so `irm ... | iex` receives the script source
        // rather than a binary download / attachment response.
        var fileStream = System.IO.File.OpenRead(result.FilePath);
        Response.Headers["Content-Disposition"] = "inline";
        return new FileStreamResult(fileStream, "text/plain; charset=utf-8");
    }
}
