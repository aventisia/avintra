using System.Globalization;

using WorkspaceAPIs.Features.FlowAssistant.Generated;

using JsonSerializer = System.Text.Json.JsonSerializer;
using JsonException = System.Text.Json.JsonException;

namespace WorkspaceAPIs.Features.FlowAssistant.Helpers;

/// <summary>
/// Rewrites proposal field keys to the catalog's canonical names so downstream validation and application match node metadata.
/// </summary>
public static class FlowAssistantProposalNormalizer
{
    /// <summary>
    /// Returns a proposal whose node input and output keys use the catalog's canonical casing, dropping keys the catalog does not define.
    /// </summary>
    public static JsonElement Normalize(JsonElement proposal)
    {
        if (proposal.ValueKind != JsonValueKind.Object)
            return proposal;

        try
        {
            return RewriteKeys(proposal);
        }
        catch (Exception ex) when (ex is JsonException or ArgumentException or InvalidOperationException)
        {
            return proposal;
        }
    }

    private static JsonElement RewriteKeys(JsonElement proposal)
    {
        if (JsonNode.Parse(proposal.GetRawText()) is not JsonObject proposalObject)
            return proposal;

        if (proposalObject["operations"] is not JsonArray operations)
            return proposal;

        foreach (var operation in operations)
        {
            if (operation is not JsonObject operationObject)
                continue;

            if (ReadString(operationObject, "type") is not ("addNode" or "updateNode"))
                continue;

            if (operationObject["node"] is not JsonObject nodeObject)
                continue;

            var nodeType = ReadString(nodeObject, "type");
            var nodeName = ReadString(nodeObject, "name");
            if (string.IsNullOrWhiteSpace(nodeName))
                continue;

            nodeType = ResolveNodeType(nodeType, nodeName);
            if (!string.IsNullOrWhiteSpace(nodeType))
                nodeObject["type"] = nodeType;

            var metadata = FlowAssistantConfigCatalog.Nodes.FirstOrDefault(
                candidate => string.Equals(candidate.Type, nodeType, StringComparison.OrdinalIgnoreCase) &&
                             string.Equals(candidate.Name, nodeName, StringComparison.OrdinalIgnoreCase));
            if (metadata is null)
                continue;

            CanonicalizeProperty(nodeObject, "inputs", metadata, "Input");
            CanonicalizeProperty(nodeObject, "outputs", metadata, "Output");
        }

        return JsonSerializer.SerializeToElement(proposalObject);
    }

    private static void CanonicalizeProperty(
        JsonObject nodeObject,
        string propertyName,
        FlowAssistantNodeConfig metadata,
        string direction)
    {
        if (nodeObject[propertyName] is not JsonArray entries)
            return;

        var canonical = new JsonArray();
        foreach (var entry in entries)
        {
            if (entry is not JsonObject entryObject)
                continue;

            var key = ReadString(entryObject, "key");
            if (string.IsNullOrWhiteSpace(key))
                continue;

            var field = metadata.Fields.FirstOrDefault(
                candidate => candidate.Direction == direction &&
                             string.Equals(candidate.Name, key, StringComparison.OrdinalIgnoreCase));
            if (field is null)
                continue;

            entryObject["key"] = field.Name;
            if (direction == "Input")
            {
                UnwrapInputValue(entryObject);
                CoerceInputValue(entryObject, field.Type);
                if (entryObject["value"] is null)
                    continue;
            }
            canonical.Add(entryObject.DeepClone());
        }

        nodeObject[propertyName] = canonical;
    }

    private static void UnwrapInputValue(JsonObject entryObject)
    {
        if (entryObject["value"] is not JsonObject valueObject)
            return;

        var isValueEnvelope = valueObject.Count is > 0 and <= 2 &&
                              valueObject.All(pair => pair.Key is "value" or "enabled") &&
                              (valueObject["enabled"] is null || valueObject["enabled"] is JsonValue);
        if (!isValueEnvelope)
            return;

        entryObject["value"] = valueObject["value"]?.DeepClone();
    }

    private static void CoerceInputValue(JsonObject entryObject, string fieldType)
    {
        if (entryObject["value"] is not JsonValue value)
            return;

        if (fieldType is "switch" or "checkbox")
        {
            if (value.TryGetValue<string>(out var text) && bool.TryParse(text, out var booleanValue))
                entryObject["value"] = JsonValue.Create(booleanValue);
            return;
        }

        if (fieldType is "number" or "slider")
        {
            if (value.TryGetValue<string>(out var text) &&
                double.TryParse(text, NumberStyles.Any, CultureInfo.InvariantCulture, out var numberValue))
            {
                entryObject["value"] = JsonValue.Create(numberValue);
            }
        }
    }

    private static string? ResolveNodeType(string? nodeType, string nodeName)
    {
        var allowed = FlowAssistantCatalog.AllowedNodes.FirstOrDefault(
            node => string.Equals(node.Name, nodeName, StringComparison.OrdinalIgnoreCase));

        return allowed.Name is null ? nodeType : allowed.Type;
    }

    private static string? ReadString(JsonObject jsonObject, string propertyName) =>
        jsonObject[propertyName] is JsonValue value && value.TryGetValue<string>(out var text)
            ? text
            : null;
}
