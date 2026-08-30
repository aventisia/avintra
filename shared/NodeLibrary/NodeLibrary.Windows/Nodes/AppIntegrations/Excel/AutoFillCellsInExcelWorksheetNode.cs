using NodeLibrary.ExcelNodes.Enums;
using NodeLibrary.ExcelNodes.Helpers;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Auto Fill Range in Excel Worksheet"), Description("Copies data from a source range to a target range in the specified or active worksheet of an Excel workbook.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class AutoFillCellsInExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet to use.")]
    public required InArgument<object> WorksheetInstance { get; set; }

    [DisplayName("Ranges Format"), Description("Specifies how ranges are defined: by specific ranges or named cells.")]
    public required InArgument<ExcelRangesFormatEnum> RangesFormat { get; set; } = new InArgument<ExcelRangesFormatEnum>(ExcelRangesFormatEnum.SpecificRanges);

    [DisplayName("Start Column"), Description("The starting column of the source range (e.g., 'A').")]
    [RenderIfCondition(nameof(RangesFormat), ExcelRangesFormatEnum.SpecificRanges)]
    public InArgument<string> StartColumn { get; set; } = new InArgument<string>();

    [DisplayName("Start Row"), Description("The starting row of the source range (e.g., '1').")]
    [RenderIfCondition(nameof(RangesFormat), ExcelRangesFormatEnum.SpecificRanges)]
    public InArgument<int> StartRow { get; set; } = new InArgument<int>();

    [DisplayName("Source End Column"), Description("The ending column of the source range (e.g., 'B').")]
    [RenderIfCondition(nameof(RangesFormat), ExcelRangesFormatEnum.SpecificRanges)]
    public InArgument<string> SourceEndColumn { get; set; } = new InArgument<string>();

    [DisplayName("Source End Row"), Description("The ending row of the source range (e.g., '5').")]
    [RenderIfCondition(nameof(RangesFormat), ExcelRangesFormatEnum.SpecificRanges)]
    public InArgument<int> SourceEndRow { get; set; } = new InArgument<int>();

    [DisplayName("Destination End Column"), Description("The ending column of the target range (e.g., 'C').")]
    [RenderIfCondition(nameof(RangesFormat), ExcelRangesFormatEnum.SpecificRanges)]
    public InArgument<string> DestinationEndColumn { get; set; } = new InArgument<string>();

    [DisplayName("Destination End Row"), Description("The ending row of the target range (e.g., '10').")]
    [RenderIfCondition(nameof(RangesFormat), ExcelRangesFormatEnum.SpecificRanges)]
    public InArgument<int> DestinationEndRow { get; set; } = new InArgument<int>();

    [DisplayName("Source Cells Name"), Description("The name of the named range containing the source data.")]
    [RenderIfCondition(nameof(RangesFormat), ExcelRangesFormatEnum.NamedCells)]
    public InArgument<string> SourceCellsName { get; set; } = new InArgument<string>();

    [DisplayName("Destination Cells Name"), Description("The name of the named range where the data should be pasted.")]
    [RenderIfCondition(nameof(RangesFormat), ExcelRangesFormatEnum.NamedCells)]
    public InArgument<string> DestinationCellsName { get; set; } = new InArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            dynamic? worksheet = WorksheetInstance.Get(context);
            var rangesFormat = RangesFormat.Get(context);

            if (worksheet == null)
            {
                dynamic? excelApp = ComHelper.GetActiveObject("Excel.Application");
                worksheet = excelApp?.ActiveSheet;
            }

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance is not available or invalid.");

            switch (rangesFormat)
            {
                case ExcelRangesFormatEnum.SpecificRanges:
                    {
                        string startColumn = StartColumn.Get(context) ?? string.Empty;
                        int startRow = StartRow.Get(context);
                        string sourceEndColumn = SourceEndColumn.Get(context) ?? string.Empty;
                        int sourceEndRow = SourceEndRow.Get(context);
                        string destinationEndColumn = DestinationEndColumn.Get(context) ?? string.Empty;
                        int destinationEndRow = DestinationEndRow.Get(context);

                        if (string.IsNullOrWhiteSpace(startColumn) ||
                            string.IsNullOrWhiteSpace(sourceEndColumn) ||
                            string.IsNullOrWhiteSpace(destinationEndColumn) ||
                            startRow <= 0 || sourceEndRow <= 0 || destinationEndRow <= 0)
                        {
                            throw new ArgumentException("All fields for Specific Ranges must be specified and valid.");
                        }

                        string sourceRangeStr = $"{startColumn}{startRow}:{sourceEndColumn}{sourceEndRow}";
                        string targetRangeStr = $"{startColumn}{destinationEndRow - (sourceEndRow - startRow)}:{destinationEndColumn}{destinationEndRow}";

                        dynamic sourceRange = worksheet.Range[sourceRangeStr];
                        dynamic targetRange = worksheet.Range[targetRangeStr];

                        if (sourceRange.Value is not object[,] sourceValues)
                            throw new InvalidOperationException($"Source range '{sourceRangeStr}' does not contain valid data.");

                        int rowCount = sourceValues.GetLength(0);
                        int colCount = sourceValues.GetLength(1);

                        for (int i = 1; i <= rowCount; i++)
                            for (int j = 1; j <= colCount; j++)
                                (targetRange.Cells[i, j]).Value = sourceValues[i, j];

                        status += $" Copied data from '{sourceRangeStr}' to '{targetRangeStr}'.";
                        break;
                    }

                case ExcelRangesFormatEnum.NamedCells:
                    {
                        string sourceCellsName = SourceCellsName.Get(context) ?? string.Empty;
                        string destinationCellsName = DestinationCellsName.Get(context) ?? string.Empty;

                        if (string.IsNullOrWhiteSpace(sourceCellsName) || string.IsNullOrWhiteSpace(destinationCellsName))
                            throw new ArgumentException("Both Source Cells Name and Destination Cells Name must be specified.");

                        dynamic sourceRange = worksheet.Names.Item(sourceCellsName).RefersToRange;
                        dynamic targetRange = worksheet.Names.Item(destinationCellsName).RefersToRange;

                        if (sourceRange.Value is not object[,] sourceValues)
                            throw new InvalidOperationException($"Source named range '{sourceCellsName}' does not contain valid data.");

                        int rowCount = sourceValues.GetLength(0);
                        int colCount = sourceValues.GetLength(1);

                        for (int i = 1; i <= rowCount; i++)
                            for (int j = 1; j <= colCount; j++)
                                (targetRange.Cells[i, j]).Value = sourceValues[i, j];

                        status += $" Copied data from named range '{sourceCellsName}' to named range '{destinationCellsName}'.";
                        break;
                    }

                default:
                    throw new ArgumentOutOfRangeException(nameof(rangesFormat));
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error auto-filling cells: {ex.Message}");
        }
    }
}





