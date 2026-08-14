using NodeLibrary.ExcelNodes.Enums;
using NodeLibrary.Office;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Close Excel Application"), Description("Closes the active Excel application instance and optionally saves changes.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class CloseExcelNode : BaseNode
{
    [DisplayName("Excel Application"), Description("The Excel Application object to close.")]
    public required InArgument<object> ExcelApplication { get; set; }

    [DisplayName("Before Closing Excel"), Description("Specifies what to do before closing Excel.")]
    public InArgument<ExcelCloseOptionEnum> BeforeClosingExcel { get; set; } = new InArgument<ExcelCloseOptionEnum>(ExcelCloseOptionEnum.SaveDocument);

    [DisplayName("Save Path"), Description("The file path to save the document when 'Save Document As' is selected.")]
    [RenderIfCondition(nameof(BeforeClosingExcel), ExcelCloseOptionEnum.SaveDocumentAs)]
    public InArgument<string> SavePath { get; set; } = new InArgument<string>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic excelAppArg = ExcelApplication.Get(context);
            var closeOption = BeforeClosingExcel.Get(context);

            if (excelAppArg == null)
                throw new InvalidOperationException("Excel Application is null.");

            dynamic excelApp = excelAppArg;
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

            OfficeAutomationHelper.Release(excelApp.ActiveWorkbook);
            OfficeAutomationHelper.Release(excelApp);

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Success");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error closing Excel: {ex.Message}");
        }
    }
}




