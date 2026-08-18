
using NodeLibrary.ExcelNodes.Helpers;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Read Formula from Excel"), Description("Reads the formula (not the calculated value) from a specified cell in an Excel worksheet.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class ReadFormulaFromExcelNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet from which to read the formula.")]
    public required InArgument<object> WorksheetInstance { get; set; }

    [DisplayName("Column"), Description("The column letter or number of the cell containing the formula.")]
    public required InArgument<string> Column { get; set; }

    [DisplayName("Row"), Description("The row number of the cell containing the formula.")]
    public required InArgument<int> Row { get; set; }

    [DisplayName("Formula"), Description("The formula text from the specified cell.")]
    public OutArgument<string> Formula { get; set; } = new OutArgument<string>();

    [DisplayName("Has Formula"), Description("Indicates whether the cell actually contains a formula.")]
    public OutArgument<bool> HasFormula { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic worksheet = WorksheetInstance.Get(context);
            var columnStr = Column.Get(context);
            var row = Row.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            int colIndex = int.TryParse(columnStr, out int num) ? num : ExcelColumnHelper.GetColumnIndex(columnStr);

            if (colIndex < 1)
                throw new ArgumentException($"Invalid column: '{columnStr}'.");

            var cell = worksheet.Cells[row, colIndex];

            if ((bool)cell.HasFormula)
            {
                Formula.Set(context, cell.Formula?.ToString() ?? string.Empty);
                HasFormula.Set(context, true);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Formula at Row {row}, Column {columnStr}: {cell.Formula}");
            }
            else
            {
                Formula.Set(context, string.Empty);
                HasFormula.Set(context, false);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Cell at Row {row}, Column {columnStr} does not contain a formula.");
            }
        }
        catch (Exception ex)
        {
            Formula.Set(context, string.Empty);
            HasFormula.Set(context, false);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error reading formula: {ex.Message}");
        }
    }
}





