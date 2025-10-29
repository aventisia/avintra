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
    [Description("Retrieves all worksheet names from the provided Excel workbook instance, optionally filtered by a specific worksheet instance.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class GetAllExcelWorksheetsActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Workbook Instance")]
        [Description("The Excel Workbook object containing the worksheets to retrieve.")]
        public InArgument<Excel.Workbook> WorkbookInstance { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("Worksheet Names")]
        [Description("Returns a list of all worksheet names in the provided Excel workbook.")]
        public OutArgument<IEnumerable<string>> WorksheetNames { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var result = new List<string>();
            string status = "Success";

            Excel.Workbook workbook = null;
        
            try
            {
                workbook = WorkbookInstance.Get(context);
               
                if (workbook == null)
                    throw new InvalidOperationException("Workbook instance is not provided or is invalid.");
               
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
                status = $"Successfully retrieved {result.Count} worksheet(s) from workbook '{workbook.Name}'.";
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
                if (workbook != null)
                    Marshal.ReleaseComObject(workbook);

                StatusMessage.Set(context, status);
            }
        }
    }
}