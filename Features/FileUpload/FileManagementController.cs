namespace WorkspaceAPIs.Controllers;

[Route("api/file")]
[ApiController]
[Authorize]
public class UploadedDocController : BaseApiController
{
    private readonly IUploadFileService _uploadFileService;

    public UploadedDocController(IUploadFileService uploadFileService)
    {
        _uploadFileService = uploadFileService;
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
    public ActionResult<ServiceResponse<bool>> DeleteFile(string fileUrl)
    {
        return ResultHelper(_uploadFileService.DeleteFileAsync(fileUrl));
    }

    // Endpoint to download a file based on the file URL.
    [HttpGet("download")]
    public IActionResult DownloadFile([FromQuery] string fileUrl)
    {
        if (string.IsNullOrEmpty(fileUrl))
        {
            return BadRequest("File URL is required.");
        }

        // Call the service to get file details
        var fileDetailsResponse = _uploadFileService.DownloadFileAsync(fileUrl);

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
}