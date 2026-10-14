namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Provides the shared JSON options used to read and write <see cref="TimeTriggerModel"/> metadata.
/// </summary>
public static class TimeTriggerMetadataHelpers
{
    /// <summary>
    /// Gets the serializer options shared by every time-trigger metadata reader and writer.
    /// </summary>
    public static JsonSerializerOptions JsonOptions { get; } = CreateJsonOptions();

    private static JsonSerializerOptions CreateJsonOptions()
    {
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        options.Converters.Add(new JsonStringEnumConverter());
        return options;
    }
}
