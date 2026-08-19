using System.Data;

namespace NodeLibrary.ShapingNodes;

[DisplayName("Add Constant Column"), Description("Adds a new column populated with a constant value on every row. Useful for labelling, filtering, or adding static metadata columns.")]
[NodeMetadata(icon: "/assets/Shaping.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class AddConstantColumnNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to add the constant column to.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("New Column Name"), Description("The name of the new constant column.")]
    public required InArgument<string> NewColumnName { get; set; }

    [DisplayName("Value"), Description("The constant value to write into every row of the new column.")]
    public InArgument<string> Value { get; set; } = new InArgument<string>();

    [DisplayName("Overwrite If Exists"), Description("True to overwrite the column value if the column already exists. Defaults to false.")]
    public InArgument<bool> OverwriteIfExists { get; set; } = new InArgument<bool>(false);

    [DisplayName("Result Data Table"), Description("The resulting data table.")]
    public OutArgument<DataTable> ResultDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var newColumnName = NewColumnName.Get(context);
            var value = Value.Get(context);
            var overwriteIfExists = OverwriteIfExists.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(newColumnName))
                throw new ArgumentException("New Column Name cannot be empty.");

            var result = dataTable.Copy();
            if (result.Columns.Contains(newColumnName))
            {
                if (!overwriteIfExists)
                    throw new ArgumentException($"Column '{newColumnName}' already exists in the data table.");
            }
            else
            {
                result.Columns.Add(newColumnName, typeof(string));
            }

            foreach (var row in result.AsEnumerable())
                row[newColumnName] = value;

            ResultDataTable.Set(context, result);
            status = "Successfully added constant column.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ResultDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error adding constant column: {ex.Message}");
        }
    }
}
