using System.Data;
using System.Globalization;
using System.Text;

namespace NodeLibrary.DataQualityNodes;

[DisplayName("Standardize Column Names"), Description("Renames all (or selected) columns to a consistent format. Options include snake_case, camelCase, PascalCase, or Title Case, with optional removal of special characters and duplicate suffixes.")]
[NodeMetadata(icon: "/assets/DataQuality.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class StandardizeColumnNamesNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table whose columns to rename.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Case Style"), Description("The target case style: 'snake', 'camel', 'pascal', or 'title'. Defaults to 'snake'.")]
    public InArgument<string> CaseStyle { get; set; } = new InArgument<string>("snake");

    [DisplayName("Columns To Rename"), Description("Optional comma-separated columns to rename. Leave empty to rename all columns.")]
    public InArgument<string> ColumnsToRename { get; set; } = new InArgument<string>();

    [DisplayName("Ensure Unique Names"), Description("True to ensure all resulting column names are unique by appending suffixes. Defaults to true.")]
    public InArgument<bool> EnsureUniqueNames { get; set; } = new InArgument<bool>(true);

    [DisplayName("Result Data Table"), Description("The resulting data table with standardized column names.")]
    public OutArgument<DataTable> ResultDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var caseStyle = CaseStyle.Get(context) ?? string.Empty;
            var columnsToRename = ColumnsToRename.Get(context);
            var ensureUniqueNames = EnsureUniqueNames.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (!caseStyle.Equals("snake", StringComparison.OrdinalIgnoreCase) &&
                !caseStyle.Equals("camel", StringComparison.OrdinalIgnoreCase) &&
                !caseStyle.Equals("pascal", StringComparison.OrdinalIgnoreCase) &&
                !caseStyle.Equals("title", StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException("Case Style must be 'snake', 'camel', 'pascal', or 'title'.");

            var cols = string.IsNullOrWhiteSpace(columnsToRename)
                ? dataTable.Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToList()
                : columnsToRename.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

            foreach (var col in cols)
                if (!dataTable.Columns.Contains(col))
                    throw new ArgumentException($"Column '{col}' does not exist in the data table.");

            var result = dataTable.Copy();
            var usedNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var col in cols)
            {
                var original = result.Columns[col]!;
                var standardized = Convert(original.ColumnName ?? string.Empty, caseStyle);
                if (ensureUniqueNames)
                    standardized = MakeUnique(usedNames, standardized);
                else
                    usedNames.Add(standardized);
                original.ColumnName = standardized;
            }

            ResultDataTable.Set(context, result);
            status = "Successfully standardized column names.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ResultDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error standardizing column names: {ex.Message}");
        }
    }

    private static string Convert(string name, string caseStyle)
    {
        // Split on underscores, spaces, hyphens, and camelCase boundaries.
        var parts = Regex.Split(name, @"[\s_\-]+")
            .Where(p => !string.IsNullOrEmpty(p))
            .SelectMany(p => SplitCamel(p))
            .Where(p => !string.IsNullOrEmpty(p))
            .Select(p => Regex.Replace(p, @"[^0-9A-Za-z]", ""))
            .Where(p => !string.IsNullOrEmpty(p))
            .ToList();

        if (parts.Count == 0)
            return name;

        if (caseStyle.Equals("snake", StringComparison.OrdinalIgnoreCase))
        {
            return string.Join("_", parts.Select(p => p.ToLowerInvariant()));
        }
        if (caseStyle.Equals("camel", StringComparison.OrdinalIgnoreCase))
        {
            var sb = new StringBuilder();
            sb.Append(parts[0].ToLowerInvariant());
            for (var i = 1; i < parts.Count; i++)
            {
                var p = parts[i];
                sb.Append(char.ToUpperInvariant(p[0])).Append(p.Substring(1).ToLowerInvariant());
            }
            return sb.ToString();
        }
        if (caseStyle.Equals("pascal", StringComparison.OrdinalIgnoreCase))
        {
            var sb = new StringBuilder();
            foreach (var p in parts)
                sb.Append(char.ToUpperInvariant(p[0])).Append(p.Substring(1).ToLowerInvariant());
            return sb.ToString();
        }

        // Title case
        var title = new StringBuilder();
        foreach (var p in parts)
        {
            if (title.Length > 0)
                title.Append(' ');
            title.Append(char.ToUpperInvariant(p[0])).Append(p.Substring(1).ToLowerInvariant());
        }
        return title.ToString();
    }

    private static IEnumerable<string> SplitCamel(string value)
    {
        // Insert boundaries between lower/digit and upper transitions.
        var sb = new StringBuilder();
        for (var i = 0; i < value.Length; i++)
        {
            var c = value[i];
            if (i > 0 && char.IsUpper(c) && (char.IsLower(value[i - 1]) || char.IsDigit(value[i - 1])))
            {
                yield return sb.ToString();
                sb.Clear();
            }
            sb.Append(c);
        }
        if (sb.Length > 0)
            yield return sb.ToString();
    }

    private static string MakeUnique(HashSet<string> used, string name)
    {
        if (used.Add(name))
            return name;
        var i = 2;
        while (!used.Add($"{name}_{i}"))
            i++;
        return $"{name}_{i}";
    }
}
