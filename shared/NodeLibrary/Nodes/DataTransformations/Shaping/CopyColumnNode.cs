using System.Data;

namespace NodeLibrary.ShapingNodes;

[DisplayName("Copy Column"), Description("Duplicates an existing column into a new column with the same values. If the target column already exists, it is overwritten.")]
[NodeMetadata(icon: "/assets/Shaping.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class CopyColumnNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table containing the column to copy.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Source Column"), Description("The name of the column to copy.")]
    public required InArgument<string> SourceColumn { get; set; }

    [DisplayName("New Column Name"), Description("The name of the new copied column.")]
    public required InArgument<string> NewColumnName { get; set; }

    [DisplayName("Result Data Table"), Description("The resulting data table.")]
    public OutArgument<DataTable> ResultDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var sourceColumn = SourceColumn.Get(context);
            var newColumnName = NewColumnName.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(sourceColumn) || !dataTable.Columns.Contains(sourceColumn))
                throw new ArgumentException($"Source column '{sourceColumn}' does not exist in the data table.");
            if (string.IsNullOrWhiteSpace(newColumnName))
                throw new ArgumentException("New Column Name cannot be empty.");

            var result = dataTable.Copy();
            if (!result.Columns.Contains(newColumnName))
                result.Columns.Add(newColumnName, result.Columns[sourceColumn].DataType);

            foreach (var row in result.AsEnumerable())
                row[newColumnName] = row[sourceColumn];

            ResultDataTable.Set(context, result);
            status = "Successfully copied column.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ResultDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error copying column: {ex.Message}");
        }
    }
}
