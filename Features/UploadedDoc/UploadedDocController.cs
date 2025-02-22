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
    [HttpPost("insert-file")]
    public async Task<ActionResult<ServiceResponse<IList<UploadedDocDto>>>> InsertUploadedDoc(IList<UploadedDocDto> uploadedDocList)
    {
        return ResultHelper(await _uploadedDocService.InsertUploadedDocAsync(uploadedDocList));
    }

    //Retrieves list of uploaded docs
    [HttpGet("list/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<UploadedDocDto>>>> GetUploadedDocs(Guid mlModelId)
    {
        return ResultHelper(await _uploadedDocService.GetUploadedDocsAsync(mlModelId));
    }

    //Delete files
    [HttpDelete]
    public ActionResult<ServiceResponse<bool>> DeleteFile (string fileUrl)
    {
        return ResultHelper(_uploadedDocService.DeleteFileAsync(fileUrl));
    }

    // Endpoint to download a file based on the file URL.
    [HttpGet]
    public IActionResult DownloadFile([FromQuery] string fileUrl)
    {
        if (string.IsNullOrEmpty(fileUrl))
        {
            return BadRequest("File URL is required.");
        }

        // Call the service to get file details
        var fileDetailsResponse = _uploadedDocService.DownloadFileAsync(fileUrl);

        if (fileDetailsResponse.Data == null)
        {
            return NotFound(fileDetailsResponse.Message);
        }

        var filePath = fileDetailsResponse.Data.Path;

        // Check if the file exists before serving
        if (System.IO.File.Exists(filePath))
        {
            // Determine MIME type based on the file extension
            var contentType = GetContentType(filePath);
            var fileBytes = System.IO.File.ReadAllBytes(filePath);

            // Return the file with the appropriate content type and file name
            return File(fileBytes, contentType, fileDetailsResponse.Data.Name);
        }

        return NotFound("File not found.");
    }

    // Get the content type based on the file extension
    private string GetContentType(string filePath)
    {
        var fileExtension = Path.GetExtension(filePath).ToLower();

        return fileExtension switch
        {
            ".pdf" => "application/pdf",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".txt" => "text/plain",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            _ => "application/octet-stream"
        };
    }

}