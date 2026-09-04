using System.Text.Json;
using System.Text.Json.Nodes;
using WorkspaceAPIs.Features.CloudConnectors.Camel.Helpers;
using WorkspaceAPIs.Features.CloudConnectors.Camel.Models;

namespace WorkspaceAPIs.Features.CloudConnectors.Camel.Services;

/// <summary>
/// Rebuilds the Camel connector category entries inside the <c>App Integrations</c>
/// group of the action-selector mapping from the local Camel connector catalog.
/// </summary>
public sealed class CamelMappingRegenerator
{
    private readonly CamelConfigPaths _paths;
    private readonly ILogger _logger;
    private readonly Predicate<string> _isExcluded;
    private const string DefaultIconPath = "/function.png";

    public CamelMappingRegenerator(
        CamelConfigPaths paths,
        ILogger logger,
        Predicate<string> isExcluded)
    {
        _paths = paths;
        _logger = logger;
        _isExcluded = isExcluded;
    }

    /// <summary>
    /// Regenerates Camel categories under the App Integrations group.
    /// Existing categories are merged by label; new actions are appended without
    /// removing user-curated entries.
    /// </summary>
    public Task RegenerateAsync(
        IReadOnlyDictionary<string, CamelConnectorCatalogEntry> localCatalog,
        IReadOnlyDictionary<string, IReadOnlyList<string>>? harnessOperations = null)
    {
        var selectorPath = _paths.ActionSelectorMapping;
        if (!System.IO.File.Exists(selectorPath))
        {
            _logger.LogWarning("Action-selector mapping not found at {Path}; skipping mapping regeneration.", selectorPath);
            return Task.CompletedTask;
        }

        var categories = BuildCategories(localCatalog, harnessOperations);
        if (categories.Count == 0)
        {
            _logger.LogInformation("No Camel connector categories to regenerate.");
            return Task.CompletedTask;
        }

        categories.Sort((a, b) => string.Compare(
            a["label"]?.GetValue<string>(), b["label"]?.GetValue<string>(), StringComparison.OrdinalIgnoreCase));

        var selector = JsonNode.Parse(System.IO.File.ReadAllText(selectorPath)) as JsonArray;
        if (selector is null)
        {
            _logger.LogWarning("Action-selector mapping is not a JSON array; skipping mapping regeneration.");
            return Task.CompletedTask;
        }

        RemoveLegacyCamelGroup(selector);
        var appIntegrationsGroup = GetOrCreateAppIntegrationsGroup(selector);
        MergeCategories(appIntegrationsGroup, categories);

        var json = selector.ToJsonString(CamelSerializerOptions.Selector);
        System.IO.File.WriteAllText(selectorPath, json);
        _logger.LogInformation("Regenerated {Count} Camel connector action categories under App Integrations in {Path}.",
            categories.Count, selectorPath);

        return Task.CompletedTask;
    }

    private List<JsonObject> BuildCategories(
        IReadOnlyDictionary<string, CamelConnectorCatalogEntry> localCatalog,
        IReadOnlyDictionary<string, IReadOnlyList<string>>? harnessOperations)
    {
        var categories = new List<JsonObject>();

        foreach (var catalogEntry in localCatalog.Values)
        {
            var connector = catalogEntry.Name;
            if (string.IsNullOrWhiteSpace(connector) || _isExcluded(connector))
            {
                continue;
            }

            try
            {
                var family = connector.ToLowerInvariant();
                var familyDisplay = catalogEntry.GetDisplayLabel();
                var actions = BuildActions(family, catalogEntry, familyDisplay, harnessOperations);

                if (actions.Count == 0)
                {
                    continue;
                }

                categories.Add(new JsonObject
                {
                    ["label"] = familyDisplay,
                    ["description"] = catalogEntry.GetDescription() ?? $"{familyDisplay} through the Camel connector.",
                    ["icon"] = null,
                    ["img"] = string.IsNullOrWhiteSpace(catalogEntry.Icon) ? DefaultIconPath : catalogEntry.Icon,
                    ["listType"] = null,
                    ["doNotRenderIf"] = new JsonArray("production"),
                    ["actions"] = actions,
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to build action-selector mapping for Camel connector '{Connector}'.", connector);
            }
        }

        return categories;
    }

    private static JsonArray BuildActions(
        string family,
        CamelConnectorCatalogEntry? catalogEntry,
        string familyDisplay,
        IReadOnlyDictionary<string, IReadOnlyList<string>>? harnessOperations)
    {
        var actions = new JsonArray();
        var familyIcon = string.IsNullOrEmpty(catalogEntry?.Icon) ? DefaultIconPath : catalogEntry.Icon;

        // Operations come only from the harness API (the same list used to
        // generate the per-operation config files) so the selector actions
        // always match the config files. The local catalog's operations list
        // is not used.
        var operationNames = harnessOperations != null
            && harnessOperations.TryGetValue(family, out var ops)
            && ops.Count > 0
                ? ops.ToList()
                : new List<string>();

        if (operationNames.Count == 0)
        {
            var action = CamelNodeNaming.ToActionName(family) ?? "Invoke";
            actions.Add(BuildActionNode(
                family, action, familyDisplay, familyIcon,
                catalogEntry?.GetDescription() ?? $"{familyDisplay} through the Camel connector."));
            return actions;
        }

        foreach (var operation in operationNames)
        {
            var action = CamelNodeNaming.ToActionName(operation);
            if (string.IsNullOrWhiteSpace(action))
            {
                continue;
            }

            actions.Add(BuildActionNode(
                family, action,
                CamelNodeNaming.ToDisplayName(family, action),
                familyIcon,
                CamelNodeNaming.ToDescription(family, action)));
        }

        return actions;
    }

    private static JsonObject BuildActionNode(
        string family,
        string action,
        string label,
        string icon,
        string description)
    {
        return new JsonObject
        {
            ["type"] = "cloudConnectorNode",
            ["name"] = $"Camel/{family}/{action}Connector",
            ["label"] = label,
            ["description"] = description,
            ["docsLink"] = "https://docs.aventisia.com",
            ["icon"] = null,
            ["img"] = icon,
            ["supportedPlatforms"] = new JsonArray("cloud", "windows"),
        };
    }

    private static void RemoveLegacyCamelGroup(JsonArray selector)
    {
        selector.RemoveAll(node =>
            node is JsonObject obj
            && string.Equals(obj["label"]?.GetValue<string>(), "Apache Camel Connectors", StringComparison.Ordinal));
    }

    private static JsonObject GetOrCreateAppIntegrationsGroup(JsonArray selector)
    {
        foreach (var node in selector)
        {
            if (node is JsonObject obj
                && string.Equals(obj["label"]?.GetValue<string>(), "App Integrations", StringComparison.Ordinal))
            {
                return obj;
            }
        }

        var group = new JsonObject
        {
            ["label"] = "App Integrations",
            ["description"] = "Seamlessly integrate with apps and services such as Twilio, Slack, and more",
            ["icon"] = "AppIntegrationsIcon",
            ["img"] = null,
        };
        selector.Add(group);
        return group;
    }

    private static void MergeCategories(JsonObject appIntegrationsGroup, List<JsonObject> categories)
    {
        var existingCategories = appIntegrationsGroup["actionCategories"] as JsonArray ?? new JsonArray();

        foreach (var generated in categories)
        {
            var label = generated["label"]?.GetValue<string>();
            var existing = existingCategories
                .OfType<JsonObject>()
                .FirstOrDefault(obj => string.Equals(obj["label"]?.GetValue<string>(), label, StringComparison.Ordinal));

            if (existing is null)
            {
                existingCategories.Add(generated);
                continue;
            }

            var mergedActions = existing["actions"] as JsonArray ?? new JsonArray();
            var generatedActions = generated["actions"] as JsonArray ?? new JsonArray();

            var existingNames = mergedActions
                .OfType<JsonObject>()
                .Select(a => a["name"]?.GetValue<string>())
                .Where(n => !string.IsNullOrWhiteSpace(n))
                .ToHashSet(StringComparer.Ordinal);

            foreach (var actionNode in generatedActions.OfType<JsonObject>())
            {
                var actionName = actionNode["name"]?.GetValue<string>();
                if (string.IsNullOrWhiteSpace(actionName) || existingNames.Contains(actionName))
                {
                    continue;
                }

                mergedActions.Add(actionNode.DeepClone());
                existingNames.Add(actionName);
            }

            existing["actions"] = mergedActions;
        }

        appIntegrationsGroup["actionCategories"] = existingCategories;
    }
}
