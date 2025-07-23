namespace MLModelBuilderAPIs.Controllers;

[Route("ml-model-version")]
[ApiController]
[Authorize]
public class MLModelVersionController : BaseApiController
{
    private readonly IMLModelVersionService _mlModelVersionService;

    public MLModelVersionController(IMLModelVersionService mlModelVersionService)
    {
        _mlModelVersionService = mlModelVersionService;
    }

    // Get all versions of a specific ML model
    [HttpGet("list/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<MLModelVersionDto>>>> GetMLModelVersionsByModelId(Guid mlModelId)
    {
        return ResultHelper(await _mlModelVersionService.GetModelVersionsByModelIdAsync(mlModelId));
    }

    // Get a specific version of the ML model by ID
    [HttpGet("{mlModelVersionId}")]
    public async Task<ActionResult<ServiceResponse<MLModelVersionDto>>> GetMLModelVersionById(Guid mlModelVersionId)
    {
        return ResultHelper(await _mlModelVersionService.GetModelVersionByIdAsync(mlModelVersionId));
    }

    // Inserts a new ML model version
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<MLModelVersionDto>>> InsertMLModelVersion([FromBody] MLModelVersionDto mlModelVersionDto)
    {
        return ResultHelper(await _mlModelVersionService.CreateModelVersionAsync(mlModelVersionDto));
    }

    // Update a specific ML model version
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<MLModelVersionDto>>> UpdateMLModelVersion([FromBody] MLModelVersionDto mlModelVersionDto)
    {
        return ResultHelper(await _mlModelVersionService.UpdateModelVersionAsync(mlModelVersionDto));
    }

    // Deletes a ML model version permanently
    [HttpDelete("{mlModelVersionId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMLModelVersion(Guid mlModelVersionId)
    {
        return ResultHelper(await _mlModelVersionService.DeleteModelVersionAsync(mlModelVersionId));
    }

    // Bulk delete ML model versions
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleMLModelVersions([FromBody] IEnumerable<Guid> mlModelVersionIds)
    {
        return ResultHelper(await _mlModelVersionService.DeleteMultipleModelVersionsAsync(mlModelVersionIds));
    }

    // Publishes a ML model version
    [HttpPost("publish")]
    public async Task<ActionResult<ServiceResponse<bool>>> PublishMLModelVersion(PublishMLModelVersionDto publishMLModelVersionDto)
    {
        return ResultHelper(await _mlModelVersionService.PublishMLModelVersionAsync(publishMLModelVersionDto));
    }
}
