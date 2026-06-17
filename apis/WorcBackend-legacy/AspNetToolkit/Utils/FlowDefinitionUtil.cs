namespace AspNetToolkit.Utils;

/// <summary>
/// Provides helper methods for working with flow definition JSON.
/// </summary>
public static class FlowDefinitionUtil
{
    // Extracts the default actions from a flow definition JSON string.
    public static List<string> GetDefaultActions(string? json)
    {
        // Return an empty list for null, empty, or whitespace input.
        if (string.IsNullOrWhiteSpace(json))
        {
            return [];
        }

        try
        {
            // Parse the JSON document.
            using var document = JsonDocument.Parse(json);

            // Attempt to retrieve the defaultActions property.
            // Return an empty list if the property does not exist or is not a JSON array.
            if (!document.RootElement.TryGetProperty("defaultActions", out var defaultActions) ||
                defaultActions.ValueKind != JsonValueKind.Array)
            {
                return [];
            }

            // Preallocate the list capacity based on the array size.
            var actions = new List<string>(defaultActions.GetArrayLength());

            // Add non-empty action values to the result.
            foreach (var item in defaultActions.EnumerateArray())
            {
                var value = item.GetString();

                if (!string.IsNullOrWhiteSpace(value))
                {
                    actions.Add(value);
                }
            }

            return actions;
        }
        catch (System.Text.Json.JsonException)
        {
            // Invalid JSON.
            return [];
        }
    }
}