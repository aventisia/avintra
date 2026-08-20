namespace ExecutorLibrary.Helpers;

/// <summary>
/// Provides helper methods for working with React Flow object in the context of flow execution, 
/// such as parsing the React Flow JSON string into a ReactFlowDataModel object.
/// </summary>
public static class ReactFlowHelper
{
    /// <summary>
    /// Parses a JSON string representing a React Flow object into a ReactFlowDataModel.
    /// </summary>
    /// <param name="reactFlowObject">The JSON string representing the React Flow object.</param>
    /// <returns>A ReactFlowDataModel object if parsing is successful; otherwise, null if the input is invalid or empty.</returns>
    public static ReactFlowDataModel? Parse(string? reactFlowObject)
    {
        // Set json serialization options
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        };
        jsonOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase, allowIntegerValues: false));

        // reactFlowObject is null or whitespace
        if (string.IsNullOrWhiteSpace(reactFlowObject)) return null;

        // Try to deserialize the reactFlowObject
        try
        {
            return System.Text.Json.JsonSerializer.Deserialize<ReactFlowDataModel>(reactFlowObject, jsonOptions);
        }
        catch (System.Text.Json.JsonException ex)
        {
            throw new InvalidOperationException(
                $"Failed to parse ReactFlow object: {ex.Message}", ex);
        }
    }
}