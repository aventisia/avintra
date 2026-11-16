namespace WorkspaceAPIs.Controllers;

[Authorize]
[ApiController]
[Route("assist/chat-artifacts")]
public class ChatArtifactsController : BaseApiController
{
    private readonly IChatArtifactsService _chatArtifactsService;

    public ChatArtifactsController(IChatArtifactsService chatArtifactsService)
    {
        _chatArtifactsService = chatArtifactsService;
    }

    /// <summary>
    /// Retrieves list of chat artifacts.
    /// </summary>
    [HttpGet("list/{conversationId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ChatArtifactDto>>>> GetChatArtifacts(Guid conversationId)
    {
        return ResultHelper(await _chatArtifactsService.GetChatArtifactsAsync(conversationId));
    }

    /// <summary>
    /// Retrieves list of all chat artifacts.
    /// </summary>
    [HttpGet("list-all")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ChatArtifactDto>>>> GetAllChatArtifacts()
    {
        return ResultHelper(await _chatArtifactsService.GetAllChatArtifactsAsync());
    }

    /// <summary>
    /// Retrieves a chat artifact by its ID.
    /// </summary>
    [HttpGet("{chatArtifactId}")]
    public async Task<ActionResult<ServiceResponse<ChatArtifactDto>>> GetChatArtifact(Guid chatArtifactId)
    {
        return ResultHelper(await _chatArtifactsService.GetChatArtifactAsync(chatArtifactId));
    }

    /// <summary>
    /// Inserts a new chat artifact.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<ChatArtifactDto>>> InsertChatArtifact([FromBody] InsertChatArtifactDto insertChatArtifactDto)
    {
        return ResultHelper(await _chatArtifactsService.InsertChatArtifactAsync(insertChatArtifactDto));
    }

    /// <summary>
    /// Builds a binary office file from a spec block and stores it as a generated artifact.
    /// </summary>
    [HttpPost("generate-from-spec")]
    public async Task<ActionResult<ServiceResponse<ChatArtifactDto>>> GenerateFromSpec([FromBody] GenerateFromSpecDto generateFromSpecDto)
    {
        return ResultHelper(await _chatArtifactsService.GenerateFromSpecAsync(generateFromSpecDto));
    }

    /// <summary>
    /// Deletes an existing chat artifact.
    /// </summary>
    [HttpDelete("{chatArtifactId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteChatArtifact(Guid chatArtifactId)
    {
        return ResultHelper(await _chatArtifactsService.DeleteChatArtifactAsync(chatArtifactId));
    }

    /// <summary>
    /// Shares a chat artifact by issuing a read-only token (idempotent).
    /// </summary>
    [HttpPost("{chatArtifactId}/share")]
    public async Task<ActionResult<ServiceResponse<string>>> ShareChatArtifact(Guid chatArtifactId)
    {
        return ResultHelper(await _chatArtifactsService.ShareChatArtifactAsync(chatArtifactId));
    }

    /// <summary>
    /// Stops sharing a chat artifact by clearing its read-only token.
    /// </summary>
    [HttpPost("{chatArtifactId}/unshare")]
    public async Task<ActionResult<ServiceResponse<bool>>> UnshareChatArtifact(Guid chatArtifactId)
    {
        return ResultHelper(await _chatArtifactsService.UnshareChatArtifactAsync(chatArtifactId));
    }

    /// <summary>
    /// Retrieves a shared chat artifact by its read-only token.
    /// </summary>
    [HttpGet("shared/{shareToken}")]
    public async Task<ActionResult<ServiceResponse<ChatArtifactDto>>> GetSharedChatArtifact(string shareToken)
    {
        return ResultHelper(await _chatArtifactsService.GetSharedChatArtifactAsync(shareToken));
    }

    /// <summary>
    /// Deletes multiple chat artifacts by their IDs.
    /// </summary>
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<int>>> DeleteMultipleChatArtifacts([FromBody] IEnumerable<Guid> chatArtifactIds)
    {
        return ResultHelper(await _chatArtifactsService.DeleteMultipleChatArtifactsAsync(chatArtifactIds));
    }
}
