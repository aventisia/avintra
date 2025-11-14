namespace MLModelBuilderAPIs.Hubs;

/// <summary>
/// SignalR hub for managing real-time client connections and tracking user sessions.
/// </summary>
public class ChatHub : Hub
{
    private readonly ILLMDataExtractionService _llmDataExtractionService;

    public ChatHub(ILLMDataExtractionService llmDataExtractionService)
    {
        _llmDataExtractionService = llmDataExtractionService;
    }    // Stores the mapping between SignalR connection IDs and user IDs (as strings)
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

    // Sends a message to the current (calling) client and then triggers bot response.
    public async Task SendMessageAsync(string message)
    {
        // Retrieve user ID from claims
        var userId = Context.User?.FindFirstValue("uid");

        // Send the message back to the caller if user ID is valid
        if (!string.IsNullOrWhiteSpace(userId))
        {
            await Clients.Caller.SendAsync("ReceiveMessage", "User", message);
        }

        // Call helper method to get the chatbot response
        await GetResponseAsync(userId, message);
    }

    // Finds the connection associated with the user ID and sends a bot response.
    private async Task GetResponseAsync(string? userId, string message)
    {
        // Find the connection associated with the user ID
        var receiverConnection = ConnectionUserMap
            .FirstOrDefault(kvp => kvp.Value == userId);

        // Check if the connection is valid
        if (!string.IsNullOrWhiteSpace(receiverConnection.Key))
        {
            // Custom Q&A prompt
            // Clear, instruction-based prompt for Q&A
            var prompt = $"You are a helpful assistant. Answer the question clearly and concisely. Do not include greetings or explanations. Just provide the answer: {message}";

            // TODO: Update with the actual model name and temperature later
            var llmModel = "gemma";
            var modelTemperature = 0.7;

            // Send the full prompt to the LLM for response
            // TODO: Remove this code or pass the correct parameters
            var response = await _llmDataExtractionService.ExtractDataAsync(
                                    prompt,
                                    llmModel,
                                    modelTemperature,
                                    UsageSourceTypesEnum.AIModel,
                                    Guid.Empty,
                                    "ChatBot",
                                    ActionTypesEnum.AIModelExecution,
                                    null, // Not triggered by an agent
                                    null // No specific ollama output schema
                                    // isJsonOutput is by default true
                                    );

            // Return the response to the client
            await Clients.Client(receiverConnection.Key)
                .SendAsync("ReceiveMessage", "ChatBot", response.Data);
        }
    }


    /// <summary>
    /// Sends a message from the caller to a specific user (if connected).
    /// </summary>
    public async Task SendMessageToUser(string receiverUserId, string message)
    {
        var senderUserId = Context.User?.FindFirstValue("uid");

        if (!string.IsNullOrWhiteSpace(senderUserId) && !string.IsNullOrWhiteSpace(receiverUserId))
        {
            // Get the first connection ID associated with the receiver user ID
            var receiverConnection = ConnectionUserMap
                .FirstOrDefault(kvp => kvp.Value == receiverUserId);

            // Check if a valid connection exists
            if (!string.IsNullOrWhiteSpace(receiverConnection.Key))
            {
                await Clients.Client(receiverConnection.Key).SendAsync("ReceiveMessage", senderUserId, receiverUserId, message);
            }

            // Optionally send confirmation back to sender
            await Clients.Caller.SendAsync("MessageSent", receiverUserId, message);
        }
    }
}