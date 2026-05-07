using System.Runtime.InteropServices;
using Excel = Microsoft.Office.Interop.Excel;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Close Excel Workbook"), Description("Closes the specified Excel workbook and optionally quits the Excel application.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class CloseWorkbookNode : BaseNode
{
    [DisplayName("Workbook Instance"), Description("The Excel Workbook instance to be closed.")]
    public required InArgument<Excel.Workbook> WorkbookInstance { get; set; }

    [DisplayName("Excel Application Instance"), Description("The Excel Application instance to optionally quit after closing the workbook.")]
    [RenderIfCondition(nameof(QuitExcelApp), true)]
    public InArgument<Excel.Application> ExcelApp { get; set; } = new InArgument<Excel.Application>();

    [DisplayName("Save Before Closing"), Description("Whether to save the workbook before closing.")]
    public InArgument<bool> SaveBeforeClose { get; set; } = new InArgument<bool>(true);

    [DisplayName("Quit Excel Application"), Description("Whether to quit the Excel Application after closing the workbook.")]
    public InArgument<bool> QuitExcelApp { get; set; } = new InArgument<bool>(true);

    protected override void Execute(INodeContext context)
    {
        var status = "Success";
        Excel.Workbook workbook = null;
        Excel.Application excelApp = null;

        try
        {
            workbook = WorkbookInstance.Get(context);
            excelApp = ExcelApp.Get(context);
            var saveBeforeClose = SaveBeforeClose.Get(context);
            var quitApp = QuitExcelApp.Get(context);

            if (workbook == null)
                throw new InvalidOperationException("Workbook instance is null or invalid.");

            workbook.Close(saveBeforeClose);
            Marshal.ReleaseComObject(workbook);
            workbook = null;

            if (excelApp != null && quitApp)
            {
                excelApp.Quit();
                Marshal.ReleaseComObject(excelApp);
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
