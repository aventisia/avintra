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
        [DisplayName("Workbook Object")]
        [Description("The Excel Workbook object to be closed.")]
        public InArgument<object> Workbook { get; set; }

        [DisplayName("Save Before Closing")]
        [Description("Whether to save the workbook before closing.")]
        [DefaultValue(true)]
        public InArgument<bool> SaveBeforeClose { get; set; }

        [DisplayName("Quit Excel Application")]
        [Description("Whether to quit the Excel Application after closing the workbook.")]
        [DefaultValue(true)]
        public InArgument<bool> QuitExcelApp { get; set; }

        [DisplayName("Excel Application Object")]
        [Description("The Excel Application instance to optionally quit.")]
        [RenderIfCondition(nameof(QuitExcelApp), true)]
        public InArgument<object> ExcelApp { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            object workbookObj = Workbook.Get(context);
            object excelAppObj = ExcelApp.Get(context);
            bool saveBeforeClose = SaveBeforeClose.Get(context);
            bool quitApp = QuitExcelApp.Get(context);

            bool isSuccess = false;
            string statusMessage;

            Workbook workbook = null;
            Application excelApp = null;

            try
            {
                workbook = workbookObj as Workbook;
                excelApp = excelAppObj as Application;

                if (workbook == null)
                    throw new ArgumentNullException(nameof(Workbook), "Workbook is null or invalid.");

                workbook.Close(saveBeforeClose);
                Marshal.ReleaseComObject(workbook);
                workbook = null;

                if (excelApp != null && quitApp)
                {
                    excelApp.Quit();
                    Marshal.ReleaseComObject(excelApp);
                    excelApp = null;
                }

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
