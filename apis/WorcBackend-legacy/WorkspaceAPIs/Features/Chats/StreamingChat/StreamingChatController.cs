using Microsoft.AspNetCore.Mvc;
using WorkspaceAPIs.Features.Chats.StreamingChat.DTOs;
using WorkspaceAPIs.Features.Chats.StreamingChat.Service;

namespace WorkspaceAPIs.Controllers;

[ApiController]
[Route("assist/chats/stream")]
[Authorize]
public class StreamingChatController : ControllerBase
{
    private readonly IStreamingChatService _streamingChatService;

    public StreamingChatController(IStreamingChatService streamingChatService)
    {
        _streamingChatService = streamingChatService;
    }

    /// <summary>
    /// Resolves the Chat AI node config for a Chat Agent flow version and returns
    /// a Server-Sent Events (SSE) stream from the llmpipeline /chat/completions
    /// endpoint. Supports both persisted (Assist) and temporary (Studio test) chats.
    /// </summary>
    [HttpPost("completions")]
    public async Task StreamCompletionAsync([FromBody] StreamingChatRequestDto request)
    {
        Response.Headers["Cache-Control"] = "no-cache";
        Response.Headers["X-Accel-Buffering"] = "no"; // disable nginx buffering
        Response.Headers["Content-Type"] = "text/event-stream";

        await foreach (var chunk in _streamingChatService.StreamChatCompletionAsync(request, HttpContext.RequestAborted))
        {
            await Response.WriteAsync(chunk, HttpContext.RequestAborted);
            await Response.Body.FlushAsync(HttpContext.RequestAborted);
        }
    }
}
