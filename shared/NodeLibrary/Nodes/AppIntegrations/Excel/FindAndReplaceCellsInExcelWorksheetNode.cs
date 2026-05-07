using NodeLibrary.ExcelNodes.Enums;
using Excel = Microsoft.Office.Interop.Excel;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Find and Replace Cells in Excel Worksheet"), Description("Finds and replaces values in a specified range within an Excel worksheet.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class FindAndReplaceCellsInExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet in which to perform find and replace.")]
    public required InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

    [DisplayName("Find What"), Description("The text to find in the worksheet.")]
    public required InArgument<string> FindWhat { get; set; }

    [DisplayName("Replace With"), Description("The text to replace found values with.")]
    public required InArgument<string> ReplaceWith { get; set; }

    [DisplayName("Search Mode"), Description("Specifies where to search: All Cells, or Range of Cells.")]
    public InArgument<ExcelSearchModeEnum> SearchMode { get; set; } = new InArgument<ExcelSearchModeEnum>(ExcelSearchModeEnum.AllCells);

    [DisplayName("Start Column"), Description("The starting column of the range to search.")]
    [RenderIfCondition(nameof(SearchMode), ExcelSearchModeEnum.RangeOfCells)]
    public InArgument<string> StartColumn { get; set; } = new InArgument<string>();

    [DisplayName("Start Row"), Description("The starting row of the range to search.")]
    [RenderIfCondition(nameof(SearchMode), ExcelSearchModeEnum.RangeOfCells)]
    public InArgument<int> StartRow { get; set; } = new InArgument<int>();

    [DisplayName("End Column"), Description("The ending column of the range to search.")]
    [RenderIfCondition(nameof(SearchMode), ExcelSearchModeEnum.RangeOfCells)]
    public InArgument<string> EndColumn { get; set; } = new InArgument<string>();

    [DisplayName("End Row"), Description("The ending row of the range to search.")]
    [RenderIfCondition(nameof(SearchMode), ExcelSearchModeEnum.RangeOfCells)]
    public InArgument<int> EndRow { get; set; } = new InArgument<int>();

    [DisplayName("Match Case"), Description("Whether the search should be case-sensitive.")]
    public InArgument<bool> MatchCase { get; set; } = new InArgument<bool>(false);

    [DisplayName("Match Entire Cell"), Description("Whether to match the entire cell contents.")]
    public InArgument<bool> MatchEntireCell { get; set; } = new InArgument<bool>(false);

    [DisplayName("Replaced Count"), Description("The number of replacements made.")]
    public OutArgument<int> ReplacedCount { get; set; } = new OutArgument<int>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var worksheet = WorksheetInstance.Get(context);
            var findWhat = FindWhat.Get(context);
            var replaceWith = ReplaceWith.Get(context);
            var searchMode = SearchMode.Get(context);
            var matchCase = MatchCase.Get(context);
            var matchEntireCell = MatchEntireCell.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            if (string.IsNullOrEmpty(findWhat))
                throw new ArgumentException("Find text cannot be empty.");

            Excel.Range searchRange;
            if (searchMode == ExcelSearchModeEnum.RangeOfCells)
            {
                var startColStr = StartColumn.Get(context);
                var endColStr = EndColumn.Get(context);
                var startRow = StartRow.Get(context);
                var endRow = EndRow.Get(context);
                int startCol = GetColumnIndex(startColStr);
                int endCol = GetColumnIndex(endColStr);
                searchRange = worksheet.Range[worksheet.Cells[startRow, startCol], worksheet.Cells[endRow, endCol]];
            }
            else
            {
                searchRange = worksheet.UsedRange;
            }

            Excel.XlLookAt lookAt = matchEntireCell ? Excel.XlLookAt.xlWhole : Excel.XlLookAt.xlPart;

            bool replaced = searchRange.Replace(
                What: findWhat,
                Replacement: replaceWith,
                LookAt: lookAt,
                MatchCase: matchCase);

            ReplacedCount.Set(context, replaced ? 1 : 0);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, replaced
                ? $"Successfully replaced occurrences of '{findWhat}' with '{replaceWith}'."
                : $"No occurrences of '{findWhat}' found.");
        }
        catch (Exception ex)
        {
            ReplacedCount.Set(context, 0);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error during find and replace: {ex.Message}");
        }
    }

    private static int GetColumnIndex(string columnName)
    {
        if (string.IsNullOrEmpty(columnName)) return -1;
        if (int.TryParse(columnName, out int num)) return num;
        columnName = columnName.ToUpperInvariant();
        return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
    }
}
