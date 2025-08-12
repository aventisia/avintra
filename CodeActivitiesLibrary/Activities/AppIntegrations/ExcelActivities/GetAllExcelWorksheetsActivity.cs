using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.InteropServices;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Get All Excel Worksheets")]
    [Description("Retrieves all worksheet names from the active Excel workbook.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
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
            string status = "Success";

            Excel.Application excelApp = null;
            Excel.Workbook workbook = null;

            try
            {
                excelApp = ExcelApplication.Get(context);

                if (excelApp == null)
                    throw new InvalidOperationException("Excel application is not available.");

                workbook = excelApp.ActiveWorkbook;
                if (workbook == null)
                    throw new InvalidOperationException("No active workbook found.");

                // Safely loop through worksheets
                foreach (Excel.Worksheet sheet in workbook.Worksheets)
                {
                    if (sheet != null)
                    {
                        result.Add(sheet.Name);
                        Marshal.ReleaseComObject(sheet);
                    }
                }

                WorksheetNames.Set(context, result);
                IsSuccess.Set(context, true);
                status = $"Successfully retrieved {result.Count} worksheet(s).";
            }
            catch (Exception ex)
            {
                result.Clear();
                WorksheetNames.Set(context, result);
                IsSuccess.Set(context, false);
                status = $"Error retrieving worksheets: {ex.Message}";
            }
            finally
            {
                // Release COM objects
                if (workbook != null) Marshal.ReleaseComObject(workbook);
                if (excelApp != null) Marshal.ReleaseComObject(excelApp);
                StatusMessage.Set(context, status);
            }
        }
    }
}