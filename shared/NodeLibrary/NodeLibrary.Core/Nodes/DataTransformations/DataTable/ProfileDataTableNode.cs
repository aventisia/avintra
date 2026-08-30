using System.Data;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Profile Data Table"), Description("Generates a data-quality summary per column, including row count, null count, distinct count, and min/max values.")]
[NodeMetadata(icon: "/assets/DataTable.svg", badge: "Beta")]
public class ProfileDataTableNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to profile.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Profile Data Table"), Description("The resulting profile summary data table with one row per column.")]
    public OutArgument<DataTable> ProfileDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");

            var profileTable = new DataTable();
            profileTable.Columns.Add("Column Name", typeof(string));
            profileTable.Columns.Add("Data Type", typeof(string));
            profileTable.Columns.Add("Row Count", typeof(long));
            profileTable.Columns.Add("Null Count", typeof(long));
            profileTable.Columns.Add("Distinct Count", typeof(long));
            profileTable.Columns.Add("Minimum", typeof(string));
            profileTable.Columns.Add("Maximum", typeof(string));

            foreach (DataColumn column in dataTable.Columns)
            {
                var values = dataTable.AsEnumerable()
                    .Select(row => row[column.ColumnName])
                    .Where(v => v != null && v != DBNull.Value)
                    .ToList();
                var nullCount = dataTable.Rows.Count - values.Count;
                var distinctCount = values.Select(v => v.ToString()).Distinct().Count();

                string? min = null, max = null;
                var decimals = new List<decimal>();
                foreach (var v in values)
                {
                    if (decimal.TryParse(v.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var d))
                        decimals.Add(d);
                }
                if (decimals.Count > 0)
                {
                    min = decimals.Min().ToString(CultureInfo.InvariantCulture);
                    max = decimals.Max().ToString(CultureInfo.InvariantCulture);
                }
                else
                {
                    var stringValues = values.Select(v => v.ToString()).ToList();
                    if (stringValues.Count > 0)
                    {
                        min = stringValues.Min();
                        max = stringValues.Max();
                    }
                }

                profileTable.Rows.Add(
                    column.ColumnName,
                    column.DataType.Name,
                    dataTable.Rows.Count,
                    nullCount,
                    distinctCount,
                    (object?)min ?? DBNull.Value,
                    (object?)max ?? DBNull.Value);
            }

            ProfileDataTable.Set(context, profileTable);
            status = $"Successfully profiled {dataTable.Columns.Count} columns.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ProfileDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error profiling data table: {ex.Message}");
        }
    }
}
