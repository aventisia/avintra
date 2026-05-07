using NodeLibrary.ExcelNodes.Enums;
using NodeLibrary.ExcelNodes.Helpers;
using Excel = Microsoft.Office.Interop.Excel;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Launch Excel Application"), Description("Launches a new Excel application instance or opens an existing Excel document.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class LaunchExcelNode : BaseNode
{
    [DisplayName("Launch Mode"), Description("Specifies whether to open an existing document or create a new one.")]
    public InArgument<ExcelLaunchModeEnum> LaunchMode { get; set; } = new InArgument<ExcelLaunchModeEnum>(ExcelLaunchModeEnum.OpenExisting);

    [DisplayName("Document Path"), Description("The path to the Excel document to open. Required if 'Launch Mode' is 'Open Existing'.")]
    [RenderIfCondition(nameof(LaunchMode), ExcelLaunchModeEnum.OpenExisting)]
    public InArgument<string> DocumentPath { get; set; } = new InArgument<string>();

    [DisplayName("Make Instance Visible"), Description("Determines whether the Excel application should be visible.")]
    public InArgument<bool> MakeInstanceVisible { get; set; } = new InArgument<bool>(true);

    [DisplayName("Open as ReadOnly"), Description("If true, opens the document in read-only mode.")]
    [RenderIfCondition(nameof(LaunchMode), ExcelLaunchModeEnum.OpenExisting)]
    public InArgument<bool> OpenAsReadOnly { get; set; } = new InArgument<bool>();

    [DisplayName("Nest Under New Process"), Description("If true, launches Excel in a new process.")]
    public InArgument<bool> NestUnderNewProcess { get; set; } = new InArgument<bool>();

    [DisplayName("Use Machine Locale"), Description("If true, uses the machine's locale settings.")]
    public InArgument<bool> UseMachineLocale { get; set; } = new InArgument<bool>();

    [DisplayName("Read Protection Password"), Description("Optional password to protect the document from being modified.")]
    [RenderIfCondition(nameof(LaunchMode), ExcelLaunchModeEnum.OpenExisting)]
    public InArgument<SecureString> ReadProtectionPassword { get; set; } = new InArgument<SecureString>();

    [DisplayName("Write Protection Password"), Description("Optional password to protect the document from being saved.")]
    [RenderIfCondition(nameof(LaunchMode), ExcelLaunchModeEnum.OpenExisting)]
    public InArgument<SecureString> WriteProtectionPassword { get; set; } = new InArgument<SecureString>();

    [DisplayName("Excel Instance"), Description("Returns the launched Excel Application object.")]
    public OutArgument<Excel.Application> ExcelInstance { get; set; } = new OutArgument<Excel.Application>();

    [DisplayName("Workbook Instance"), Description("Returns the active or newly created Workbook object.")]
    public OutArgument<Excel.Workbook> WorkbookInstance { get; set; } = new OutArgument<Excel.Workbook>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";
        Excel.Application excelApp = null;
        Excel.Workbook workbook = null;

        try
        {
            var launchMode = LaunchMode.Get(context);
            var makeVisible = MakeInstanceVisible.Get(context);
            var nestUnderNewProcess = NestUnderNewProcess.Get(context);
            var useMachineLocale = UseMachineLocale.Get(context);

            try
            {
                excelApp = (Excel.Application)ComHelper.GetActiveObject("Excel.Application");
                if (makeVisible)
                    excelApp.Visible = true;
            }
            catch
            {
                excelApp = new Excel.Application();
                excelApp.Visible = makeVisible;
            }

            switch (launchMode)
            {
                case ExcelLaunchModeEnum.OpenExisting:
                    {
                        var documentPath = DocumentPath.Get(context);
                        if (string.IsNullOrWhiteSpace(documentPath))
                            throw new ArgumentException("Document Path cannot be empty when opening an existing file.");

                        var readOnly = OpenAsReadOnly.Get(context);
                        var readPassword = ReadProtectionPassword.Get(context);
                        var writePassword = WriteProtectionPassword.Get(context);

                        bool workbookAlreadyOpen = false;
                        foreach (Excel.Workbook wb in excelApp.Workbooks)
                        {
                            var openWorkbookName = System.IO.Path.GetFileName(wb.FullName);
                            var targetWorkbookName = System.IO.Path.GetFileName(documentPath);

                            if (string.Equals(openWorkbookName, targetWorkbookName, StringComparison.OrdinalIgnoreCase))
                            {
                                wb.Activate();
                                workbook = wb;
                                workbookAlreadyOpen = true;
                                break;
                            }
                        }

                        if (!workbookAlreadyOpen)
                        {
                            workbook = excelApp.Workbooks.Open(
                                Filename: documentPath,
                                ReadOnly: readOnly,
                                Password: readPassword,
                                WriteResPassword: writePassword
                            );
                        }
                        break;
                    }

                case ExcelLaunchModeEnum.NewWorkbook:
                    workbook = excelApp.Workbooks.Add();
                    break;

                default:
                    throw new InvalidOperationException("Invalid launch mode selected.");
            }

            ExcelInstance.Set(context, excelApp);
            WorkbookInstance.Set(context, workbook);

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Launched excel successfully");
        }
        catch (Exception ex)
        {
            status = $"Error launching Excel: {ex.Message}";
            excelApp?.Quit();
            IsSuccess.Set(context, false);
            ExcelInstance.Set(context, null);
            WorkbookInstance.Set(context, null);
            StatusMessage.Set(context, status);
        }
    }
}
