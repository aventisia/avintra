using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Launch Excel Application")]
    [Description("Launches a new Excel application instance or opens an existing Excel document.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class LaunchExcelActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------


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
        public InArgument<string> ReadProtectionPassword { get; set; }


        [DisplayName("Write Protection Password")]
        [Description("Optional password to protect the document from being saved.")]
        [RenderIfCondition(nameof(LaunchMode), ExcelLaunchModeEnum.OpenExisting)]
        public InArgument<string> WriteProtectionPassword { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Excel Instance")]
        [Description("Returns the launched Excel Application object.")]
        public OutArgument<Excel.Application> ExcelInstance { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var launchMode = LaunchMode.Get(context);
                var makeVisible = MakeInstanceVisible.Get(context);
                var nestUnderNewProcess = NestUnderNewProcess.Get(context);
                var useMachineLocale = UseMachineLocale.Get(context);

                Excel.Application excelApp = null;

                try
                {
                    excelApp = new Excel.Application();
                    excelApp.Visible = makeVisible;

                    switch (launchMode)
                    {
                        case ExcelLaunchModeEnum.OpenExisting:
                            {
                                var documentPath = DocumentPath.Get(context);
                                var readOnly = OpenAsReadOnly.Get(context);
                                var readPassword = ReadProtectionPassword.Get(context);
                                var writePassword = WriteProtectionPassword.Get(context);

                                if (string.IsNullOrWhiteSpace(documentPath))
                                    throw new ArgumentException(
                                        "Document Path cannot be empty when opening an existing file.");

                                excelApp.Workbooks.Open(
                                    documentPath,
                                    Type.Missing,
                                    readOnly,
                                    Type.Missing,
                                    readPassword,
                                    writePassword,
                                    Type.Missing,
                                    Type.Missing,
                                    Type.Missing,
                                    Type.Missing,
                                    Type.Missing,
                                    Type.Missing,
                                    Type.Missing,
                                    Type.Missing,
                                    Type.Missing
                                );
                                break;
                            }

                        case ExcelLaunchModeEnum.NewWorkbook:
                            excelApp.Workbooks.Add(Type.Missing);
                            break;

                        default:
                            throw new InvalidOperationException("Invalid launch mode selected.");
                    }
                }
                catch (Exception ex)
                {
                    status = $"Error launching Excel: {ex.Message}";
                    excelApp?.Quit();
                    excelApp = null;
                }

                ExcelInstance.Set(context, excelApp);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Launched excel successfully");
            }
            catch (Exception ex)
            {
                status = $"Error launching Excel: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }

        }
    }
}