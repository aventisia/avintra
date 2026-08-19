using System.Data;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Extract Regex to Columns"), Description("Applies a regular expression with capture groups to a column; each capture group becomes a new column.")]
[NodeMetadata(icon: "/assets/DataTable.svg", badge: "Beta")]
public class ExtractRegexToColumnsNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table containing the source column.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Source Column"), Description("The name of the column to which the regular expression is applied.")]
    public required InArgument<string> SourceColumn { get; set; }

    [DisplayName("Regular Expression"), Description("The regular expression pattern. Each capture group becomes a new column.")]
    public required InArgument<string> RegularExpression { get; set; }

    [DisplayName("Column Prefix"), Description("The prefix for the generated columns, e.g., 'Group' produces Group1, Group2, etc.")]
    public InArgument<string> ColumnPrefix { get; set; } = new InArgument<string>("Group");

    [DisplayName("Extracted Data Table"), Description("The data table with the extracted capture-group columns appended.")]
    public OutArgument<DataTable> ExtractedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var sourceColumn = SourceColumn.Get(context);
            var regularExpression = RegularExpression.Get(context);
            var columnPrefix = ColumnPrefix.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(sourceColumn))
                throw new ArgumentException("Source Column cannot be empty.");
            if (string.IsNullOrWhiteSpace(regularExpression))
                throw new ArgumentException("Regular Expression cannot be empty.");
            if (!dataTable.Columns.Contains(sourceColumn))
                throw new ArgumentException($"Column '{sourceColumn}' does not exist in the data table.");

            var regex = new Regex(regularExpression, RegexOptions.Compiled);
            var groupCount = regex.GetGroupNumbers().Length - 1; // exclude whole-match group 0
            var prefix = string.IsNullOrWhiteSpace(columnPrefix) ? "Group" : columnPrefix.Trim();

            var resultTable = dataTable.Clone();
            for (var i = 1; i <= groupCount; i++)
                resultTable.Columns.Add($"{prefix}{i}", typeof(string));

            foreach (DataRow row in dataTable.Rows)
            {
                var newRow = resultTable.NewRow();
                foreach (DataColumn column in dataTable.Columns)
                    newRow[column.ColumnName] = row[column.ColumnName];

                var text = row[sourceColumn]?.ToString() ?? "";
                var match = regex.Match(text);
                for (var i = 1; i <= groupCount; i++)
                    newRow[$"{prefix}{i}"] = match.Success && match.Groups[i].Success ? match.Groups[i].Value : DBNull.Value;

                resultTable.Rows.Add(newRow);
            }

            ExtractedDataTable.Set(context, resultTable);
            status = $"Successfully extracted {groupCount} capture groups into new columns.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ExtractedDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error extracting regex to columns: {ex.Message}");
        }
    }
}
