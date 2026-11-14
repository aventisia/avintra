using WorkspaceAPIs.Features.VoiceSessions.DTOs;
using WorkspaceAPIs.Features.VoiceSessions.Service;

namespace WorkspaceAPIs.Controllers;

[Route("assist/voice")]
[ApiController]
[Authorize]
public class VoiceSessionsController : BaseApiController
{
    private readonly IVoiceAgentSettingsResolver _settingsResolver;
    private readonly IVoiceSessionService _voiceSessionService;

    public VoiceSessionsController(
        IVoiceAgentSettingsResolver settingsResolver,
        IVoiceSessionService voiceSessionService)
    {
        _settingsResolver = settingsResolver;
        _voiceSessionService = voiceSessionService;
    }

    /// <summary>
    /// Retrieves safe, resolved settings for a VoiceAgent test or live session.
    /// </summary>
    [HttpGet("settings/{flowVersionId:guid}")]
    public async Task<ActionResult<ServiceResponse<VoiceAgentSettingsDto>>> GetSettings(
        Guid flowVersionId,
        [FromQuery] string mode = "live")
    {
        if (!Enum.TryParse<VoiceAgentSettingsMode>(mode, true, out var settingsMode))
            return PlainTextError(422, "Voice agent settings mode must be 'test' or 'live'.");

        var resolution = await _settingsResolver.ResolveAsync(flowVersionId, settingsMode, HttpContext.RequestAborted);
        if (resolution.Status != VoiceAgentSettingsResolutionStatus.Success || resolution.Settings is null)
        {
            return PlainTextError(
                resolution.ToHttpStatusCode(),
                resolution.Message);
        }

        return ResultHelper(ServiceResponse<VoiceAgentSettingsDto>.Create(
            "Voice agent settings resolved.",
            200,
            resolution.Settings));
    }

    /// <summary>
    /// Creates one caller-bound LiveKit session for a VoiceAgent.
    /// </summary>
    [HttpPost("sessions")]
    public async Task<ActionResult<ServiceResponse<VoiceSessionDto>>> CreateSession(
        [FromBody] VoiceSessionRequestDto voiceSessionRequestDto)
    {
        return ResultHelper(await _voiceSessionService.CreateSessionAsync(
            voiceSessionRequestDto,
            HttpContext.RequestAborted));
    }
}
