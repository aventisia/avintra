using WorkspaceAPIs.Features.Chats.ChatProjects.DTOs;

namespace WorkspaceAPIs.Controllers;

[Authorize]
[ApiController]
[Route("assist/chat-projects")]
public class ChatProjectController : BaseApiController
{
    private readonly IChatProjectService _chatProjectService;

    public ChatProjectController(IChatProjectService chatProjectService)
    {
        _chatProjectService = chatProjectService;
    }

    /// <summary>
    /// Lists the signed-in user's chat projects.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ChatProjectDto>>>> GetChatProjects()
    {
        return ResultHelper(await _chatProjectService.GetChatProjectsAsync());
    }

    /// <summary>
    /// Creates a chat project.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<ChatProjectDto>>> InsertChatProject([FromBody] InsertChatProjectDto insertChatProjectDto)
    {
        return ResultHelper(await _chatProjectService.InsertChatProjectAsync(insertChatProjectDto));
    }

    /// <summary>
    /// Deletes a chat project; its chats stay in the history, ungrouped.
    /// </summary>
    [HttpDelete("{chatProjectId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteChatProject(Guid chatProjectId)
    {
        return ResultHelper(await _chatProjectService.DeleteChatProjectAsync(chatProjectId));
    }
}
