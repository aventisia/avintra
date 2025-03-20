namespace MLModelBuilderAPIs.Hubs;

public class ExtractHub: Hub
{
    private readonly static Dictionary<string, List<string>> _connections = new Dictionary<string, List<string>>();

    public override Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier; // Get user identifier (e.g., user ID or username)

        if (!_connections.ContainsKey(userId))
            _connections[userId] = new List<string>();
       
        _connections[userId].Add(Context.ConnectionId); // Track the connection ID for this user
        
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? ex)
    {
        var userId = Context.UserIdentifier;

        if (_connections.ContainsKey(userId))
        {
            _connections[userId].Remove(Context.ConnectionId); // Remove the connection ID

            if (_connections[userId].Count == 0)
                _connections.Remove(userId); // Optionally remove the user if no active connections exist
        }

        return base.OnDisconnectedAsync(ex);
    }

    public async Task<FileExtractedData> SendExtractedData(FileExtractedData fileExtractedData)
    {
        try
        {
            var user = Context.UserIdentifier;
            await Clients.User(user).SendAsync("GetExtractedData", fileExtractedData);
            return fileExtractedData; 
        }
        catch (Exception ex)
        {
            throw new Exception("Error sending extracted data", ex);
        }
    }
}
