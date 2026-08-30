using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using ExecutorLibrary.Helpers;
using ExecutorLibrary.Models;

namespace RunnerApp.Services;

/// <summary>
/// Resolves <c>{{__config__KeyName}}</c> placeholders defined in a flow (and its sub-flows)
/// by fetching matching key/value pairs from the workspace key store and seeding them into
/// <see cref="ExecutionGraphDto.InputArgumentsJson"/>. The execution context then exposes
/// each resolved value as a top-level variable named <c>__config__KeyName</c>, which the
/// existing template engine substitutes wherever the placeholder appears.
/// </summary>
public static class ConfigKeyResolver
{
    private const string ConfigKeyPrefix = "__config__";

    // Matches {{__config__KeyName}} and captures KeyName.
    private static readonly Regex ConfigKeyPlaceholderRegex = new(
        @"\{\{__config__([^}]+)\}\}",
        RegexOptions.Compiled | RegexOptions.IgnoreCase,
        TimeSpan.FromMilliseconds(100));

    /// <summary>
    /// Extracts config key placeholders from the parent flow and all sub-flows, fetches their
    /// values from the backend, and returns them as top-level context variables named
    /// <c>__config__KeyName</c>. The values are also merged into the graph's input arguments
    /// so <c>_job.InputArguments</c> remains consistent with the execution context.
    /// </summary>
    public static async Task<IReadOnlyDictionary<string, string>> MergeConfigKeyValuesAsync(
        ExecutionGraphDto graph,
        IBackendClient backendClient,
        CancellationToken ct = default)
    {
        if (graph is null)
            throw new ArgumentNullException(nameof(graph));
        if (backendClient is null)
            throw new ArgumentNullException(nameof(backendClient));

        var configKeys = ExtractConfigKeys(graph);
        if (configKeys.Count == 0)
            return new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        DebugLog.Info($"Resolving {configKeys.Count} config key placeholder(s): {string.Join(", ", configKeys)}");

        IReadOnlyDictionary<string, string> resolved;
        try
        {
            resolved = await backendClient.FetchConfigKeyValuePairsAsync(configKeys, ct);
        }
        catch (Exception ex)
        {
            DebugLog.Error("Failed to fetch config key values from key store. Continuing without resolved config keys.", ex);
            return new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        }

        var inputArguments = ParseInputArguments(graph.InputArgumentsJson);
        var seededVariables = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        foreach (var key in configKeys)
        {
            var variableName = $"{ConfigKeyPrefix}{key}";

            if (resolved.TryGetValue(key, out var value))
            {
                seededVariables[variableName] = value;

                // Also keep _job.InputArguments in sync for any nodes that read inputs from there.
                inputArguments ??= new JsonObject();
                if (inputArguments is JsonObject inputObj)
                {
                    inputObj[variableName] = value;
                    DebugLog.Info($"Seeded config key variable: {variableName}");
                }
            }
            else
            {
                DebugLog.Warn($"Config key not found in key store: {key}");
            }
        }

        if (inputArguments is not null)
            graph.InputArgumentsJson = inputArguments.ToJsonString();

        return seededVariables;
    }

    /// <summary>
    /// Walks the parent ReactFlow object and every sub-flow to collect unique config key names
    /// referenced in node input values.
    /// </summary>
    private static HashSet<string> ExtractConfigKeys(ExecutionGraphDto graph)
    {
        var keys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        if (!string.IsNullOrWhiteSpace(graph.ReactFlowObject))
            ExtractFromReactFlowObject(keys, graph.ReactFlowObject);

        foreach (var subFlow in graph.SubFlows ?? [])
        {
            if (!string.IsNullOrWhiteSpace(subFlow.ReactFlowObject))
                ExtractFromReactFlowObject(keys, subFlow.ReactFlowObject);
        }

        return keys;
    }

    private static void ExtractFromReactFlowObject(HashSet<string> keys, string reactFlowObject)
    {
        ReactFlowDataModel? flow;
        try
        {
            flow = ReactFlowHelper.Parse(reactFlowObject);
        }
        catch (Exception ex)
        {
            DebugLog.Warn($"Failed to parse ReactFlow object while extracting config keys: {ex.Message}");
            return;
        }

        if (flow?.Nodes is null)
            return;

        foreach (var node in flow.Nodes)
        {
            if (node?.Data?.Inputs is null)
                continue;

            foreach (var input in node.Data.Inputs)
            {
                if (input?.Value is null)
                    continue;

                var valueString = Convert.ToString(input.Value);
                if (string.IsNullOrWhiteSpace(valueString))
                    continue;

                foreach (Match match in ConfigKeyPlaceholderRegex.Matches(valueString))
                {
                    var keyName = match.Groups[1].Value.Trim();
                    if (!string.IsNullOrWhiteSpace(keyName))
                        keys.Add(keyName);
                }
            }
        }
    }

    private static JsonNode? ParseInputArguments(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return new JsonObject();

        try
        {
            var node = JsonNode.Parse(json);
            if (node is JsonObject)
                return node;

            // If the caller supplied a non-object payload, treat it as opaque and return an empty object.
            return new JsonObject();
        }
        catch
        {
            return new JsonObject();
        }
    }
}
