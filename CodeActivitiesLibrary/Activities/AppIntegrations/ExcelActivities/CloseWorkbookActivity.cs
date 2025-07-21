using CodeActivitiesLibrary.Extensions;
using Microsoft.Office.Interop.Excel;
using System;
using System.Activities;
using System.ComponentModel;
using System.Runtime.InteropServices;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Close Excel Workbook")]
    [Description("Closes the specified Excel workbook and optionally quits the Excel application.")]
    public class CloseWorkbookActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Workbook")]
        [Description("The Excel Workbook object to close.")]
        public InArgument<Workbook> Workbook { get; set; }

        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("Optional. The Excel Application object to quit after closing the workbook.")]
        public InArgument<Application> ExcelApp { get; set; }

        [RequiredArgument]
        [DisplayName("Save Before Close")]
        [Description("Set to true to save the workbook before closing.")]
        public InArgument<bool> SaveBeforeClose { get; set; }

        [RequiredArgument]
        [DisplayName("Quit Application")]
        [Description("Set to true to quit the Excel application after closing the workbook.")]
        public InArgument<bool> QuitApp { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            bool isSuccess = false;
            string statusMessage = string.Empty;

            Workbook workbook = null;
            Application excelApp = null;

            try
            {
                // Get Workbook (required)
                workbook = Workbook.Get(context);
                if (workbook == null)
                    throw new ArgumentNullException(nameof(Workbook), "Workbook reference is null.");

                // Get Excel Application (optional)
                if (ExcelApp != null && ExcelApp.Expression != null)
                    excelApp = ExcelApp.Get(context);

                // Get boolean values from InArguments
                bool saveBeforeClose = SaveBeforeClose.Get(context);
                bool quitApp = QuitApp.Get(context);

                // Close the workbook
                workbook.Close(saveBeforeClose);

                // Quit Excel application if requested
                if (quitApp && excelApp != null)
                {
                    excelApp.Quit();

                    // Release COM object of ActiveWorkbook first if it exists
                    if (excelApp.ActiveWorkbook != null)
                        Marshal.ReleaseComObject(excelApp.ActiveWorkbook);

                    // Release COM object of Excel Application
                    Marshal.ReleaseComObject(excelApp);
                }

                // Also release workbook object explicitly
                if (workbook != null)
                    Marshal.ReleaseComObject(workbook);

                isSuccess = true;
                statusMessage = "Workbook closed successfully.";
            }
            catch (Exception ex)
            {
                isSuccess = false;
                statusMessage = $"Error closing workbook: {ex.Message}";
            }

            // Set output arguments
            IsSuccess.Set(context, isSuccess);
            StatusMessage.Set(context, statusMessage);
        }
    }
}
