using System.Data;
using System.Globalization;

namespace NodeLibrary.DataQualityNodes;

[DisplayName("Normalize Date Formats"), Description("Parses date values (strings or DateTime) from one or more columns using multiple common formats and rewrites them to a single target output format. Unparseable values are left unchanged.")]
[NodeMetadata(icon: "/assets/DataQuality.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class NormalizeDateFormatsNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table containing the date columns to normalize.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Columns To Normalize"), Description("Comma-separated column names whose date values are normalized.")]
    public required InArgument<string> ColumnsToNormalize { get; set; }

    [DisplayName("Output Format"), Description("The .NET date format string for the output, e.g. 'yyyy-MM-dd' or 'MM/dd/yyyy'. Defaults to 'yyyy-MM-dd'.")]
    public InArgument<string> OutputFormat { get; set; } = new InArgument<string>("yyyy-MM-dd");

    [DisplayName("Normalized Data Table"), Description("The resulting data table with normalized date columns.")]
    public OutArgument<DataTable> NormalizedDataTable { get; set; } = new OutArgument<DataTable>();

    // Common formats tried when parsing, from most to least specific.
    private static readonly string[] SupportedFormats =
    {
        "yyyy-MM-dd", "yyyy-MM-dd HH:mm:ss", "yyyy-MM-ddTHH:mm:ss",
        "MM/dd/yyyy", "MM/dd/yyyy HH:mm:ss", "M/d/yyyy", "M/d/yyyy H:mm",
        "dd/MM/yyyy", "dd-MM-yyyy", "dd.MM.yyyy",
        "yyyy/MM/dd", "dd MMM yyyy", "dd MMMM yyyy",
        "MMM dd, yyyy", "MMMM dd, yyyy", "ddd, dd MMM yyyy HH:mm:ss"
    };

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var columnsToNormalize = ColumnsToNormalize.Get(context) ?? string.Empty;
            var outputFormat = OutputFormat.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(outputFormat))
                throw new ArgumentException("Output Format cannot be empty.");

            var cols = columnsToNormalize.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
            foreach (var col in cols)
                if (!dataTable.Columns.Contains(col))
                    throw new ArgumentException($"Column '{col}' does not exist in the data table.");

            var result = dataTable.Copy();
            foreach (var row in result.AsEnumerable())
            {
                foreach (var col in cols)
                {
                    var v = row[col];
                    if (v == DBNull.Value || v == null)
                        continue;

                    var parsed = v is DateTime dt ? dt : TryParseDate(Convert.ToString(v, CultureInfo.InvariantCulture));
                    if (parsed.HasValue)
                        row[col] = parsed.Value.ToString(outputFormat, CultureInfo.InvariantCulture);
                }
            }

            NormalizedDataTable.Set(context, result);
            status = "Successfully normalized date formats.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            NormalizedDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error normalizing date formats: {ex.Message}");
        }
    }

    private static DateTime? TryParseDate(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;
        foreach (var format in SupportedFormats)
        {
            if (DateTime.TryParseExact(value, format, CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed))
                return parsed;
        }
        // Fall back to general parsing.
        return DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.None, out var general)
            ? general
            : (DateTime?)null;
    }
}
