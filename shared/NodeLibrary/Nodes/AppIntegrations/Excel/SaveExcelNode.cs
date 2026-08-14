using NodeLibrary.ExcelNodes.Enums;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Save Excel Workbook"), Description("Saves the active Excel workbook.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class SaveExcelNode : BaseNode
{
    [DisplayName("Excel Application"), Description("The Excel Application object containing the workbook to save.")]
    public required InArgument<object> ExcelApplication { get; set; }

    [DisplayName("Save Mode"), Description("Specifies how to save the workbook.")]
    public required InArgument<ExcelFileSaveModeEnum> SaveMode { get; set; } = new InArgument<ExcelFileSaveModeEnum>(ExcelFileSaveModeEnum.Save);

    [DisplayName("Select Format"), Description("The file format to save the workbook as. This is required when 'Save Mode' is set to 'Save a Copy'.")]
    [RenderIfCondition(nameof(SaveMode), ExcelFileSaveModeEnum.SaveCopy)]
    public InArgument<ExcelFileSaveFormatEnum> SaveCopyFormat { get; set; } = new InArgument<ExcelFileSaveFormatEnum>();

    [DisplayName("Document Path"), Description("The file path to save the copy of the workbook. Extension will be determined by the selected format and will be ignored if already present in the path")]
    [RenderIfCondition(nameof(SaveMode), ExcelFileSaveModeEnum.SaveCopy)]
    public InArgument<string> DocumentPath { get; set; } = new InArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            dynamic excelApp = ExcelApplication.Get(context);
            var saveMode = SaveMode.Get(context);

            if (excelApp?.ActiveWorkbook == null)
                throw new InvalidOperationException("Excel application or workbook is not available.");

            switch (saveMode)
            {
                case ExcelFileSaveModeEnum.Save:
                    excelApp.ActiveWorkbook.Save();
                    break;

                case ExcelFileSaveModeEnum.SaveCopy:
                    {
                        var documentPath = DocumentPath.Get(context);
                        var documentFormat = SaveCopyFormat.Get(context);

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





