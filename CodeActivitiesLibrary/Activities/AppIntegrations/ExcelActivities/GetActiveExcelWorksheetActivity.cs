using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Get Active Excel Worksheet")]
    [Description("Retrieves the name and index of the currently active worksheet in a given Excel workbook.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class GetActiveExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Workbook Instance")]
        [Description("The Excel Workbook object from which to retrieve the active worksheet.")]
        public InArgument<Excel.Workbook> WorkbookInstance { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("Sheet Name")]
        [Description("Returns the name of the currently active worksheet.")]
        public OutArgument<string> SheetName { get; set; }

        [DisplayName("Sheet Index")]
        [Description("Returns the index of the currently active worksheet.")]
        public OutArgument<int> SheetIndex { get; set; }

        [DisplayName("Active Worksheet Instance")]
        [Description("Returns the active worksheet instance.")]
        public OutArgument<Excel.Worksheet> ActiveWorksheet { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            string sheetName = "";
            int sheetIndex = 0;

            try
            {
                var workbook = WorkbookInstance.Get(context);

                if (workbook == null)
                    throw new InvalidOperationException("Workbook instance cannot be null.");

                if (!(workbook.ActiveSheet is Excel.Worksheet ws))
                    throw new InvalidOperationException("No active worksheet found in the workbook.");

                sheetName = ws.Name;
                sheetIndex = ws.Index;

                // Set outputs
                SheetName.Set(context, sheetName);
                SheetIndex.Set(context, sheetIndex);
                ActiveWorksheet.Set(context, ws);

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Active worksheet retrieved successfully: {sheetName}");
            }
            catch (Exception ex)
            {
                SheetName.Set(context, "");
                SheetIndex.Set(context, 0);
                ActiveWorksheet.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving active worksheet: {ex.Message}");
            }
        }
    }
}