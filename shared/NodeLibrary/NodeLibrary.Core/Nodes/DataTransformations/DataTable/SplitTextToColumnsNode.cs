using System.Data;
using NodeLibrary.DataTableNodes.Enums;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Split Text to Columns"), Description("Splits the values of a single text column into multiple columns using a delimiter or fixed-length chunks.")]
[NodeMetadata(icon: "/assets/DataTable.svg", badge: "Beta")]
public class SplitTextToColumnsNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table containing the source column to split.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Source Column"), Description("The name of the text column to split.")]
    public required InArgument<string> SourceColumn { get; set; }

    [DisplayName("Split By"), Description("Whether to split by a delimiter or into fixed-length chunks.")]
    public required InArgument<TextSplitByEnum> SplitBy { get; set; } = new InArgument<TextSplitByEnum>(TextSplitByEnum.Delimiter);

    [DisplayName("Delimiter"), Description("The delimiter used to split the text (used by Delimiter mode).")]
    public InArgument<string> Delimiter { get; set; } = new InArgument<string>(",");

    [DisplayName("Chunk Length"), Description("The fixed length of each chunk (used by Fixed Length mode).")]
    public InArgument<int> ChunkLength { get; set; } = new InArgument<int>(5);

    [DisplayName("Column Prefix"), Description("The prefix for the generated columns, e.g., 'Part' produces Part1, Part2, etc.")]
    public InArgument<string> ColumnPrefix { get; set; } = new InArgument<string>("Part");

    [DisplayName("Split Data Table"), Description("The data table with the source column split into multiple columns.")]
    public OutArgument<DataTable> SplitDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var sourceColumn = SourceColumn.Get(context);
            var splitBy = SplitBy.Get(context);
            var delimiter = Delimiter.Get(context);
            var chunkLength = ChunkLength.Get(context);
            var columnPrefix = ColumnPrefix.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(sourceColumn))
                throw new ArgumentException("Source Column cannot be empty.");
            if (!dataTable.Columns.Contains(sourceColumn))
                throw new ArgumentException($"Column '{sourceColumn}' does not exist in the data table.");

            var prefix = string.IsNullOrWhiteSpace(columnPrefix) ? "Part" : columnPrefix.Trim();
            var partsPerRow = dataTable.Rows.Cast<DataRow>()
                .Select(row => SplitValue(row[sourceColumn]?.ToString(), splitBy, delimiter, chunkLength))
                .ToList();
            var maxParts = partsPerRow.Count == 0 ? 0 : partsPerRow.Max(p => p.Count);

            var resultTable = dataTable.Clone();
            for (var i = 1; i <= maxParts; i++)
                resultTable.Columns.Add($"{prefix}{i}", typeof(string));

            for (var i = 0; i < dataTable.Rows.Count; i++)
            {
                var newRow = resultTable.NewRow();
                foreach (DataColumn column in dataTable.Columns)
                    newRow[column.ColumnName] = dataTable.Rows[i][column.ColumnName];
                var parts = partsPerRow[i];
                for (var j = 0; j < parts.Count; j++)
                    newRow[$"{prefix}{j + 1}"] = parts[j];
                resultTable.Rows.Add(newRow);
            }

            SplitDataTable.Set(context, resultTable);
            status = $"Successfully split column '{sourceColumn}' into up to {maxParts} columns.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            SplitDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error splitting text to columns: {ex.Message}");
        }
    }

    private static List<string> SplitValue(string? value, TextSplitByEnum splitBy, string delimiter, int chunkLength)
    {
        if (string.IsNullOrEmpty(value))
            return new List<string>();
        if (splitBy == TextSplitByEnum.Delimiter)
            return value.Split(new[] { delimiter }, StringSplitOptions.None).ToList();
        if (chunkLength <= 0)
            throw new ArgumentException("Chunk Length must be greater than zero.");
        var chunks = new List<string>();
        for (var i = 0; i < value.Length; i += chunkLength)
            chunks.Add(value.Substring(i, Math.Min(chunkLength, value.Length - i)));
        return chunks;
    }
}
