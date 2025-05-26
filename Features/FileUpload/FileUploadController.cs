namespace WorkspaceAPIs.Controllers;

[Route("upload-file")]
[ApiController]
[Authorize]
public class FileUploadController(IFileUploadService uploadedDocService) : BaseApiController
{
    private readonly IFileUploadService _uploadedDocService = uploadedDocService;

    //Upload file
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<string>>> UploadFile(IFormFile file)
    {
        return ResultHelper(await _uploadedDocService.UploadFileAsync(file));
    }

    //Upload files
    [HttpPost("multiple")]
    public async Task<ActionResult<ServiceResponse<string[]>>> UploadFiles()
    {
        var files = Request?.Form?.Files.ToArray();
        return ResultHelper(await _uploadedDocService.UploadFilesAsync(files));
    }

    //Delete files
    [HttpDelete]
    public ActionResult<ServiceResponse<bool>> DeleteFile(string fileUrl)
    {
        return ResultHelper(_uploadedDocService.DeleteFileAsync(fileUrl));
    }
}