using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Get Active Excel Worksheet")]
    [Description("Retrieves the name and index of the currently active worksheet in an Excel instance.")]
    public class GetActiveExcelWorksheetActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target workbook.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")]
        [DisplayName("Sheet Name")]
        [Description("Returns the name of the currently active worksheet.")]
        public OutArgument<string> SheetName { get; set; }

        [Category("Output")]
        [DisplayName("Sheet Index")]
        [Description("Returns the index of the currently active worksheet.")]
        public OutArgument<int> SheetIndex { get; set; }

        [Category("Output")] 

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var sheetName = "";
            var sheetIndex = 0;
            var status = "Success";

            try
            {
                var excelApp = ExcelApplication.Get(context);

                if (excelApp?.ActiveWorkbook == null)
                    throw new InvalidOperationException("Excel application or workbook is not available.");

                var wb = excelApp.ActiveWorkbook;

                if (!(wb.ActiveSheet is Excel.Worksheet ws))
                    throw new InvalidOperationException("No active worksheet found.");

                sheetName = ws.Name;
                sheetIndex = ws.Index;
            }
            catch (Exception ex)
            {
                status = $"Error retrieving active worksheet: {ex.Message}";
                sheetName = "";
                sheetIndex = 0;
            }

            SheetName.Set(context, sheetName);
            SheetIndex.Set(context, sheetIndex);
            StatusMessage.Set(context, status);
        }
    }
}