using WorkspaceAPIs.Features.FlowAssistant.DTOs;

namespace WorkspaceAPIs.Features.FlowAssistant.Service;

/// <summary>
/// Streams AI-generated graph proposals for Agent flows.
/// </summary>
public interface IFlowAssistantService
{
    /// <summary>
    /// Streams normalized flow-assistant frames for an Agent flow.
    /// </summary>
    IAsyncEnumerable<string> StreamFlowAssistantAsync(
        FlowAssistantRequestDto request,
        CancellationToken cancellationToken);
}
