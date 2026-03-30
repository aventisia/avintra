namespace WorkspaceAPIs.Hubs;

/// <summary>
/// Handles AI chat connections and LLM execution.
/// </summary>
public class AgentBuilderHub : Hub
{
    private readonly IAgentBuilderStore _chatStore;
    private readonly ILogger<AgentBuilderHub> _logger;

    public AgentBuilderHub(IAgentBuilderStore chatStore, ILogger<AgentBuilderHub> logger)
    {
        _chatStore = chatStore;
        _logger = logger;
    }

    // When user connects → store session.
    public override async Task OnConnectedAsync()
    {

        var userId = Guid.Parse(Context?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        var tenantId = Guid.Parse(Context?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());


        Console.WriteLine("tenantId", tenantId);
        var user = new AgentBuilderModel
        {
            UserId = userId,
            TenantId = tenantId,
            ConnectionId = Context.ConnectionId,
            LastSeen = DateTimeOffset.UtcNow
        };

        await _chatStore.AddOrUpdateAsync(user);
        await base.OnConnectedAsync();
    }

    // When user disconnects → remove session.
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await _chatStore.RemoveByConnectionIdAsync(Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }



    public async Task ExecuteAgent(dynamic request)
    {
        try
        {
            // TODO: Add implementarion when needed
            await Clients.Caller.SendAsync("stream_complete", new { });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gemini streaming failed");

            await Clients.Caller.SendAsync("error", new
            {
                message = ex.Message
            });
        }
    }
}