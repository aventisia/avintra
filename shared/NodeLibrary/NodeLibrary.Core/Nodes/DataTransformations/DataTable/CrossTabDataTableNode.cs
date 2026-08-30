using System.Data;
using NodeLibrary.DataTableNodes.Enums;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Cross Tab Data Table"), Description("Pivots a data table so that values in a column become new columns (wide format), with an aggregation applied per group.")]
[NodeMetadata(icon: "/assets/DataTable.svg", badge: "Beta")]
public class CrossTabDataTableNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to pivot.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Group By Columns"), Description("Comma-separated column names that remain as rows after pivoting.")]
    public required InArgument<string> GroupByColumns { get; set; }

    [DisplayName("Pivot Column"), Description("The column whose distinct values become the new column names.")]
    public required InArgument<string> PivotColumn { get; set; }

    [DisplayName("Value Column"), Description("The column whose values populate the pivoted cells.")]
    public required InArgument<string> ValueColumn { get; set; }

    [DisplayName("Aggregation"), Description("The aggregation to apply when multiple values map to the same cell.")]
    public required InArgument<AggregateOperationEnum> Aggregation { get; set; } = new InArgument<AggregateOperationEnum>(AggregateOperationEnum.Sum);

    [DisplayName("Cross Tabled Data Table"), Description("The resulting pivoted data table.")]
    public OutArgument<DataTable> CrossTabledDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var groupByColumns = GroupByColumns.Get(context);
            var pivotColumn = PivotColumn.Get(context);
            var valueColumn = ValueColumn.Get(context);
            var aggregation = Aggregation.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(groupByColumns))
                throw new ArgumentException("Group By Columns cannot be empty.");
            if (string.IsNullOrWhiteSpace(pivotColumn))
                throw new ArgumentException("Pivot Column cannot be empty.");
            if (string.IsNullOrWhiteSpace(valueColumn))
                throw new ArgumentException("Value Column cannot be empty.");
            if (!dataTable.Columns.Contains(pivotColumn))
                throw new ArgumentException($"Pivot column '{pivotColumn}' does not exist in the data table.");
            if (!dataTable.Columns.Contains(valueColumn))
                throw new ArgumentException($"Value column '{valueColumn}' does not exist in the data table.");

            var groupCols = groupByColumns
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .ToList();
            foreach (var g in groupCols)
            {
                if (!dataTable.Columns.Contains(g))
                    throw new ArgumentException($"Group By column '{g}' does not exist in the data table.");
            }

            var pivotValues = dataTable.AsEnumerable()
                .Select(row => row[pivotColumn]?.ToString() ?? "")
                .Where(v => v.Length > 0)
                .Distinct()
                .OrderBy(v => v)
                .ToList();

            var resultTable = new DataTable();
            foreach (var g in groupCols)
                resultTable.Columns.Add(g, typeof(object));
            foreach (var pv in pivotValues)
                resultTable.Columns.Add(pv, typeof(object));

            var groups = dataTable.AsEnumerable().GroupBy(row => string.Join("\u0001", groupCols.Select(c => row[c]?.ToString() ?? "")));
            foreach (var group in groups)
            {
                var newRow = resultTable.NewRow();
                var keys = group.Key.Split('\u0001');
                for (var i = 0; i < groupCols.Count; i++)
                    newRow[groupCols[i]] = keys[i];

                foreach (var pv in pivotValues)
                {
                    var cellValues = group
                        .Where(row => (row[pivotColumn]?.ToString() ?? "") == pv)
                        .Select(row => row[valueColumn])
                        .Where(v => v != null && v != DBNull.Value)
                        .ToList();
                    newRow[pv] = Aggregate(cellValues, aggregation);
                }
                resultTable.Rows.Add(newRow);
            }

            CrossTabledDataTable.Set(context, resultTable);
            status = $"Successfully cross-tabbed data table into {resultTable.Rows.Count} rows and {resultTable.Columns.Count} columns.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            CrossTabledDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error cross-tabbing data table: {ex.Message}");
        }
    }

    private static object? Aggregate(List<object> values, AggregateOperationEnum aggregation)
    {
        if (values.Count == 0)
            return null;
        switch (aggregation)
        {
            case AggregateOperationEnum.Count:
                return values.Count;
            case AggregateOperationEnum.CountDistinct:
                return values.Select(v => v.ToString()).Distinct().Count();
            case AggregateOperationEnum.First:
                return values.First();
            case AggregateOperationEnum.Last:
                return values.Last();
            case AggregateOperationEnum.Min:
                return values.Select(v => Convert.ToDecimal(v, CultureInfo.InvariantCulture)).Min();
            case AggregateOperationEnum.Max:
                return values.Select(v => Convert.ToDecimal(v, CultureInfo.InvariantCulture)).Max();
            case AggregateOperationEnum.Sum:
                return values.Select(v => Convert.ToDecimal(v, CultureInfo.InvariantCulture)).Sum();
            case AggregateOperationEnum.Average:
                return values.Select(v => Convert.ToDecimal(v, CultureInfo.InvariantCulture)).Average();
            case AggregateOperationEnum.Median:
                {
                    var decimals = values.Select(v => Convert.ToDecimal(v, CultureInfo.InvariantCulture)).OrderBy(d => d).ToList();
                    var mid = decimals.Count / 2;
                    return decimals.Count % 2 != 0 ? decimals[mid] : (decimals[mid - 1] + decimals[mid]) / 2m;
                }
            case AggregateOperationEnum.StandardDeviation:
                {
                    var decimals = values.Select(v => Convert.ToDecimal(v, CultureInfo.InvariantCulture)).ToList();
                    var avg = decimals.Average();
                    var variance = decimals.Sum(d => (d - avg) * (d - avg)) / (decimals.Count - 1);
                    return Math.Sqrt((double)variance);
                }
            default:
                return values.First();
        }
    }
}
