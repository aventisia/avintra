using ExecutorLibrary.Helpers;
using ExecutorLibrary.Models;

namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Resolves the AI models referenced by an agent (flow version) from its ReactFlow
/// workflow definition. Model references are stored on node inputs keyed as
/// <c>__ModelConfig__*</c> with a JSON value of <c>{ provider, model, ... }</c>.
/// </summary>
public static class AiModelHelper
{
    /// <summary>
    /// Parses the provided ReactFlow object and returns the distinct AI model names
    /// referenced by its <c>__ModelConfig__*</c> node inputs. Falls back to the
    /// provider name when a model name is not set. Returns an empty list when the
    /// workflow cannot be parsed or references no models.
    /// </summary>
    public static List<string> ExtractModelNames(string? reactFlowObject)
    {
        var models = new List<string>();

        ReactFlowDataModel? flow;
        try
        {
            flow = ReactFlowHelper.Parse(reactFlowObject);
        }
        catch (InvalidOperationException)
        {
            // Malformed workflow JSON: nothing to resolve.
            return models;
        }

        if (flow?.Nodes is null || flow.Nodes.Count == 0)
            return models;

        foreach (var node in flow.Nodes)
        {
            if (node?.Data?.Inputs is null)
                continue;

            foreach (var input in node.Data.Inputs)
            {
                if (string.IsNullOrWhiteSpace(input.Key) ||
                    !input.Key.Contains("__ModelConfig__", StringComparison.OrdinalIgnoreCase) ||
                    input.Value is null)
                    continue;

                // Normalize the input value to a JsonElement so we can read the model config.
                var config = input.Value is JsonElement element
                    ? element
                    : System.Text.Json.JsonSerializer.Deserialize<JsonElement>(
                        System.Text.Json.JsonSerializer.Serialize(input.Value));

                if (config.ValueKind != JsonValueKind.Object)
                    continue;

                var model = config.TryGetProperty("model", out var modelNode) ? modelNode.GetString() : null;
                var provider = config.TryGetProperty("provider", out var providerNode) ? providerNode.GetString() : null;

                // Prefer the concrete model name; fall back to the provider when only that is set.
                var label = !string.IsNullOrWhiteSpace(model) ? model : provider;

                if (!string.IsNullOrWhiteSpace(label) &&
                    !models.Contains(label!, StringComparer.OrdinalIgnoreCase))
                {
                    models.Add(label!);
                }
            }
        }

        return models;
    }
}
