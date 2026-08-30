using System.Data;
using System.Text.Json.Nodes;

namespace NodeLibrary.JsonNodes;

[DisplayName("Convert JSON Array to Data Table"), Description("Converts a JSON array of objects into a data table, using the keys as columns.")]
[NodeMetadata(icon: "/assets/JSON.svg", badge: "Beta")]
public class ConvertJsonArrayToDataTableNode : BaseNode
{
    [DisplayName("JSON Array"), Description("The JSON array of objects to convert into a data table.")]
    public required InArgument<JsonArray> JsonArray { get; set; }

    [DisplayName("Data Table"), Description("The resulting data table built from the JSON array.")]
    public OutArgument<DataTable> DataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var jsonArray = JsonArray.Get(context);
            if (jsonArray == null)
                throw new ArgumentException("JSON array cannot be null.");

            var objects = jsonArray.Where(n => n is JsonObject).Cast<JsonObject>().ToList();
            var columnNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var obj in objects)
            {
                foreach (var prop in obj)
                    columnNames.Add(prop.Key);
            }

            var table = new DataTable();
            foreach (var col in columnNames.OrderBy(c => c))
                table.Columns.Add(col, typeof(string));

            foreach (var obj in objects)
            {
                var row = table.NewRow();
                foreach (DataColumn column in table.Columns)
                {
                    if (obj.TryGetPropertyValue(column.ColumnName, out var value))
                    {
                        row[column.ColumnName] = value != null ? value.ToJsonString() : DBNull.Value;
                    }
                    else
                    {
                        row[column.ColumnName] = DBNull.Value;
                    }
                }
                table.Rows.Add(row);
            }

            DataTable.Set(context, table);
            status = $"Successfully converted JSON array into data table with {table.Rows.Count} rows.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            DataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error converting JSON array to data table: {ex.Message}");
        }
    }
}
