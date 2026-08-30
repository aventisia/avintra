using System.Data;

namespace NodeLibrary.EncodingNodes;

[DisplayName("Label Encode"), Description("Converts a categorical column into integer labels (0-based). Distinct values are assigned integers sorted alphabetically. Optionally replaces the source column or adds a new column.")]
[NodeMetadata(icon: "/assets/Encoding.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class LabelEncodeNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table containing the categorical column to encode.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Column To Encode"), Description("The categorical column to label encode.")]
    public required InArgument<string> ColumnToEncode { get; set; }

    [DisplayName("Result Column Name"), Description("The name of the new encoded column. Defaults to '<Column>_Label'.")]
    public InArgument<string> ResultColumnName { get; set; } = new InArgument<string>();

    [DisplayName("Replace Source Column"), Description("True to replace the source column with the labels. Defaults to false (adds a new column).")]
    public InArgument<bool> ReplaceSourceColumn { get; set; } = new InArgument<bool>(false);

    [DisplayName("Encoded Data Table"), Description("The resulting data table with the encoded column.")]
    public OutArgument<DataTable> EncodedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var columnToEncode = ColumnToEncode.Get(context);
            var resultColumnName = ResultColumnName.Get(context);
            var replaceSourceColumn = ReplaceSourceColumn.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(columnToEncode) || !dataTable.Columns.Contains(columnToEncode))
                throw new ArgumentException($"Column '{columnToEncode}' does not exist in the data table.");

            var result = dataTable.Copy();
            var resultColumn = replaceSourceColumn ? columnToEncode : (string.IsNullOrWhiteSpace(resultColumnName) ? $"{columnToEncode}_Label" : resultColumnName.Trim());
            if (!result.Columns.Contains(resultColumn))
                result.Columns.Add(resultColumn, typeof(int));

            var labelMap = result.AsEnumerable()
                .Select(r => r[columnToEncode]?.ToString() ?? "")
                .Where(v => !string.IsNullOrEmpty(v))
                .Distinct()
                .OrderBy(v => v)
                .Select((v, i) => new { v, i })
                .ToDictionary(x => x.v, x => x.i);

            foreach (var row in result.AsEnumerable())
            {
                var val = row[columnToEncode]?.ToString() ?? "";
                row[resultColumn] = labelMap.ContainsKey(val) ? labelMap[val] : -1;
            }

            EncodedDataTable.Set(context, result);
            status = $"Successfully label encoded into {labelMap.Count} labels.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            EncodedDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error label encoding: {ex.Message}");
        }
    }
}
