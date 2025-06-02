using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Attach to Running Excel Workbook")]
    [Description("Attaches to a running Excel instance and opens the specified workbook if not already open.")]
    public class AttachToRunningExcelActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Excel Application")]
        [Description("The running Excel Application object to attach to.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("File Path")]
        [Description("The full path of the Excel file to open or attach to in the running Excel instance.")]
        public InArgument<string> FilePath { get; set; }


        [Category("Output")] 

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var excelApp = ExcelApplication.Get(context);
                var filePath = FilePath.Get(context);

                if (excelApp == null)
                    throw new InvalidOperationException("Excel Application is null.");

                var wb = excelApp.Workbooks.Open(filePath);
            }
            catch (Exception ex)
            {
                status = $"Error attaching to running Excel: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}