namespace WorkspaceAPIs.Controllers;

[Route("upload-file")]
[ApiController]
[Authorize]
public class FileUploadController(IFileUploadService uploadedDocService) : BaseApiController
{
    private readonly IFileUploadService _uploadedDocService = uploadedDocService;

    //Upload file
    [HttpGet("{isTemp?}")]
    public async Task<ActionResult<ServiceResponse<string>>> UploadFile(string fileOrRemoteUrl, bool isTemp = true)
    {
        return ResultHelper(await _uploadedDocService.GetFileByUrlOrFileIdAsync(fileOrRemoteUrl, isTemp));
    }

    //Upload file
    [HttpPost("{isTemp?}")]
    public async Task<ActionResult<ServiceResponse<string>>> UploadFile(IFormFile file, bool isTemp = true)
    {
        return ResultHelper(await _uploadedDocService.UploadFileAsync(file, isTemp));
    }

    //Upload files
    [HttpPost("multiple/{isTemp?}")]
    public async Task<ActionResult<ServiceResponse<string[]>>> UploadFiles(bool isTemp = true)
    {
        var files = Request?.Form?.Files.ToArray();
        return ResultHelper(await _uploadedDocService.UploadFilesAsync(files, isTemp));
    }

    //Delete files
    [HttpDelete]
    public ActionResult<ServiceResponse<bool>> DeleteFile(string fileUrl)
    {
        return ResultHelper(_uploadedDocService.DeleteFileAsync(fileUrl));
    }
}