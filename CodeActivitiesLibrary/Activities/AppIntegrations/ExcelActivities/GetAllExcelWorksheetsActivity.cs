using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Get All Excel Worksheets")]
    [Description("Retrieves all worksheet names from the active Excel workbook.")]
    public class GetAllExcelWorksheetsActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target workbook.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Worksheet Names")]
        [Description("Returns a list of all worksheet names in the active Excel workbook.")]
        public OutArgument<IEnumerable<string>> WorksheetNames { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var result = new List<string>();

            try
            {
                var excelApp = ExcelApplication.Get(context);

                if (excelApp?.ActiveWorkbook == null)
                    throw new InvalidOperationException("Excel application or workbook is not available.");

                var wb = excelApp.ActiveWorkbook;

                result.AddRange(from Excel.Worksheet sheet in wb.Worksheets select sheet.Name);

                WorksheetNames.Set(context, result);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Retrieved all excel sheet successfully");
            }
            catch (Exception ex)
            {
                result.Clear();
                WorksheetNames.Set(context, result);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving worksheets: {ex.Message}");
            }

        }
    }
}