namespace WorkspaceAPIs.Controllers;

/// <summary>
/// Controller for managing Knowledge Base file metadata operations.
/// </summary>
[Route("knowledge-base")]
[ApiController]
[Authorize(Roles = "SA,TA,OM")]
public class KnowledgeBaseFileController : BaseApiController
{
    private readonly IKnowledgeBaseFileService _knowledgeBaseFileService;

    public KnowledgeBaseFileController(IKnowledgeBaseFileService knowledgeBaseFileService)
    {
        _knowledgeBaseFileService = knowledgeBaseFileService;
    }

    // Retrieves all files for a specific knowledge base.
    [HttpGet("{kbId}/files")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<KnowledgeBaseFileDto>>>> GetKnowledgeBaseFiles(Guid kbId)
    {
        return ResultHelper(await _knowledgeBaseFileService.GetKnowledgeBaseFilesAsync(kbId));
    }

    // Registers an uploaded file metadata against a specific knowledge base.
    [HttpPost("{kbId}/files/register")]
    public async Task<ActionResult<ServiceResponse<KnowledgeBaseFileDto>>> RegisterKnowledgeBaseFile(Guid kbId, [FromBody] KBRegisterFileDto dto)
    {
        return ResultHelper(await _knowledgeBaseFileService.RegisterKnowledgeBaseFileAsync(kbId, dto));
    }

    // Registers a raw-text metadata source against a specific knowledge base.
    [HttpPost("{kbId}/files/register-text")]
    public async Task<ActionResult<ServiceResponse<KnowledgeBaseFileDto>>> RegisterKnowledgeBaseText(Guid kbId, [FromBody] KBRegisterTextDto dto)
    {
        return ResultHelper(await _knowledgeBaseFileService.RegisterKnowledgeBaseTextAsync(kbId, dto));
    }

    // Deletes a specific file metadata record from a knowledge base.
    [HttpDelete("{kbId}/files/{fileId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteKnowledgeBaseFile(Guid kbId, Guid fileId)
    {
        return ResultHelper(await _knowledgeBaseFileService.DeleteKnowledgeBaseFileAsync(kbId, fileId));
    }
}
