using NodeLibrary.ExcelNodes.Enums;
using Excel = Microsoft.Office.Interop.Excel;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Save Excel Workbook"), Description("Saves the active Excel workbook.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class SaveExcelNode : BaseNode
{
    [DisplayName("Excel Application"), Description("The Excel Application object containing the workbook to save.")]
    public required InArgument<Excel.Application> ExcelApplication { get; set; }

    [DisplayName("Save Mode"), Description("Specifies how to save the workbook.")]
    public required InArgument<ExcelFileSaveModeEnum> SaveMode { get; set; }

    [DisplayName("Document Path"), Description("The file path to save the workbook (required if 'Save Mode' is 'Save Document As').")]
    [RenderIfCondition(nameof(SaveMode), ExcelFileSaveModeEnum.SaveDocumentAs)]
    public InArgument<string> DocumentPath { get; set; } = new InArgument<string>();

    [DisplayName("Document Format"), Description("The file format to save the workbook as (required if 'Save Mode' is 'Save Document As').")]
    [RenderIfCondition(nameof(SaveMode), ExcelFileSaveModeEnum.SaveDocumentAs)]
    public InArgument<ExcelFileSaveFormatEnum> DocumentFormat { get; set; } = new InArgument<ExcelFileSaveFormatEnum>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var excelApp = ExcelApplication.Get(context);
            var saveMode = SaveMode.Get(context);

            if (excelApp?.ActiveWorkbook == null)
                throw new InvalidOperationException("Excel application or workbook is not available.");

            switch (saveMode)
            {
                case ExcelFileSaveModeEnum.SaveDocument:
                    excelApp.ActiveWorkbook.Save();
                    break;

                case ExcelFileSaveModeEnum.SaveDocumentAs:
                    {
                        var documentPath = DocumentPath.Get(context);
                        var documentFormat = DocumentFormat.Get(context);

                        if (string.IsNullOrWhiteSpace(documentPath))
                            throw new ArgumentException("Document path cannot be empty when using 'Save Document As' mode.");

                        excelApp.ActiveWorkbook.SaveAs(
                            documentPath,
                            documentFormat,
                            CreateBackup: false
                        );
                        break;
                    }

                default:
                    throw new ArgumentOutOfRangeException(nameof(saveMode));
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error saving Excel: {ex.Message}");
        }
    }
}
