namespace MLModelBuilderAPIs.Controllers;

[Route("upload-doc")]
[ApiController]
[Authorize]
public class VersionResourceController : BaseApiController
{
    private readonly IVersionResourceService _versionResourceService;

    public VersionResourceController(IVersionResourceService versionResourceService)
    {
        _versionResourceService = versionResourceService;
    }

    // Inserts version resource records into the system.
    [HttpPost("insert-file")]
    public async Task<ActionResult<ServiceResponse<IList<VersionResourceDto>>>> InsertVersionResources(List<VersionResourceDto> versionResourcesDto)
    {
        return ResultHelper(await _versionResourceService.InsertVersionResourcesAsync(versionResourcesDto));
    }

    // Uploads version resource files along with their metadata.
    [HttpPost("upload-files")]
    public async Task<ActionResult<ServiceResponse<IList<VersionResourceDto>>>> UploadVersionResourceFiles([FromForm] UploadVersionResourceDto uploadVersionResourceDto)
    {
        return ResultHelper(await _versionResourceService.UploadVersionResourceFilesAsync(uploadVersionResourceDto));
    }

    // Retrieves a list of version resources by AI project version and document type.
    [HttpGet("list/{aiProjectVersionId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<VersionResourceDto>>>> GetVersionResources(Guid aiProjectVersionId)
    {
        return ResultHelper(await _versionResourceService.GetVersionResourcesAsync(aiProjectVersionId));
    }

    // Deletes a specific version resource by its ID.
    [HttpDelete("{versionResourceId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteVersionResource(Guid versionResourceId)
    {
        return ResultHelper(await _versionResourceService.DeleteVersionResourceAsync(versionResourceId));
    }

    // Deletes multiple version resources by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteVersionResources([FromBody] List<Guid> versionResourceIds)
    {
        return ResultHelper(await _versionResourceService.DeleteVersionResourcesAsync(versionResourceIds));
    }

    // Deletes all version resources associated with a specific AI project version.
    [HttpDelete("model/{aiProjectVersionId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteVersionResourceByAIProjectVersion(Guid aiProjectVersionId)
    {
        return ResultHelper(await _versionResourceService.DeleteVersionResourceByAIProjectVersionAsync(aiProjectVersionId));
    }

    // Uploads files adn version resources with a specified purpose.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<FileDetailDto>>> UploadFiles(List<IFormFile> files, DocumentPurposeTypesEnum purpose = DocumentPurposeTypesEnum.Default)
    {
        return ResultHelper(await _versionResourceService.UploadFilesAsync(files, purpose));
    }

    // Deletes a previously uploaded file by its URL.
    [HttpDelete]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteFile(string fileUrl)
    {
        return ResultHelper(await _versionResourceService.DeleteFileAsync(fileUrl));
    }

    // Downloads a file by its URL.
    [HttpGet]
    public async Task<IActionResult> DownloadFile([FromQuery] string fileUrl)
    {
        if (string.IsNullOrEmpty(fileUrl))
        {
            return BadRequest("File URL is required.");
        }

        var fileDetailsResponse = await _versionResourceService.DownloadFileAsync(fileUrl);

        if (fileDetailsResponse.Data == null)
        {
            return NotFound(fileDetailsResponse.Message ?? "File not found");
        }

        return File(fileDetailsResponse.Data.Content, fileDetailsResponse.Data.ContentType, fileDetailsResponse.Data.Name);
    }

    // Downloads a file by its URL.
    [AllowAnonymous]
    [HttpGet("local-to-cloud")]
    public async Task<ActionResult<ServiceResponse<bool>>> UplaodFileLocalToCloud()
    {
        return ResultHelper(await _versionResourceService.UploadFileLocalToCloudAsync());
    }
}
