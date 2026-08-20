namespace AccountsAPIs.Controllers;

[Route("binaries/runner")]
[ApiController]
public class RunnerBinariesController : BaseApiController
{
    private readonly IClientBinariesService _clientBinariesService;

    public RunnerBinariesController(IClientBinariesService clientBinariesService)
    {
        _clientBinariesService = clientBinariesService;
    }

    // GET: /binaries/runner/latest
    [HttpGet("latest")]
    public async Task<ActionResult<ServiceResponse<RunnerLatestDto>>> GetRunnerAppLatest()
    {
        return ResultHelper(await _clientBinariesService.GetRunnerAppLatestAsync());
    }

    // GET: /binaries/runner/download/
    [HttpGet("download")]
    public IActionResult DownloadRunnerApp()
    {
        return StreamBinary(_clientBinariesService.GetRunnerDownload(null));
    }

    // GET: /binaries/runner/download/{version}
    [HttpGet("download/{version}")]
    public IActionResult DownloadRunnerApp(string version)
    {
        return StreamBinary(_clientBinariesService.GetRunnerDownload(version));
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
