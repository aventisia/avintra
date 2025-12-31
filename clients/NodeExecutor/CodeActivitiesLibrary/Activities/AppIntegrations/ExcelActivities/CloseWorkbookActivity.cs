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
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class CloseWorkbookActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Workbook Instance")]
        [Description("The Excel Workbook instance to be closed.")]
        public InArgument<Workbook> WorkbookInstance { get; set; }

        [DisplayName("Excel Application Instance")]
        [Description("The Excel Application instance to optionally quit after closing the workbook.")]
        [RenderIfCondition(nameof(QuitExcelApp), true)]
        public InArgument<Application> ExcelApp { get; set; }

        [DisplayName("Save Before Closing")]
        [Description("Whether to save the workbook before closing.")]
        [DefaultValue(true)]
        public InArgument<bool> SaveBeforeClose { get; set; }

        [DisplayName("Quit Excel Application")]
        [Description("Whether to quit the Excel Application after closing the workbook.")]
        [DefaultValue(true)]
        public InArgument<bool> QuitExcelApp { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            bool isSuccess = false;
            string statusMessage = "Failed to close workbook.";

            Workbook workbook = null;
            Application excelApp = null;

            try
            {
                workbook = WorkbookInstance.Get(context);
                excelApp = ExcelApp.Get(context);
                bool saveBeforeClose = SaveBeforeClose.Get(context);
                bool quitApp = QuitExcelApp.Get(context);

                if (workbook == null)
                    throw new InvalidOperationException("Workbook instance is null or invalid.");

                // Close workbook
                workbook.Close(saveBeforeClose);
                Marshal.ReleaseComObject(workbook);
                workbook = null;

                // Quit Excel Application if specified
                if (excelApp != null && quitApp)
                {
                    excelApp.Quit();
                    Marshal.ReleaseComObject(excelApp);
                    excelApp = null;
                }

                // Force garbage collection
                GC.Collect();
                GC.WaitForPendingFinalizers();

                isSuccess = true;
                statusMessage = "Workbook closed successfully.";
            }
            catch (Exception ex)
            {
                statusMessage = $"Error closing workbook: {ex.Message}";
            }

            IsSuccess.Set(context, isSuccess);
            StatusMessage.Set(context, statusMessage);
        }
    }
}
