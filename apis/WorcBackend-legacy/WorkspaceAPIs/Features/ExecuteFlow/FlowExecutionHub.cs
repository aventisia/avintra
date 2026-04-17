namespace WorkspaceAPIs.Hubs;

/// <summary>
/// SignalR hub for real-time job execution notifications.
/// Allows clients to receive updates when job execution status changes.
/// </summary>
[Authorize]
public class FlowExecutionHub : Hub
{
    private readonly ILogger<FlowExecutionHub> _logger;

    public FlowExecutionHub(ILogger<FlowExecutionHub> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Called when a client connects to the hub.
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        var userId = Context?.User?.FindFirstValue("uid");
        var tenantId = Context?.User?.FindFirstValue("tntid");

        _logger.LogInformation(
            "User {UserId} from tenant {TenantId} connected to FlowExecutionHub with connection {ConnectionId}",
            userId, tenantId, Context.ConnectionId);

        // Add the client to their user-specific group for targeted notifications
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
        }

        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Called when a client disconnects from the hub.
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context?.User?.FindFirstValue("uid");

        _logger.LogInformation(
            "User {UserId} disconnected from FlowExecutionHub with connection {ConnectionId}",
            userId, Context.ConnectionId);

        await base.OnDisconnectedAsync(exception);
    }
}
