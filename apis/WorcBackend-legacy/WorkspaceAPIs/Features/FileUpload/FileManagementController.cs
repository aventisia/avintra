namespace WorkspaceAPIs.Controllers;

[Route("file")]
[ApiController]
[Authorize]
public class UploadedDocController : BaseApiController
{
    private readonly IUploadFileService _uploadFileService;
    private readonly IFileUploadService _fileUploadService;

    public UploadedDocController(IUploadFileService uploadFileService, IFileUploadService fileUploadService)
    {
        _uploadFileService = uploadFileService;
        _fileUploadService = fileUploadService;
    }

    // Upload multiple files
    [HttpPost("upload/multiple")]
    public async Task<ActionResult<ServiceResponse<List<FileDetailDto>>>> UploadFiles(List<IFormFile> files)
    {
        return ResultHelper(await _uploadFileService.UploadFilesAsync(files));
    }

    // Upload a single file
    [HttpPost("upload/single")]
    public async Task<ActionResult<ServiceResponse<FileDetailDto>>> UploadFile(IFormFile file)
    {
        return ResultHelper(await _uploadFileService.UploadSingleFileAsync(file));
    }

    //Delete files
    [HttpDelete("delete")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteFile(string fileUrl)
    {
        return ResultHelper(await _uploadFileService.DeleteFileAsync(fileUrl));
    }

    // Endpoint to download a file based on the file URL.
    [HttpGet("download")]
    public async Task<IActionResult> DownloadFileAsync([FromQuery] string fileUrl)
    {
        if (string.IsNullOrEmpty(fileUrl))
        {
            return BadRequest("File URL is required.");
        }
        var fileDetailsResponse = await _uploadFileService.DownloadFileAsync(fileUrl);

        if (fileDetailsResponse.Data == null)
        {
            return NotFound(fileDetailsResponse.Message ?? "File not found");
        }

        return File(fileDetailsResponse.Data.Content, fileDetailsResponse.Data.ContentType, fileDetailsResponse.Data.Name);
    }

    // Get file data URL
    [HttpGet("data-uri")]
    public async Task<ActionResult<ServiceResponse<string>>> GetDataUrl([FromQuery] Guid? credentialId, [FromQuery] string fileUrl)
    {
        return ResultHelper(await _fileUploadService.GetDataUrlAsync(credentialId, fileUrl));
    }
}