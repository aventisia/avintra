using System.Data;
using NodeLibrary.DataTableNodes.Enums;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Data Cleansing"), Description("Cleans text columns by trimming whitespace, collapsing spaces, removing special characters, and normalizing casing.")]
[NodeMetadata(icon: "/assets/DataTable.svg", badge: "Beta")]
public class DataCleansingNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to cleanse.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Columns"), Description("Comma-separated column names to cleanse. Empty means all text columns.")]
    public InArgument<string> Columns { get; set; } = new InArgument<string>();

    [DisplayName("Trim Whitespace"), Description("Removes leading and trailing whitespace.")]
    public InArgument<bool> TrimWhitespace { get; set; } = new InArgument<bool>(true);

    [DisplayName("Collapse Spaces"), Description("Replaces multiple consecutive spaces with a single space.")]
    public InArgument<bool> CollapseSpaces { get; set; } = new InArgument<bool>(true);

    [DisplayName("Remove Special Characters"), Description("Removes characters that are not letters, digits, or whitespace.")]
    public InArgument<bool> RemoveSpecialCharacters { get; set; } = new InArgument<bool>(false);

    [DisplayName("Normalize Case"), Description("Converts the text to the selected case format.")]
    public InArgument<CleanseCaseEnum> NormalizeCase { get; set; } = new InArgument<CleanseCaseEnum>(CleanseCaseEnum.None);

    [DisplayName("Cleansed Data Table"), Description("The data table with cleansed column values.")]
    public OutArgument<DataTable> CleansedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var columns = Columns.Get(context);
            var trimWhitespace = TrimWhitespace.Get(context);
            var collapseSpaces = CollapseSpaces.Get(context);
            var removeSpecialCharacters = RemoveSpecialCharacters.Get(context);
            var normalizeCase = NormalizeCase.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");

            var columnNames = (columns ?? "")
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .ToList();
            if (columnNames.Count == 0)
                columnNames = dataTable.Columns.Cast<DataColumn>()
                    .Where(c => c.DataType == typeof(string))
                    .Select(c => c.ColumnName)
                    .ToList();
            foreach (var col in columnNames)
            {
                if (!dataTable.Columns.Contains(col))
                    throw new ArgumentException($"Column '{col}' does not exist in the data table.");
            }

            var resultTable = dataTable.Copy();
            foreach (DataRow row in resultTable.Rows)
            {
                foreach (var col in columnNames)
                {
                    if (row[col] == null || row[col] == DBNull.Value)
                        continue;
                    var text = row[col].ToString() ?? "";
                    if (trimWhitespace)
                        text = text.Trim();
                    if (collapseSpaces)
                        text = Regex.Replace(text, @"\s+", " ");
                    if (removeSpecialCharacters)
                        text = Regex.Replace(text, @"[^\w\s]", "");
                    text = ApplyCase(text, normalizeCase);
                    row[col] = text;
                }
            }

            CleansedDataTable.Set(context, resultTable);
            status = $"Successfully cleansed {columnNames.Count} columns.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            CleansedDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error cleansing data table: {ex.Message}");
        }
    }

    private static string ApplyCase(string text, CleanseCaseEnum caseMode)
    {
        return caseMode switch
        {
            CleanseCaseEnum.Lowercase => text.ToLower(CultureInfo.InvariantCulture),
            CleanseCaseEnum.Uppercase => text.ToUpper(CultureInfo.InvariantCulture),
            CleanseCaseEnum.TitleCase => CultureInfo.InvariantCulture.TextInfo.ToTitleCase(text.ToLower(CultureInfo.InvariantCulture)),
            _ => text
        };
    }
}
