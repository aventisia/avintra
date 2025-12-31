using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Attach to Running Excel Workbook")]
    [Description("Attaches to a running Excel instance and opens the specified workbook if not already open.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class AttachToRunningExcelActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("The running Excel Application object to attach to.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]
        [DisplayName("File Path")]
        [Description("The full path of the Excel file to open or attach to in the running Excel instance.")]
        public InArgument<string> FilePath { get; set; }

        [DisplayName("Workbook Instance")]
        [Description("Returns the attached or opened workbook.")]
        public OutArgument<Excel.Workbook> WorkbookInstance { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string status;
            Excel.Workbook workbook = null;

            try
            {
                var excelApp = ExcelApplication.Get(context);
                var filePath = FilePath.Get(context);

                if (excelApp == null)
                    throw new InvalidOperationException("Excel Application cannot be null.");

                if (string.IsNullOrWhiteSpace(filePath))
                    throw new ArgumentException("File path cannot be empty.");

                if (!File.Exists(filePath))
                    throw new FileNotFoundException($"Excel file not found at: {filePath}");

                // Check if workbook already open
                bool alreadyOpen = false;
                foreach (Excel.Workbook wb in excelApp.Workbooks)
                {
                    if (string.Equals(wb.FullName, filePath, StringComparison.OrdinalIgnoreCase))
                    {
                        workbook = wb;
                        alreadyOpen = true;
                        break;
                    }
                }

                // Open workbook if not already open
                if (!alreadyOpen)
                {
                    workbook = excelApp.Workbooks.Open(filePath);
                }

                WorkbookInstance.Set(context, workbook);

                IsSuccess.Set(context, true);
                status = alreadyOpen
                    ? "Attached to already open workbook successfully."
                    : "Opened and attached to workbook successfully.";
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                status = $"Error attaching to running Excel: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}