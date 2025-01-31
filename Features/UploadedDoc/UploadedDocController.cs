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
}