using WorkspaceAPIs.Features.CloudConnectors.Camel.Models;

namespace WorkspaceAPIs.Features.Tools.Helpers;

/// <summary>
/// Resolves brand icons for platform tools by normalizing tool names against the
/// Camel and Corsair integration catalogs.
/// </summary>
public static class ToolIconHelpers
{
    // Normalizes an integration name so identifiers and display labels map to the
    // same key (lowercase, alphanumeric only). This makes "Googlecalendar" from a
    // Corsair plugin id and "google-calendar" from a catalog entry resolve alike.
    public static string NormalizeName(string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return string.Empty;
        }

        var buffer = new StringBuilder(name.Length);
        foreach (var character in name)
        {
            if (char.IsLetterOrDigit(character))
            {
                buffer.Append(char.ToLowerInvariant(character));
            }
        }

        return buffer.ToString();
    }

    // Adds normalized connector-name and display-label entries from the Camel catalog.
    public static void AddCamelIcons(
        Dictionary<string, string> lookup,
        IReadOnlyDictionary<string, CamelConnectorCatalogEntry> camelCatalog)
    {
        foreach (var entry in camelCatalog.Values)
        {
            if (string.IsNullOrWhiteSpace(entry.Icon))
            {
                continue;
            }

            AddIconEntry(lookup, entry.GetDisplayLabel(), entry.Icon);
            AddIconEntry(lookup, entry.Name, entry.Icon);
        }
    }

    // Adds normalized plugin-id, alias and provider-name entries from the Corsair catalog.
    public static void AddCorsairIcons(
        Dictionary<string, string> lookup,
        IReadOnlyDictionary<string, string> corsairIconMap)
    {
        foreach (var (name, icon) in corsairIconMap)
        {
            AddIconEntry(lookup, name, icon);
        }
    }

    // Normalizes a name and adds its icon to the lookup when not already present.
    private static void AddIconEntry(Dictionary<string, string> lookup, string? name, string? icon)
    {
        if (string.IsNullOrWhiteSpace(icon))
        {
            return;
        }

        var key = NormalizeName(name);
        if (key.Length == 0)
        {
            return;
        }

        lookup.TryAdd(key, icon);
    }

    // Returns the catalog icon path for a tool name, or null when nothing matches.
    public static string? ResolveIcon(string? toolName, IReadOnlyDictionary<string, string> lookup)
    {
        var key = NormalizeName(toolName);
        return key.Length == 0 ? null : lookup.GetValueOrDefault(key);
    }
}
