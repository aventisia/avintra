namespace MLModelBuilderAPIs.Controllers
{
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
        public ActionResult<ServiceResponse<bool>> DeleteFile(string fileUrl)
        {
            return ResultHelper(_versionResourceService.DeleteFileAsync(fileUrl));
        }

        // Downloads a file by its URL.
        [HttpGet]
        public IActionResult DownloadFile([FromQuery] string fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl))
            {
                return BadRequest("File URL is required.");
            }

            var fileDetailsResponse = _versionResourceService.DownloadFileAsync(fileUrl);

            if (fileDetailsResponse.Data == null)
            {
                return NotFound(fileDetailsResponse.Message);
            }

            var filePath = fileDetailsResponse.Data.Path;

            if (System.IO.File.Exists(filePath))
            {
                var contentType = GetContentType(filePath);
                var fileBytes = System.IO.File.ReadAllBytes(filePath);

                return File(fileBytes, contentType, fileDetailsResponse.Data.Name);
            }

            return NotFound("File not found.");
        }

        // Determines the MIME content type of a file based on its extension.
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
}
