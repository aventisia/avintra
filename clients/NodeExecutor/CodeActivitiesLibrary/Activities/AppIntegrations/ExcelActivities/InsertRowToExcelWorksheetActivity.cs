using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Insert Row to Excel Worksheet")]
    [Description("Inserts a new row above the specified row in the provided Excel worksheet.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class InsertRowToExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The Excel Worksheet object where the new row will be inserted.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Row Index")]
        [Description("The 1-based index of the row where the new row should be inserted (inserted above this row).")]
        public InArgument<int> RowIndex { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var worksheet = WorksheetInstance.Get(context);
                var rowIndex = RowIndex.Get(context);

                if (worksheet == null)
                    throw new InvalidOperationException("Worksheet instance is required but was not provided.");

                // Validate row index
                if (rowIndex < 1 || rowIndex > worksheet.Rows.Count)
                    throw new ArgumentOutOfRangeException(nameof(RowIndex),
                        $"Row index must be between 1 and {worksheet.Rows.Count}.");

                // Insert new row above the specified index
                (worksheet.Rows[rowIndex] as Excel.Range)?.Insert();

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully inserted new row above row {rowIndex}.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error inserting row: {ex.Message}");
            }
            
        }
    }
}