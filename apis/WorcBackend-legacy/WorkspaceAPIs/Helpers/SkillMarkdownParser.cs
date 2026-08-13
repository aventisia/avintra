namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Minimal parser for SKILL.md YAML front-matter used by the default platform skill seeder.
/// Only the required <c>name</c> and <c>description</c> keys are extracted.
/// </summary>
public static class SkillMarkdownParser
{
    /// <summary>
    /// Extracts <c>name</c> and <c>description</c> from the YAML front-matter of a SKILL.md file.
    /// </summary>
    /// <param name="content">The full text of the SKILL.md file.</param>
    /// <param name="fallbackName">Name to use when the front-matter does not declare one.</param>
    /// <returns>
    /// A tuple containing the skill name and description. Returns <c>null</c> when
    /// the file has no valid YAML front-matter.
    /// </returns>
    public static (string Name, string Description)? Parse(string content, string fallbackName)
    {
        if (string.IsNullOrWhiteSpace(content))
            return null;

        var trimmed = content.TrimStart();
        if (!trimmed.StartsWith("---"))
            return null;

        var parts = trimmed.Split(["---"], 3, StringSplitOptions.None);
        if (parts.Length < 3)
            return null;

        var frontMatter = parts[1];
        var metadata = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        foreach (var rawLine in frontMatter.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries))
        {
            // Only read top-level scalar keys. Skip nested/object entries (indented),
            // comments, list items, and lines without a key/value separator.
            if (string.IsNullOrWhiteSpace(rawLine) || rawLine[0] == ' ' || rawLine[0] == '#' || rawLine[0] == '-')
                continue;

            var separatorIndex = rawLine.IndexOf(':');
            if (separatorIndex <= 0)
                continue;

            var key = rawLine[..separatorIndex].Trim();
            var value = rawLine[(separatorIndex + 1)..].Trim().Trim('"', '\'');

            // Skip object/list markers that happen to sit on their own line (e.g. "license:").
            if (string.IsNullOrEmpty(value) && (rawLine.EndsWith(":") || rawLine.TrimEnd().EndsWith(":")))
                continue;

            metadata[key] = value;
        }

        var name = metadata.GetValueOrDefault("name");
        if (string.IsNullOrWhiteSpace(name))
            name = fallbackName;

        var description = metadata.GetValueOrDefault("description");

        return (name, description ?? string.Empty);
    }
}
