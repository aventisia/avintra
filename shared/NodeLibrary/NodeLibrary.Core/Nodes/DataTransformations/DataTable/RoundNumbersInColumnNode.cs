using System.Data;
using NodeLibrary.DataTableNodes.Enums;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Round Numbers in Column"), Description("Rounds the numeric values of a column to a fixed number of decimal places, significant digits, or to whole numbers.")]
[NodeMetadata(icon: "/assets/DataTable.svg", badge: "Beta")]
public class RoundNumbersInColumnNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table containing the numeric column to round.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Column"), Description("The name of the numeric column to round.")]
    public required InArgument<string> Column { get; set; }

    [DisplayName("Round Mode"), Description("Whether to round to an integer, decimal places, or significant digits.")]
    public required InArgument<RoundModeEnum> RoundMode { get; set; } = new InArgument<RoundModeEnum>(RoundModeEnum.DecimalPlaces);

    [DisplayName("Precision"), Description("The number of decimal places or significant digits to round to.")]
    public InArgument<int> Precision { get; set; } = new InArgument<int>(2);

    [DisplayName("Updated Data Table"), Description("The data table with the rounded column values.")]
    public OutArgument<DataTable> UpdatedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var column = Column.Get(context);
            var roundMode = RoundMode.Get(context);
            var precision = Precision.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(column))
                throw new ArgumentException("Column cannot be empty.");
            if (!dataTable.Columns.Contains(column))
                throw new ArgumentException($"Column '{column}' does not exist in the data table.");
            if (precision < 0)
                throw new ArgumentException("Precision cannot be negative.");

            var resultTable = dataTable.Copy();
            foreach (DataRow row in resultTable.Rows)
            {
                var value = row[column];
                if (value == null || value == DBNull.Value)
                    continue;
                if (!decimal.TryParse(value.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var number))
                    continue;
                row[column] = Round(number, roundMode, precision);
            }

            UpdatedDataTable.Set(context, resultTable);
            status = $"Successfully rounded column '{column}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            UpdatedDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error rounding column: {ex.Message}");
        }
    }

    private static object Round(decimal number, RoundModeEnum mode, int precision)
    {
        switch (mode)
        {
            case RoundModeEnum.Integer:
                return Math.Round(number, MidpointRounding.AwayFromZero);
            case RoundModeEnum.DecimalPlaces:
                return Math.Round(number, precision, MidpointRounding.AwayFromZero);
            case RoundModeEnum.SignificantDigits:
                {
                    if (number == 0)
                        return 0m;
                    var magnitude = (int)Math.Floor(Math.Log10(Math.Abs((double)number))) + 1;
                    var decimals = Math.Max(0, precision - magnitude);
                    return Math.Round(number, decimals, MidpointRounding.AwayFromZero);
                }
            default:
                throw new ArgumentOutOfRangeException(nameof(mode));
        }
    }
}
