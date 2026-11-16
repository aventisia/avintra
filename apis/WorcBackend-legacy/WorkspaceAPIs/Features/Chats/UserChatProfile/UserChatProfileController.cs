using WorkspaceAPIs.Features.Chats.UserChatProfile.DTOs;

namespace WorkspaceAPIs.Controllers;

[Authorize]
[ApiController]
[Route("assist/chat-profile")]
public class UserChatProfileController : BaseApiController
{
    private readonly IUserChatProfileService _userChatProfileService;

    public UserChatProfileController(IUserChatProfileService userChatProfileService)
    {
        _userChatProfileService = userChatProfileService;
    }

    /// <summary>
    /// Retrieves the signed-in user's custom instructions and memory notes.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<UserChatProfileDto>>> GetUserChatProfile()
    {
        return ResultHelper(await _userChatProfileService.GetUserChatProfileAsync());
    }

    /// <summary>
    /// Saves the signed-in user's custom instructions and memory notes.
    /// </summary>
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<UserChatProfileDto>>> UpdateUserChatProfile([FromBody] UpdateUserChatProfileDto updateUserChatProfileDto)
    {
        return ResultHelper(await _userChatProfileService.UpdateUserChatProfileAsync(updateUserChatProfileDto));
    }
}
