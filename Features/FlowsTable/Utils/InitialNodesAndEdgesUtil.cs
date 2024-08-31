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
            // Create ids of trigger and plus node
            var triggerNodeId = Guid.NewGuid();
            var plusNodeId = Guid.NewGuid();

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
                        Label = "Manual trigger",
                        Description = "Start your flow clicking the execute button",
                        Icon = "ManualTriggerIcon",
                    },
                    Position = new { X = 0, Y = 0 },
                    SourcePosition = "bottom",
                    Deletable = false,
                    DragHandle = ".custom-drag-handle",
                },
                
                // Plus node without source position
                new
                {
                    Id = plusNodeId,
                    Type = "plusFirstNode",
                    Position = new { X = 0, Y = 150 },
                    Deletable = false,
                    Draggable = true,
                },
            };

            // Create initial edges list object
            var initialEdgesList = new List<object>
            {
                new
                {
                    Id = Guid.NewGuid(),
                    Type = "customStepEdge",
                    Source = triggerNodeId,
                    Target = plusNodeId,
                    Deletable = false,
                    Selectable = false,
                    Style = new {
                        StrokeDasharray= "5,5",
                        StrokeWidth= 1.5
                    }
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