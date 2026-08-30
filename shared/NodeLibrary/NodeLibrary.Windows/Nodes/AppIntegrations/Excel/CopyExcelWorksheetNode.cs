using NodeLibrary.ExcelNodes.Enums;

using NodeLibrary.Office;
namespace NodeLibrary.ExcelNodes;

[DisplayName("Copy Excel Worksheet"), Description("Copies a worksheet to another workbook or within the same workbook, preserving data, formatting, and structure.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class CopyExcelWorksheetNode : BaseNode
{
    [DisplayName("Source Workbook"), Description("The Excel Workbook object containing the worksheet to copy.")]
    public required InArgument<object> SourceWorkbook { get; set; }

    [DisplayName("Copy Mode"), Description("Specifies how to identify the worksheet to copy (by Name or by Index).")]
    public required InArgument<WorksheetCopyModeEnum> CopyMode { get; set; } = new InArgument<WorksheetCopyModeEnum>(WorksheetCopyModeEnum.Name);

    [DisplayName("Worksheet Name"), Description("The name of the worksheet to copy (required if 'Copy Mode' is 'Name').")]
    [RenderIfCondition(nameof(CopyMode), WorksheetCopyModeEnum.Name)]
    public InArgument<string> WorksheetName { get; set; } = new InArgument<string>();

    [DisplayName("Worksheet Index"), Description("The index of the worksheet to copy (required if 'Copy Mode' is 'Index').")]
    [RenderIfCondition(nameof(CopyMode), WorksheetCopyModeEnum.Index)]
    public InArgument<int> WorksheetIndex { get; set; } = new InArgument<int>();

    [DisplayName("Target Workbook"), Description("The Excel Workbook where the worksheet will be copied. If not provided, the copy will be made within the same workbook.")]
    public InArgument<object> TargetWorkbook { get; set; } = new InArgument<object>();

    [DisplayName("Paste Position"), Description("Specifies where to paste the copied worksheet in the target workbook.")]
    public InArgument<WorksheetPastePositionEnum> PastePosition { get; set; } = new InArgument<WorksheetPastePositionEnum>(WorksheetPastePositionEnum.LastWorksheet);

    [DisplayName("Copied Worksheet"), Description("The new worksheet created as a result of the copy operation.")]
    public OutArgument<object> CopiedWorksheet { get; set; } = new OutArgument<object>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic? sourceWorkbook = SourceWorkbook.Get(context);
            dynamic? targetWorkbook = TargetWorkbook.Get(context);
            var copyMode = CopyMode.Get(context);
            var pastePosition = PastePosition.Get(context);

            if (sourceWorkbook == null)
                throw new ArgumentNullException(nameof(SourceWorkbook), "Source workbook cannot be null.");

            dynamic? sourceSheet = null;

            if (copyMode == WorksheetCopyModeEnum.Name)
            {
                var name = WorksheetName.Get(context) ?? string.Empty;
                if (string.IsNullOrWhiteSpace(name))
                    throw new ArgumentException("Worksheet name must be provided when CopyMode is 'Name'.");
                sourceSheet = GetSheetByName(sourceWorkbook, name);
                if (sourceSheet == null)
                    throw new InvalidOperationException($"No worksheet found with name '{name}'.");
            }
            else if (copyMode == WorksheetCopyModeEnum.Index)
            {
                var index = WorksheetIndex.Get(context);
                if (index <= 0 || index > sourceWorkbook.Worksheets.Count)
                    throw new ArgumentOutOfRangeException(nameof(WorksheetIndex), "Invalid worksheet index.");
                sourceSheet = sourceWorkbook.Worksheets[index];
            }

            if (sourceSheet == null)
                throw new InvalidOperationException("Unable to locate the source worksheet.");

            targetWorkbook ??= sourceWorkbook;

            dynamic targetSheet = targetWorkbook.Worksheets.Add();

            string newName = sourceSheet.Name;
            int counter = 1;
            while (SheetExists(targetWorkbook, newName))
                newName = $"{sourceSheet.Name} ({counter++})";
            targetSheet.Name = newName;

            dynamic sourceRange = sourceSheet.UsedRange;
            dynamic targetRange = targetSheet.Range["A1"].Resize[sourceRange.Rows.Count, sourceRange.Columns.Count];
            targetRange.Value2 = sourceRange.Value2;

            sourceRange.Copy();
            targetRange.PasteSpecial(OfficeConstants.XlPasteFormats);

            for (int i = 1; i <= sourceRange.Columns.Count; i++)
                (targetSheet.Columns[i]).ColumnWidth = (sourceSheet.Columns[i]).ColumnWidth;

            for (int i = 1; i <= sourceRange.Rows.Count; i++)
                (targetSheet.Rows[i]).RowHeight = (sourceSheet.Rows[i]).RowHeight;

            if (pastePosition == WorksheetPastePositionEnum.FirstWorksheet)
                targetSheet.Move(Before: targetWorkbook.Worksheets[1]);
            else if (pastePosition == WorksheetPastePositionEnum.LastWorksheet)
                targetSheet.Move(After: targetWorkbook.Worksheets[targetWorkbook.Worksheets.Count]);

            CopiedWorksheet.Set(context, targetSheet);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully copied worksheet '{sourceSheet.Name}' as '{targetSheet.Name}'.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error copying worksheet: {ex.Message}");
        }
    }

    private dynamic? GetSheetByName(dynamic workbook, string sheetName)
    {
        foreach (var sheet in workbook.Worksheets)
            if (sheet.Name.Equals(sheetName, StringComparison.OrdinalIgnoreCase))
                return sheet;
        return null;
    }

    private bool SheetExists(dynamic workbook, string sheetName)
    {
        foreach (var sheet in workbook.Worksheets)
            if (sheet.Name.Equals(sheetName, StringComparison.OrdinalIgnoreCase))
                return true;
        return false;
    }
}






