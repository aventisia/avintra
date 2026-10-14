using WorkspaceAPIs.Features.FlowAssistant.DTOs;
using WorkspaceAPIs.Features.FlowAssistant.Service;

using JsonSerializer = System.Text.Json.JsonSerializer;

namespace WorkspaceAPIs.Controllers;

/// <summary>
/// Streams AI-generated graph proposals for Agent flows.
/// </summary>
[ApiController]
[Route("assist/flows/stream")]
[Authorize]
public class FlowAssistantController : ControllerBase
{
    private readonly IFlowAssistantService _flowAssistantService;

    public FlowAssistantController(IFlowAssistantService flowAssistantService)
    {
        _flowAssistantService = flowAssistantService;
    }

    /// <summary>
    /// Streams normalized flow-assistant frames for an Agent flow.
    /// </summary>
    [HttpPost]
    public async Task StreamFlowAssistant([FromBody] FlowAssistantRequestDto request)
    {
        Response.Headers["Cache-Control"] = "no-cache";
        Response.Headers["X-Accel-Buffering"] = "no";
        Response.Headers["Content-Type"] = "text/event-stream";

        try
        {
            await foreach (var frame in _flowAssistantService.StreamFlowAssistantAsync(request, HttpContext.RequestAborted))
            {
                await Response.WriteAsync(frame, HttpContext.RequestAborted);
                await Response.Body.FlushAsync(HttpContext.RequestAborted);
            }
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception)
        {
            await TryWriteErrorAsync("The assistant could not complete the request. Please try again.");
        }
    }

    private async Task TryWriteErrorAsync(string message)
    {
        try
        {
            await Response.WriteAsync(
                $"data: {JsonSerializer.Serialize(new { type = "error", message })}\n\n",
                HttpContext.RequestAborted);
            await Response.Body.FlushAsync(HttpContext.RequestAborted);
        }
        catch (Exception)
        {
        }
    }
}
