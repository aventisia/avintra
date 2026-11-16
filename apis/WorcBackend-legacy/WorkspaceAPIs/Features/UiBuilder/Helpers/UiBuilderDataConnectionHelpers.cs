namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Validation and normalization for data connections bound to custom UI builder projects.
/// </summary>
public static class UiBuilderDataConnectionHelpers
{
    /// <summary>
    /// Connection type for a queue-backed data connection.
    /// </summary>
    public const string QueueType = "queue";

    /// <summary>
    /// Operation that lists work items.
    /// </summary>
    public const string ListOperation = "list";

    /// <summary>
    /// Operation that retrieves one work item.
    /// </summary>
    public const string GetOperation = "get";

    /// <summary>
    /// Operation that adds a work item.
    /// </summary>
    public const string AddOperation = "add";

    /// <summary>
    /// Operation that updates a work item.
    /// </summary>
    public const string UpdateOperation = "update";

    /// <summary>
    /// Maximum number of data connections per project.
    /// </summary>
    public const int MaxConnections = 10;

    /// <summary>
    /// Default number of work items returned by a list request.
    /// </summary>
    public const int DefaultListTop = 50;

    /// <summary>
    /// Maximum number of work items returned by a list request.
    /// </summary>
    public const int MaxListTop = 200;

    private static readonly Regex KeyPattern = new("^[A-Za-z][A-Za-z0-9_]{0,63}$", RegexOptions.Compiled);
    private static readonly string[] SupportedOperations = [ListOperation, GetOperation, AddOperation, UpdateOperation];
    private static readonly string[] SupportedFetchModes = ["auto", "manual"];

    /// <summary>
    /// Returns the lowercase environment name used by the X-Env-Type header ("dev" or "prod").
    /// </summary>
    public static string ToEnvTypeName(ConfigureEnvironmentType envType)
    {
        return envType.ToString().ToLowerInvariant();
    }

    /// <summary>
    /// Normalizes the connections and returns the first validation error, or null when all connections are valid.
    /// </summary>
    public static string? NormalizeDataConnections(List<UiBuilderDataConnectionDto> dataConnections)
    {
        if (dataConnections.Count > MaxConnections)
        {
            return $"A project can have at most {MaxConnections} data connections";
        }

        foreach (var dataConnection in dataConnections)
        {
            var error = NormalizeDataConnection(dataConnection);
            if (error != null)
            {
                return error;
            }
        }

        var duplicateKey = dataConnections
            .GroupBy(dataConnection => dataConnection.Key, StringComparer.OrdinalIgnoreCase)
            .FirstOrDefault(group => group.Count() > 1)?.Key;

        return duplicateKey != null ? $"Data connection key '{duplicateKey}' is used more than once" : null;
    }

    /// <summary>
    /// Clamps the requested page size to the supported range.
    /// </summary>
    public static int ClampListTop(int? top)
    {
        return Math.Clamp(top ?? DefaultListTop, 1, MaxListTop);
    }

    private static string? NormalizeDataConnection(UiBuilderDataConnectionDto dataConnection)
    {
        dataConnection.Key = (dataConnection.Key ?? string.Empty).Trim();
        dataConnection.Type = (dataConnection.Type ?? string.Empty).Trim().ToLowerInvariant();
        dataConnection.EnvType = (dataConnection.EnvType ?? string.Empty).Trim().ToLowerInvariant();
        dataConnection.FetchMode = (dataConnection.FetchMode ?? string.Empty).Trim().ToLowerInvariant();
        dataConnection.Description = string.IsNullOrWhiteSpace(dataConnection.Description) ? null : dataConnection.Description.Trim();
        dataConnection.Operations = (dataConnection.Operations ?? new List<string>())
            .Select(operation => (operation ?? string.Empty).Trim().ToLowerInvariant())
            .Distinct()
            .ToList();

        if (!KeyPattern.IsMatch(dataConnection.Key))
        {
            return $"Data connection key '{dataConnection.Key}' must start with a letter and contain only letters, digits, or underscores (max 64)";
        }

        if (dataConnection.Type != QueueType)
        {
            return $"Data connection '{dataConnection.Key}' has an unsupported type. Only 'queue' is supported";
        }

        if (dataConnection.QueueId == Guid.Empty)
        {
            return $"Data connection '{dataConnection.Key}' requires a queue";
        }

        if (!Enum.GetValues<ConfigureEnvironmentType>().Any(envType => ToEnvTypeName(envType) == dataConnection.EnvType))
        {
            return $"Data connection '{dataConnection.Key}' has an invalid environment. Use 'dev' or 'prod'";
        }

        if (dataConnection.Operations.Count == 0 || dataConnection.Operations.Any(operation => !SupportedOperations.Contains(operation)))
        {
            return $"Data connection '{dataConnection.Key}' needs at least one operation from: list, get, add, update";
        }

        if (!SupportedFetchModes.Contains(dataConnection.FetchMode))
        {
            return $"Data connection '{dataConnection.Key}' has an invalid fetch mode. Use 'auto' or 'manual'";
        }

        if (dataConnection.Description?.Length > 500)
        {
            return $"Data connection '{dataConnection.Key}' description cannot exceed 500 characters";
        }

        return null;
    }
}
