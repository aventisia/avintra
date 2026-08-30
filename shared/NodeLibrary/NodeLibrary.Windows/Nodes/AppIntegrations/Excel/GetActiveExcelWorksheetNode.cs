
namespace NodeLibrary.ExcelNodes;

[DisplayName("Get Active Excel Worksheet"), Description("Gets the currently active worksheet from the specified Excel workbook instance.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class GetActiveExcelWorksheetNode : BaseNode
{
    [DisplayName("Workbook Instance"), Description("The Excel Workbook from which to get the active worksheet.")]
    public required InArgument<object> WorkbookInstance { get; set; }

    [DisplayName("Active Worksheet"), Description("The currently active worksheet in the workbook.")]
    public OutArgument<object> ActiveWorksheet { get; set; } = new OutArgument<object>();

    [DisplayName("Worksheet Name"), Description("The name of the active worksheet.")]
    public OutArgument<string> WorksheetName { get; set; } = new OutArgument<string>();

    [DisplayName("Worksheet Index"), Description("The index of the active worksheet.")]
    public OutArgument<int> WorksheetIndex { get; set; } = new OutArgument<int>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic? workbook = WorkbookInstance.Get(context);

            if (workbook == null)
                throw new InvalidOperationException("Workbook instance cannot be null.");

            var activeSheet = workbook.ActiveSheet;

            if (activeSheet == null)
                throw new InvalidOperationException("No active worksheet found in the workbook.");

            ActiveWorksheet.Set(context, activeSheet);
            WorksheetName.Set(context, activeSheet.Name);
            WorksheetIndex.Set(context, activeSheet.Index);

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Active worksheet is '{activeSheet.Name}' (Index: {activeSheet.Index}).");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error getting active worksheet: {ex.Message}");
        }
    }
}





