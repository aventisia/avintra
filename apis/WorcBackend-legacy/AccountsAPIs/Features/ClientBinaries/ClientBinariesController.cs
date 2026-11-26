namespace AccountsAPIs.Controllers;

[Route("binaries")]
[ApiController]
public class ClientBinariesController : BaseApiController
{
    private readonly IClientBinariesService _clientBinariesService;

    public ClientBinariesController(IClientBinariesService clientBinariesService)
    {
        _clientBinariesService = clientBinariesService;
    }

    // GET: /binaries/download-manifest
    [AcceptVerbs("GET", "HEAD", Route = "download-manifest")]
    public async Task<ActionResult<ServiceResponse<DownloadManifestDto>>> GetDownloadManifest()
    {
        return ResultHelper(await _clientBinariesService.GetDownloadManifestAsync());
    }
}
