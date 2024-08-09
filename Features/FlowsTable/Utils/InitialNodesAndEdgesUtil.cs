namespace WorkspaceAPIs.Features.FlowsTable.Utils;

public static class InitialNodesAndEdgesUtil
{
    /// <summary>
    /// Retrieves the initial nodes for the flow.
    /// </summary>
    /// <returns>A serialized JSON string representing the initial nodes.</returns>
    public static (string, string) GetInitialNodesAndEdges()
    {
        string initialNodes = "[]";
        string initialEdges = "[]";

        try
        {
            // Create ids of trigger and placeholder node
            var triggerNodeId = Guid.NewGuid();
            var placeholderNodeId = Guid.NewGuid();

            // Create initial node list object
            var initialNodesList = new List<object>
            {
                // Manual trigger node
                new
                {
                    Id = triggerNodeId,
                    Type = "triggerNode",
                    Data = new
                    {
                        Type = "triggerNode",
                        Category = "Triggers",
                        Name = "manualTrigger",
                        Label = "Manual Trigger",
                        Description = "To trigger the flow, a starting point",
                        Icon = "/sample-slack-new-logo.svg",
                    },
                    Position = new { X = 0, Y = 0 },
                    Deletable = false,
                },
                // Placeholder node
                new
                {
                    Id = placeholderNodeId,
                    Type = "placeholderNode",
                    Position = new { X = 0, Y = 150 },
                    Deletable = false,
                    Draggable = false,
                },
            };

            // Create initial edges list object
            var initialEdgesList = new List<object>
            {
                new
                {
                    Id = Guid.NewGuid(),
                    Type = "placeholderEdge",
                    Source = triggerNodeId,
                    Target = placeholderNodeId,
                    Deletable = false,
                    Selectable = false,
                },
            };

            // Options for camel case
            var camelCaseOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            // Serialized initial node and edges list
            initialNodes = JsonSerializer.Serialize(initialNodesList, camelCaseOptions);
            initialEdges = JsonSerializer.Serialize(initialEdgesList, camelCaseOptions);

            // Return serialized nodes and edges
            return (initialNodes, initialEdges);
        }
        catch
        {
            // Return initial nodes and edges
            return (initialNodes, initialEdges);
        }
    }
}