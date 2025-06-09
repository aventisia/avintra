namespace MLModelBuilderAPIs.Hubs;

/// <summary>
/// SignalR hub for managing real-time client connections and tracking user sessions.
/// </summary>
public class ChatHub : Hub
{
    // Stores the mapping between SignalR connection IDs and user IDs (as strings)
    private static readonly Dictionary<string, string> ConnectionUserMap = new();

    // Called when a client successfully connects to the SignalR hub.
    public override async Task OnConnectedAsync()
    {
        // Attempt to retrieve the user ID from the authenticated user's claims
        string? userId = Context.User?.FindFirstValue("uid");

        // Check that the user ID is valid and non-empty
        if (!string.IsNullOrWhiteSpace(userId) && Guid.TryParse(userId, out Guid parsedUserId) && parsedUserId != Guid.Empty)
        {
            // Map the current connection ID to the user ID
            ConnectionUserMap[Context.ConnectionId] = userId;

            // Log the connection to the server console
            Console.WriteLine($"Client connected: ConnectionId = {Context.ConnectionId}, UserId = {userId}");
        }

        await base.OnConnectedAsync();
    }

    // Called when a client disconnects from the SignalR hub.
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Remove the user's mapping from the dictionary upon disconnection
        if (ConnectionUserMap.TryGetValue(Context.ConnectionId, out var userId))
        {
            ConnectionUserMap.Remove(Context.ConnectionId);

            // Log the disconnection to the server console
            Console.WriteLine($"Client disconnected: ConnectionId = {Context.ConnectionId}, UserId = {userId}");
        }

        await base.OnDisconnectedAsync(exception);
    }
}