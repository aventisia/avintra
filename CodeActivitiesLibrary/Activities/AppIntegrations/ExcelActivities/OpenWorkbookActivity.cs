using CodeActivitiesLibrary.Extensions;
using Microsoft.Office.Interop.Excel;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using System.Reflection;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Open Excel Workbook")]
    [Description("Opens an existing Excel workbook from the specified file path and reports success or failure.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class OpenWorkbookActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("File Path")]
        [Description("The full path to the Excel file (.xlsx or .xls) that needs to be opened.")]
        public InArgument<string> FilePath { get; set; }

        [RequiredArgument]
        [DisplayName("Visible")]
        [Description("Set to true if you want the Excel application to be visible during automation.")]
        public InArgument<bool> Visible { get; set; } = new InArgument<bool>(false);

        [DisplayName("Open as ReadOnly")]
        [Description("If true, opens the workbook in read-only mode.")]
        public InArgument<bool> OpenAsReadOnly { get; set; } = new InArgument<bool>(false);

        [DisplayName("Read Protection Password")]
        [Description("Password to open the workbook if it is protected.")]
        public InArgument<string> ReadProtectionPassword { get; set; }

        [DisplayName("Workbook Instance")]
        [Description("The opened Excel Workbook object.")]
        public OutArgument<Workbook> WorkbookInstance { get; set; }

        [DisplayName("Excel Application")]
        [Description("The Excel Application instance (used for later operations or close).")]
        public OutArgument<Application> ExcelApp { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string filePath = FilePath.Get(context);
            bool visible = Visible.Get(context);
            bool readOnly = OpenAsReadOnly.Get(context);
            string password = ReadProtectionPassword.Get(context);

            bool isSuccess = false;
            string statusMessage;
            Application excelApp = null;
            Workbook workbook = null;

            try
            {
                // Validate file path
                if (string.IsNullOrWhiteSpace(filePath))
                    throw new ArgumentException("File path is not provided.");

                if (!File.Exists(filePath))
                    throw new FileNotFoundException($"Excel file not found at: {filePath}");

                // Create Excel application
                excelApp = new Application
                {
                    Visible = visible,
                    DisplayAlerts = false
                };

                // Open workbook
                workbook = excelApp.Workbooks.Open(
                    Filename: filePath,
                    ReadOnly: readOnly,
                    Password: password
                );

                isSuccess = true;
                statusMessage = $"Workbook '{Path.GetFileName(filePath)}' opened successfully.";
            }
            catch (Exception ex)
            {
                statusMessage = $"Error opening workbook: {ex.Message}";

                // Clean up if Excel failed
                try
                {
                    workbook?.Close(false);
                    excelApp?.Quit();
                }
                catch { /* Ignore cleanup errors */ }

                workbook = null;
                excelApp = null;
            }

            // Set output arguments
            WorkbookInstance.Set(context, workbook);
            ExcelApp.Set(context, excelApp);
            IsSuccess.Set(context, isSuccess);
            StatusMessage.Set(context, statusMessage);
        }
    }
}
