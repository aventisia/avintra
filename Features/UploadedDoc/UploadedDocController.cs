namespace MLModelBuilderAPIs.Controllers;

[Route("upload-doc")]
[ApiController]
[Authorize]
public class UploadedDocController : BaseApiController
{
    private readonly IUploadedDocService _uploadedDocService;

    public UploadedDocController(IUploadedDocService uploadedDocService)
    {
        _uploadedDocService = uploadedDocService;
    }

    //Upload files
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<FileDetailDto>>> UploadFiles(List<IFormFile> files, DocumentPurposeTypesEnum purpose= DocumentPurposeTypesEnum.Default)
    {
        return ResultHelper(await _uploadedDocService.UploadFilesAsync(files, purpose));
    }
    //Inserts uploaded file record
    [HttpPost("insert-file")]
    public async Task<ActionResult<ServiceResponse<IList<UploadedDocDto>>>> InsertUploadedDoc(IList<UploadedDocDto> uploadedDocList)
    {
        return ResultHelper(await _uploadedDocService.InsertUploadedDocAsync(uploadedDocList));
    }

    // Uploads data files
    [HttpPost("upload-files")]
    public async Task<ActionResult<ServiceResponse<IList<UploadedDocDto>>>> UploadDataFilesAsync([FromForm] UploadDataDto uploadDataDto)
    {
        return ResultHelper(await _uploadedDocService.UploadDataFilesAsync(uploadDataDto));
    }

    //Retrieves list of uploaded docs
    [HttpGet("list/{mlModelId}/{type}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<UploadedDocDto>>>> GetUploadedDocs(Guid mlModelId, ExtractedDataType type)
    {
        return ResultHelper(await _uploadedDocService.GetUploadedDocsAsync(mlModelId, type));
    }

    //Delete files
    [HttpDelete]
    public ActionResult<ServiceResponse<bool>> DeleteFile(string fileUrl)
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
            // Document types
            ".pdf" => "application/pdf",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".txt" => "text/plain",

            // Image types
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",

            // Audio types
            ".mp3" => "audio/mpeg",
            ".wav" => "audio/wav",
            ".aac" => "audio/aac",
            ".ogg" => "audio/ogg",
            ".oga" => "audio/ogg",
            ".flac" => "audio/flac",
            ".m4a" => "audio/m4a",
            ".opus" => "audio/opus",

            // Default
            _ => "application/octet-stream"
        };
    }

    //Delete uploaded document
    [HttpDelete("{documentId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteUploadedDocAsync(Guid documentId)
    {
        return ResultHelper(await _uploadedDocService.DeleteUploadedDocAsync(documentId));
    }
}