using CodeActivitiesLibrary.Extensions;
using Microsoft.Office.Interop.Excel;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Open Excel Workbook")]
    [Description("Opens an existing Excel workbook from the specified file path and reports success or failure.")]
    public class OpenWorkbookActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("File Path")]
        [Description("The full path to the Excel file (.xlsx or .xls) that needs to be opened.")]
        public InArgument<string> FilePath { get; set; }

        [RequiredArgument]
        [DisplayName("Visible")]
        [Description("Set to true if you want the Excel application to be visible during automation.")]
        public InArgument<bool> Visible { get; set; }

        [DisplayName("Workbook")]
        [Description("The opened Excel Workbook object.")]
        public OutArgument<Workbook> Workbook { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string filePath = FilePath.Get(context);
            bool visible = Visible.Get(context);
            bool isSuccess;
            string statusMessage;
            Workbook workbook = null;

            if (string.IsNullOrWhiteSpace(filePath))
            {
                isSuccess = false;
                statusMessage = "File path is not provided.";
            }
            else if (!System.IO.File.Exists(filePath))
            {
                isSuccess = false;
                statusMessage = $"The specified Excel file was not found: {filePath}";
            }
            else
            {
                try
                {
                    Application excelApp = new Application
                    {
                        Visible = visible,
                        DisplayAlerts = false
                    };

                    workbook = excelApp.Workbooks.Open(filePath);
                    isSuccess = true;
                    statusMessage = $"Workbook '{filePath}' opened successfully.";
                }
                catch (Exception ex)
                {
                    isSuccess = false;
                    statusMessage = $"Error opening workbook: {ex.Message}";
                }
            }

            // Set output arguments
            Workbook.Set(context, workbook);
            IsSuccess.Set(context, isSuccess);
            StatusMessage.Set(context, statusMessage);
        }
    }
}