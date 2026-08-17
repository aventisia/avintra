using NodeLibrary.ExcelNodes.Enums;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Set Active Excel Worksheet"), Description("Sets the active (selected) worksheet in an Excel workbook by name or index.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class SetActiveExcelWorksheetNode : BaseNode
{
    [DisplayName("Workbook Instance"), Description("The Excel Workbook in which to set the active worksheet.")]
    public required InArgument<object> WorkbookInstance { get; set; }

    [DisplayName("Selection Type"), Description("Specifies how to identify the worksheet: by Name or by Index.")]
    public required InArgument<WorksheetSelectionTypeEnum> SelectionType { get; set; }

    [DisplayName("Search Value"), Description("The worksheet name (if selection type is 'Name') or 1-based index (if selection type is 'Index').")]
    public InArgument<string> SearchValue { get; set; } = new InArgument<string>();

    [DisplayName("Worksheet Instance"), Description("The worksheet that was activated.")]
    public OutArgument<object> WorksheetInstance { get; set; } = new OutArgument<object>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic workbook = WorkbookInstance.Get(context);

            if (workbook == null)
                throw new InvalidOperationException("Workbook instance cannot be null.");

            var selectionType = SelectionType.Get(context);
            var searchValue = SearchValue.Get(context);

            if (string.IsNullOrWhiteSpace(searchValue))
                throw new ArgumentException("Search value cannot be empty.");

            dynamic targetSheet = null;

            switch (selectionType)
            {
                case WorksheetSelectionTypeEnum.Name:
                    {
                        foreach (var ws in workbook.Worksheets)
                        {
                            if (ws.Name.Equals(searchValue, StringComparison.OrdinalIgnoreCase))
                            {
                                targetSheet = ws;
                                break;
                            }
                        }
                        if (targetSheet == null)
                            throw new InvalidOperationException($"Worksheet '{searchValue}' not found.");
                        break;
                    }

                case WorksheetSelectionTypeEnum.Index:
                    {
                        if (!int.TryParse(searchValue, out var index))
                            throw new ArgumentException("Worksheet index must be a valid number.");
                        if (index < 1 || index > workbook.Worksheets.Count)
                            throw new ArgumentOutOfRangeException(nameof(SearchValue), $"Index must be between 1 and {workbook.Worksheets.Count}.");
                        targetSheet = workbook.Worksheets[index];
                        break;
                    }

                default:
                    throw new ArgumentOutOfRangeException(nameof(selectionType));
            }

            targetSheet.Activate();
            WorksheetInstance.Set(context, targetSheet);

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully activated worksheet '{targetSheet.Name}'.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error activating worksheet: {ex.Message}");
        }
    }
}





