using System.Data;

namespace NodeLibrary.DataQualityNodes;

[DisplayName("Replace Null with Value"), Description("Replaces null/empty values in one or more columns with a specified replacement value. When no columns are given, all columns are processed.")]
[NodeMetadata(icon: "/assets/DataQuality.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class ReplaceNullWithValueNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to clean.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Columns To Clean"), Description("Optional comma-separated column names to process. Leave empty to process all columns.")]
    public InArgument<string> ColumnsToClean { get; set; } = new InArgument<string>();

    [DisplayName("Replacement Value"), Description("The value used to replace null/empty cells.")]
    public InArgument<string> ReplacementValue { get; set; } = new InArgument<string>();

    [DisplayName("Also Treat Whitespace As Null"), Description("True to also treat whitespace-only strings as null. Defaults to false.")]
    public InArgument<bool> AlsoTreatWhitespaceAsNull { get; set; } = new InArgument<bool>(false);

    [DisplayName("Cleaned Data Table"), Description("The resulting data table with nulls replaced.")]
    public OutArgument<DataTable> CleanedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var columnsToClean = ColumnsToClean.Get(context);
            var replacementValue = ReplacementValue.Get(context);
            var alsoTreatWhitespaceAsNull = AlsoTreatWhitespaceAsNull.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");

            var cols = string.IsNullOrWhiteSpace(columnsToClean)
                ? dataTable.Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToList()
                : columnsToClean.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

            foreach (var col in cols)
                if (!dataTable.Columns.Contains(col))
                    throw new ArgumentException($"Column '{col}' does not exist in the data table.");

            var result = dataTable.Copy();
            foreach (var row in result.AsEnumerable())
            {
                foreach (var col in cols)
                {
                    var v = row[col];
                    var isNull = v == DBNull.Value || v == null;
                    if (!isNull && alsoTreatWhitespaceAsNull && v is string s && string.IsNullOrWhiteSpace(s))
                        isNull = true;
                    if (isNull)
                        row[col] = replacementValue;
                }
            }

            CleanedDataTable.Set(context, result);
            status = "Successfully replaced null values.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            CleanedDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error replacing null values: {ex.Message}");
        }
    }
}
