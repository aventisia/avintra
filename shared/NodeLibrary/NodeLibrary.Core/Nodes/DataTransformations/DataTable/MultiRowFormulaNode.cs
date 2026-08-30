using System.Data;
using NodeLibrary.DataTableNodes.Enums;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Multi-Row Formula"), Description("Computes a new column by referencing rows before or after the current row, e.g., running totals or moving averages.")]
[NodeMetadata(icon: "/assets/DataTable.svg", badge: "Beta")]
public class MultiRowFormulaNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table on which the multi-row formula is applied.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Source Column"), Description("The name of the column used as input for the formula.")]
    public required InArgument<string> SourceColumn { get; set; }

    [DisplayName("Formula Type"), Description("The type of multi-row computation to perform.")]
    public required InArgument<MultiRowFormulaTypeEnum> FormulaType { get; set; } = new InArgument<MultiRowFormulaTypeEnum>(MultiRowFormulaTypeEnum.RunningTotal);

    [DisplayName("Rows"), Description("The number of rows to look back (or forward) for Previous/Next/Difference/Moving Average.")]
    public InArgument<int> Rows { get; set; } = new InArgument<int>(1);

    [DisplayName("Result Column Name"), Description("The name of the output column. Defaults to the source column name.")]
    public InArgument<string> ResultColumnName { get; set; } = new InArgument<string>();

    [DisplayName("Updated Data Table"), Description("The data table with the multi-row formula column appended.")]
    public OutArgument<DataTable> UpdatedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var sourceColumn = SourceColumn.Get(context);
            var formulaType = FormulaType.Get(context);
            var rows = Rows.Get(context);
            var resultColumnName = ResultColumnName.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(sourceColumn))
                throw new ArgumentException("Source Column cannot be empty.");
            if (!dataTable.Columns.Contains(sourceColumn))
                throw new ArgumentException($"Column '{sourceColumn}' does not exist in the data table.");
            if (rows < 0)
                throw new ArgumentException("Rows cannot be negative.");

            var resultColumn = string.IsNullOrWhiteSpace(resultColumnName) ? sourceColumn + "Result" : resultColumnName.Trim();
            var resultTable = dataTable.Copy();
            if (resultTable.Columns.Contains(resultColumn))
                throw new ArgumentException($"A column named '{resultColumn}' already exists in the data table.");
            resultTable.Columns.Add(resultColumn, typeof(object));

            var values = resultTable.Rows.Cast<DataRow>()
                .Select(row => TryGetDecimal(row[sourceColumn]))
                .ToList();

            for (var i = 0; i < values.Count; i++)
            {
                var computed = Compute(values, formulaType, rows, i);
                resultTable.Rows[i][resultColumn] = computed.HasValue ? (object)computed.Value : DBNull.Value;
            }

            UpdatedDataTable.Set(context, resultTable);
            status = $"Successfully applied multi-row formula to column '{sourceColumn}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            UpdatedDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error computing multi-row formula: {ex.Message}");
        }
    }

    private static decimal? TryGetDecimal(object? value)
    {
        if (value == null || value == DBNull.Value)
            return null;
        if (decimal.TryParse(value.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var d))
            return d;
        return null;
    }

    private static decimal? Compute(List<decimal?> values, MultiRowFormulaTypeEnum type, int rows, int index)
    {
        switch (type)
        {
            case MultiRowFormulaTypeEnum.RunningTotal:
                return values.Take(index + 1).Where(v => v.HasValue).Sum(v => v.Value);
            case MultiRowFormulaTypeEnum.PreviousValue:
                {
                    var target = index - rows;
                    return target >= 0 ? values[target] : null;
                }
            case MultiRowFormulaTypeEnum.NextValue:
                {
                    var target = index + rows;
                    return target < values.Count ? values[target] : null;
                }
            case MultiRowFormulaTypeEnum.DifferenceFromPrevious:
                {
                    var target = index - rows;
                    if (target < 0 || !values[index].HasValue || !values[target].HasValue)
                        return null;
                    return values[index]!.Value - values[target]!.Value;
                }
            case MultiRowFormulaTypeEnum.MovingAverage:
                {
                    if (rows <= 0)
                        rows = 1;
                    var start = Math.Max(0, index - rows);
                    var window = values.Skip(start).Take(index - start + 1).Where(v => v.HasValue).ToList();
                    return window.Count == 0 ? null : window.Average(v => v.Value);
                }
            default:
                throw new ArgumentOutOfRangeException(nameof(type));
        }
    }
}
