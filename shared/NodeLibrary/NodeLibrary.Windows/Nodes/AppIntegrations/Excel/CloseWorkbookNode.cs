
using NodeLibrary.Office;
namespace NodeLibrary.ExcelNodes;

[DisplayName("Close Excel Workbook"), Description("Closes the specified Excel workbook and optionally quits the Excel application.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class CloseWorkbookNode : BaseNode
{
    [DisplayName("Workbook Instance"), Description("The Excel Workbook instance to be closed.")]
    public required InArgument<object> WorkbookInstance { get; set; }

    [DisplayName("Excel Application Instance"), Description("The Excel Application instance to optionally quit after closing the workbook.")]
    [RenderIfCondition(nameof(QuitExcelApp), true)]
    public InArgument<object> ExcelApp { get; set; } = new InArgument<object>();

    [DisplayName("Save Before Closing"), Description("Whether to save the workbook before closing.")]
    public InArgument<bool> SaveBeforeClose { get; set; } = new InArgument<bool>(true);

    [DisplayName("Quit Excel Application"), Description("Whether to quit the Excel Application after closing the workbook.")]
    public InArgument<bool> QuitExcelApp { get; set; } = new InArgument<bool>(true);

    protected override void Execute(INodeContext context)
    {
        dynamic? workbook = null;
        dynamic? excelApp = null;

        try
        {
            workbook = WorkbookInstance.Get(context);
            excelApp = ExcelApp.Get(context);
            var saveBeforeClose = SaveBeforeClose.Get(context);
            var quitApp = QuitExcelApp.Get(context);

            if (workbook == null)
                throw new InvalidOperationException("Workbook instance is null or invalid.");

            workbook.Close(saveBeforeClose);
            OfficeAutomationHelper.Release(workbook);
            workbook = null;

            if (excelApp is not null && quitApp)
            {
                excelApp.Quit();
                OfficeAutomationHelper.Release(excelApp);
                excelApp = null;
            }

            GC.Collect();
            GC.WaitForPendingFinalizers();

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Workbook closed successfully.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error closing workbook: {ex.Message}");
        }
    }
}






