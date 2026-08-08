namespace AccountsAPIs.Controllers;

[Route("binaries/desktop")]
[ApiController]
public class DesktopBinariesController : BaseApiController
{
    private readonly IClientBinariesService _clientBinariesService;

    public DesktopBinariesController(IClientBinariesService clientBinariesService)
    {
        _clientBinariesService = clientBinariesService;
    }

    // GET: /binaries/desktop/download/
    [HttpGet("download")]
    public IActionResult DownloadVersion()
    {
        return StreamBinary(_clientBinariesService.GetDesktopDownload(null));
    }

    // GET: /binaries/desktop/download/{version}
    [HttpGet("download/{version}")]
    public IActionResult DownloadVersion(string version)
    {
        return StreamBinary(_clientBinariesService.GetDesktopDownload(version));
    }

    // GET: /binaries/desktop/download/{version}.sig
    [HttpGet("download/{version}.sig")]
    public IActionResult DownloadSignature(string version)
    {
        return StreamBinary(_clientBinariesService.GetDesktopSignature(version));
    }

    // GET: /binaries/desktop/update/{target}/{arch}/{currentVersion}
    [HttpGet("update/{target}/{arch}/{currentVersion}")]
    public async Task<ActionResult<ServiceResponse<UpdateCheckDto>>> CheckUpdate(string target, string arch, string currentVersion)
    {
        return ResultHelper(await _clientBinariesService.CheckUpdateAsync(target, arch, currentVersion));
    }

    // Streams a resolved binary file, or returns a not-found response when it could not be resolved.
    private IActionResult StreamBinary(BinaryFileResult result)
    {
        if (string.IsNullOrEmpty(result.FilePath))
            return NotFound(result.Message);

        var fileStream = System.IO.File.OpenRead(result.FilePath);
        return new FileStreamResult(fileStream, result.ContentType) { FileDownloadName = result.FileName };
    }
}
