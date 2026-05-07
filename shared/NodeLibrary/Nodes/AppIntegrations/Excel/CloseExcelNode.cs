using NodeLibrary.ExcelNodes.Enums;
using System.Runtime.InteropServices;
using Excel = Microsoft.Office.Interop.Excel;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Close Excel Application"), Description("Closes the active Excel application instance and optionally saves changes.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class CloseExcelNode : BaseNode
{
    [DisplayName("Excel Application"), Description("The Excel Application object to close.")]
    public required InArgument<Excel.Application> ExcelApplication { get; set; }

    [DisplayName("Before Closing Excel"), Description("Specifies what to do before closing Excel.")]
    public InArgument<ExcelCloseOptionEnum> BeforeClosingExcel { get; set; } = new InArgument<ExcelCloseOptionEnum>(ExcelCloseOptionEnum.SaveDocument);

    [DisplayName("Save Path"), Description("The file path to save the document when 'Save Document As' is selected.")]
    [RenderIfCondition(nameof(BeforeClosingExcel), ExcelCloseOptionEnum.SaveDocumentAs)]
    public InArgument<string> SavePath { get; set; } = new InArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var excelApp = ExcelApplication.Get(context);
            var closeOption = BeforeClosingExcel.Get(context);

            if (excelApp == null)
                throw new InvalidOperationException("Excel Application is null.");

            excelApp.DisplayAlerts = false;

            switch (closeOption)
            {
                case ExcelCloseOptionEnum.DoNotSaveDocument:
                    break;

                case ExcelCloseOptionEnum.SaveDocument:
                    excelApp.ActiveWorkbook.Save();
                    break;

                case ExcelCloseOptionEnum.SaveDocumentAs:
                    {
                        var savePath = SavePath.Get(context);
                        if (string.IsNullOrWhiteSpace(savePath))
                            throw new ArgumentException("Save Path cannot be empty when saving as.");
                        excelApp.ActiveWorkbook.SaveAs(savePath);
                        break;
                    }

                default:
                    throw new ArgumentOutOfRangeException(nameof(closeOption));
            }

            excelApp.Quit();

            if (excelApp?.ActiveWorkbook != null)
                Marshal.ReleaseComObject(excelApp.ActiveWorkbook);
            Marshal.ReleaseComObject(excelApp);

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error closing Excel: {ex.Message}");
        }
    }
}
