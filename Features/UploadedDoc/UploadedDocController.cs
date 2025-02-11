namespace MLModelBuilderAPIs.Controllers;

[Route("upload-doc")]
[ApiController]
[Authorize]
public class UploadedDocController: BaseApiController
{
    private readonly IUploadedDocService _uploadedDocService;

    public UploadedDocController(IUploadedDocService uploadedDocService)
    {
        _uploadedDocService = uploadedDocService;
    }

    //Upload files
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<FileDetailDto>>> UploadFiles(List<IFormFile> files)
    {
        return ResultHelper(await _uploadedDocService.UploadFilesAsync(files));
    }
    //Inserts uploaded file record
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<UploadedDocDto>>> InsertUploadedDocAsync(UploadedDocDto uploadedDocDto)
    {
        return ResultHelper(await _uploadedDocService.InsertUploadedDocAsync(uploadedDocDto));
    }

    //Delete files
    [HttpDelete]
    public ActionResult<ServiceResponse<bool>> DeleteFile (string fileUrl)
    {
        return ResultHelper(_uploadedDocService.DeleteFileAsync(fileUrl));
    }

    //Download file
    [HttpGet]
    public ActionResult<ServiceResponse<FileDetailDto>> DownloadFile (string fileUrl)
    {
        return ResultHelper(_uploadedDocService.DownloadFileAsync(fileUrl));
    }
}