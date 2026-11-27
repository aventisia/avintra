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
    /// Updates an existing chat project.
    /// </summary>
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<ChatProjectDto>>> UpdateChatProject([FromBody] UpdateChatProjectDto updateChatProjectDto)
    {
        return ResultHelper(await _chatProjectService.UpdateChatProjectAsync(updateChatProjectDto));
    }

    /// <summary>
    /// Deletes a chat project; its chats stay in the history, ungrouped.
    /// </summary>
    [HttpDelete("{chatProjectId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteChatProject(Guid chatProjectId)
    {
        return ResultHelper(await _chatProjectService.DeleteChatProjectAsync(chatProjectId));
    }

    /// <summary>
    /// Retrieves list of chat project files.
    /// </summary>
    [HttpGet("{chatProjectId}/files")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ChatProjectFileDto>>>> GetChatProjectFiles(Guid chatProjectId)
    {
        return ResultHelper(await _chatProjectService.GetChatProjectFilesAsync(chatProjectId));
    }

    /// <summary>
    /// Inserts a new chat project file.
    /// </summary>
    [HttpPost("{chatProjectId}/files")]
    public async Task<ActionResult<ServiceResponse<ChatProjectFileDto>>> InsertChatProjectFile(Guid chatProjectId, [FromBody] InsertChatProjectFileDto insertChatProjectFileDto)
    {
        return ResultHelper(await _chatProjectService.InsertChatProjectFileAsync(chatProjectId, insertChatProjectFileDto));
    }

    /// <summary>
    /// Deletes an existing chat project file.
    /// </summary>
    [HttpDelete("{chatProjectId}/files/{fileId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteChatProjectFile(Guid chatProjectId, Guid fileId)
    {
        return ResultHelper(await _chatProjectService.DeleteChatProjectFileAsync(chatProjectId, fileId));
    }
}
