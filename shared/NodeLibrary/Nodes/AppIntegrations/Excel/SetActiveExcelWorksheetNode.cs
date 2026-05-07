using NodeLibrary.ExcelNodes.Enums;
using Excel = Microsoft.Office.Interop.Excel;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Set Active Excel Worksheet"), Description("Sets the active (selected) worksheet in an Excel workbook by name or index.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class SetActiveExcelWorksheetNode : BaseNode
{
    [DisplayName("Workbook Instance"), Description("The Excel Workbook in which to set the active worksheet.")]
    public required InArgument<Excel.Workbook> WorkbookInstance { get; set; }

    [DisplayName("Activate Mode"), Description("Specifies how to identify the worksheet: by Name or by Index.")]
    public required InArgument<WorksheetSelectionTypeEnum> ActivateMode { get; set; }

    [DisplayName("Worksheet Name"), Description("The name of the worksheet to activate.")]
    [RenderIfCondition(nameof(ActivateMode), WorksheetSelectionTypeEnum.Name)]
    public InArgument<string> WorksheetName { get; set; } = new InArgument<string>();

    [DisplayName("Worksheet Index"), Description("The 1-based index of the worksheet to activate.")]
    [RenderIfCondition(nameof(ActivateMode), WorksheetSelectionTypeEnum.Index)]
    public InArgument<int> WorksheetIndex { get; set; } = new InArgument<int>();

    [DisplayName("Activated Worksheet"), Description("The worksheet that was activated.")]
    public OutArgument<Excel.Worksheet> ActivatedWorksheet { get; set; } = new OutArgument<Excel.Worksheet>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var workbook = WorkbookInstance.Get(context);
            var activateMode = ActivateMode.Get(context);

            if (workbook == null)
                throw new InvalidOperationException("Workbook instance cannot be null.");

            Excel.Worksheet targetSheet = null;

            switch (activateMode)
            {
                case WorksheetSelectionTypeEnum.Name:
                    {
                        var name = WorksheetName.Get(context);
                        if (string.IsNullOrWhiteSpace(name))
                            throw new ArgumentException("Worksheet name cannot be empty.");
                        foreach (Excel.Worksheet ws in workbook.Worksheets)
                        {
                            if (ws.Name.Equals(name, StringComparison.OrdinalIgnoreCase))
                            {
                                targetSheet = ws;
                                break;
                            }
                        }
                        if (targetSheet == null)
                            throw new InvalidOperationException($"Worksheet '{name}' not found.");
                        break;
                    }

                case WorksheetSelectionTypeEnum.Index:
                    {
                        var index = WorksheetIndex.Get(context);
                        if (index < 1 || index > workbook.Worksheets.Count)
                            throw new ArgumentOutOfRangeException(nameof(WorksheetIndex), $"Index must be between 1 and {workbook.Worksheets.Count}.");
                        targetSheet = (Excel.Worksheet)workbook.Worksheets[index];
                        break;
                    }

                default:
                    throw new ArgumentOutOfRangeException(nameof(activateMode));
            }

            targetSheet.Activate();
            ActivatedWorksheet.Set(context, targetSheet);

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
