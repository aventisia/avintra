using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Security;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Launch Excel Application")]
    [Description("Launches a new Excel application instance or opens an existing Excel document.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class LaunchExcelActivity : BaseCodeActivity
    {
        [DisplayName("Launch Mode")]
        [Description("Specifies whether to open an existing document or create a new one.")]
        [DefaultValue(ExcelLaunchModeEnum.OpenExisting)]
        public InArgument<ExcelLaunchModeEnum> LaunchMode { get; set; }


        [DisplayName("Document Path")]
        [Description("The path to the Excel document to open. Required if 'Launch Mode' is 'Open Existing'.")]
        [RenderIfCondition(nameof(LaunchMode), ExcelLaunchModeEnum.OpenExisting)]
        public InArgument<string> DocumentPath { get; set; }


        [DisplayName("Make Instance Visible")]
        [Description("Determines whether the Excel application should be visible.")]
        [DefaultValue(true)]
        public InArgument<bool> MakeInstanceVisible { get; set; } = new InArgument<bool>(true);


        [DisplayName("Open as ReadOnly")]
        [Description("If true, opens the document in read-only mode.")]
        [RenderIfCondition(nameof(LaunchMode), ExcelLaunchModeEnum.OpenExisting)]
        public InArgument<bool> OpenAsReadOnly { get; set; }


        [DisplayName("Nest Under New Process")]
        [Description("If true, launches Excel in a new process.")]
        public InArgument<bool> NestUnderNewProcess { get; set; }


        [DisplayName("Use Machine Locale")]
        [Description("If true, uses the machine's locale settings.")]
        public InArgument<bool> UseMachineLocale { get; set; }


        [DisplayName("Read Protection Password")]
        [Description("Optional password to protect the document from being modified.")]
        [RenderIfCondition(nameof(LaunchMode), ExcelLaunchModeEnum.OpenExisting)]
        public InArgument<SecureString> ReadProtectionPassword { get; set; }


        [DisplayName("Write Protection Password")]
        [Description("Optional password to protect the document from being saved.")]
        [RenderIfCondition(nameof(LaunchMode), ExcelLaunchModeEnum.OpenExisting)]
        public InArgument<SecureString> WriteProtectionPassword { get; set; }

        [DisplayName("Excel Instance")]
        [Description("Returns the launched Excel Application object.")]
        public OutArgument<Excel.Application> ExcelInstance { get; set; }

        [DisplayName("Workbook Instance")]
        [Description("Returns the active or newly created Workbook object.")]
        public OutArgument<Excel.Workbook> WorkbookInstance { get; set; }

        protected override void Execute(CodeActivityContext context)
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

                // Try to get an existing Excel instance
                try
                {
                    excelApp = (Excel.Application)System.Runtime.InteropServices.Marshal.GetActiveObject("Excel.Application");
                    // Optional: Ensure it's visible if requested
                    if (makeVisible)
                        excelApp.Visible = true;
                }
                catch
                {
                    // No existing instance found — create a new one
                    excelApp = new Excel.Application();
                    excelApp.Visible = makeVisible;
                }

                // Handle launch mode
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
                            
                            // Check if the workbook is already open
                            bool workbookAlreadyOpen = false;
                            foreach (Excel.Workbook wb in excelApp.Workbooks)
                            {
                                var openWorkbookName = System.IO.Path.GetFileName(wb.FullName);
                                var targetWorkbookName = System.IO.Path.GetFileName(documentPath);

                                if (string.Equals(openWorkbookName, targetWorkbookName, StringComparison.OrdinalIgnoreCase))
                                {
                                    // Activate existing workbook
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

                // Set outputs
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
            }
            finally
            {
                StatusMessage.Set(context, status);
            }

        }
    }
}