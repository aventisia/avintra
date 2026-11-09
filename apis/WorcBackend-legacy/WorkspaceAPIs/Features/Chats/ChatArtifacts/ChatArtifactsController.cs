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
    /// Deletes an existing chat artifact.
    /// </summary>
    [HttpDelete("{chatArtifactId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteChatArtifact(Guid chatArtifactId)
    {
        return ResultHelper(await _chatArtifactsService.DeleteChatArtifactAsync(chatArtifactId));
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
