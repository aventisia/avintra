using NodeLibrary.ExcelNodes.Enums;
using NodeLibrary.Office;

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

    [DisplayName("Read Protection Password"), Description("Optional password to protect the document from being modified.")]
    [RenderIfCondition(nameof(LaunchMode), ExcelLaunchModeEnum.OpenExisting)]
    public InArgument<SecureString> ReadProtectionPassword { get; set; } = new InArgument<SecureString>();

    [DisplayName("Write Protection Password"), Description("Optional password to protect the document from being saved.")]
    [RenderIfCondition(nameof(LaunchMode), ExcelLaunchModeEnum.OpenExisting)]
    public InArgument<SecureString> WriteProtectionPassword { get; set; } = new InArgument<SecureString>();

    [DisplayName("Excel Instance"), Description("Returns the launched Excel Application object.")]
    public OutArgument<object> ExcelInstance { get; set; } = new OutArgument<object>();

    [DisplayName("Workbook Instance"), Description("Returns the active or newly created Workbook object.")]
    public OutArgument<object> WorkbookInstance { get; set; } = new OutArgument<object>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var tcs = new TaskCompletionSource();
            var staThread = new Thread(() =>
            {
                try
                {
                    ExecuteSta(context);
                    tcs.SetResult();
                }
                catch (Exception ex)
                {
                    tcs.SetException(ex);
                }
            });
            staThread.SetApartmentState(ApartmentState.STA);
            staThread.Start();
            staThread.Join();
            tcs.Task.GetAwaiter().GetResult();
        }
        catch (Exception ex)
        {
            var inner = ex.InnerException ?? ex;
            IsSuccess.Set(context, false);
            ExcelInstance.Set(context, null);
            WorkbookInstance.Set(context, null);
            StatusMessage.Set(context, $"Error launching Excel: {inner.Message}");
        }
    }

    private void ExecuteSta(INodeContext context)
    {
        dynamic? excelApp = null;
        dynamic? workbooks = null;
        dynamic? workbook = null;
        var comObjectsToRelease = new List<object>();

        try
        {
            var launchMode = LaunchMode.Get(context);
            var makeVisible = MakeInstanceVisible.Get(context);

            try
            {
                excelApp = OfficeAutomationHelper.GetActiveApplication(OfficeApplication.Excel);
                if (makeVisible)
                    excelApp.Visible = true;
            }
            catch (OfficeAutomationException)
            {
                throw;
            }
            catch
            {
                excelApp = OfficeAutomationHelper.CreateApplication(OfficeApplication.Excel);
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

                        workbooks = excelApp.Workbooks;
                        bool workbookAlreadyOpen = false;
                        foreach (var wb in workbooks)
                        {
                            comObjectsToRelease.Add(wb);
                            var openWorkbookName = System.IO.Path.GetFileName((string)wb.FullName);
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
                            workbook = workbooks.Open(
                                Filename: documentPath,
                                ReadOnly: readOnly,
                                Password: readPassword,
                                WriteResPassword: writePassword
                            );
                        }
                        break;
                    }

                case ExcelLaunchModeEnum.NewWorkbook:
                    workbooks = excelApp.Workbooks;
                    workbook = workbooks.Add();
                    break;

                default:
                    throw new InvalidOperationException("Invalid launch mode selected.");
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Launched excel successfully");

            ExcelInstance.Set(context, excelApp);
            WorkbookInstance.Set(context, workbook);
        }
        catch
        {
            try { workbook?.Close(SaveChanges: false); } catch { /* ignore */ }
            try { excelApp?.Quit(); } catch { /* ignore */ }
            throw;
        }
        finally
        {
            foreach (var obj in comObjectsToRelease)
            {
                OfficeAutomationHelper.Release(obj);
            }

            if (workbooks is not null && !ReferenceEquals(workbooks, workbook))
            {
                OfficeAutomationHelper.Release(workbooks);
            }
        }
    }
}




