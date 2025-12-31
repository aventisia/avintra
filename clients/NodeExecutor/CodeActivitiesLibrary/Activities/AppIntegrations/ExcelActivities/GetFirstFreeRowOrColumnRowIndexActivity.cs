using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    public class GetFirstFreeRowOrColumnRowIndexActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Workbook Instance")]
        [Description("The Excel Workbook instance containing the target worksheet.")]
        public InArgument<Excel.Workbook> WorkbookInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The target Excel worksheet instance to analyze.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Row Index")]
        [Description("The 1-based index of the row to check for the first free column.")]
        public InArgument<int> RowIndex { get; set; }

        // OUT Arguments
        [DisplayName("First free column")]
        [Description("Returns the first free column number in the specified row.")]
        public OutArgument<int> FirstFreeColumnCount { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var workbook = WorkbookInstance.Get(context);
                var worksheet = WorksheetInstance.Get(context);
                var rowIndex = RowIndex.Get(context);

                if (workbook == null)
                {
                    throw new InvalidOperationException("Workbook instance is required.");
                }
                if (worksheet == null)
                {
                    worksheet = workbook.ActiveSheet as Excel.Worksheet;

                }
                if (worksheet == null)
                {
                    throw new InvalidOperationException("Workbook Instance is required");
                }
                if (rowIndex < 1 || rowIndex > worksheet.Rows.Count)
                {
                    throw new ArgumentOutOfRangeException(nameof(rowIndex),
                    $"Invalid row index {rowIndex}. Row index must be between 1 and {worksheet.Rows.Count}.");
                }

                // Get the Row Range of the worksheet.
                Excel.Range rowRange = worksheet.Rows[rowIndex];
                if (rowRange == null)
                {
                    throw new InvalidOperationException($"RowIndex {rowIndex} not found in the worksheet");
                }
                // find the last used cell in worksheet (rows).
                Excel.Range lastUsedRowCell = worksheet.Cells[worksheet.Columns.Count, rowIndex].End[Excel.XlDirection.xlToLeft];

                int firstFreeColumn;
                // validate column existance
                if (lastUsedRowCell.Column == 1 && string.IsNullOrEmpty(Convert.ToString(lastUsedRowCell.Value2)))
                {
                    firstFreeColumn = 1;
                }
                else
                {
                    firstFreeColumn = lastUsedRowCell.Column + 1;
                }
                // Set outputs
                FirstFreeColumnCount.Set(context, firstFreeColumn);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"First free column in row {rowIndex}: {firstFreeColumn}");
            }
            catch (Exception ex)
            {
                FirstFreeColumnCount.Set(context, 0);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving first free column: {ex.Message}");
            }

        }

    }
}
