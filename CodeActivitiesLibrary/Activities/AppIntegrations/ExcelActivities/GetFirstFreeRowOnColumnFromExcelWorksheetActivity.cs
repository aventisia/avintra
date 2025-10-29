using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Get First Free Row on Column from Excel Worksheet")]
    [Description("Retrieves the first free row number for a specific column from the given worksheet.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class GetFirstFreeRowOnColumnFromExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Workbook Instance")]
        [Description("The Excel Workbook instance containing the target worksheet.")]
        public InArgument<Excel.Workbook> WorkbookInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The target Excel worksheet instance to analyze.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Column Index")]
        [Description("The 1-based index of the column to check for the first free row.")]
        public InArgument<int> ColumnIndex { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("First Free Row")]
        [Description("Returns the first free row number in the specified column.")]
        public OutArgument<int> FirstFreeRow { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var workbook = WorkbookInstance.Get(context);
                var worksheet = WorksheetInstance.Get(context);
                var colIndex = ColumnIndex.Get(context);

                if (workbook == null)
                    throw new InvalidOperationException("Workbook instance is required but was not provided.");

                if (worksheet == null)
                    worksheet = workbook.ActiveSheet as Excel.Worksheet;

                if (worksheet == null)
                    throw new InvalidOperationException("Worksheet instance is not available or invalid.");

                if (colIndex < 1 || colIndex > worksheet.Columns.Count)
                    throw new ArgumentOutOfRangeException(nameof(colIndex),
                        $"Invalid column index {colIndex}. Must be between 1 and {worksheet.Columns.Count}.");

                // Get the column range
                Excel.Range columnRange = worksheet.Columns[colIndex];
                if (columnRange == null)
                    throw new InvalidOperationException($"Column {colIndex} could not be accessed in the worksheet.");

                // Find the last used cell in that column
                Excel.Range lastUsedCell = worksheet.Cells[worksheet.Rows.Count, colIndex].End[Excel.XlDirection.xlUp];

                int firstFreeRow;
                // Handle case where column is completely empty
                if (lastUsedCell.Row == 1 && string.IsNullOrEmpty(Convert.ToString(lastUsedCell.Value2)))
                {
                    firstFreeRow = 1;
                }
                else
                {
                    firstFreeRow = lastUsedCell.Row + 1;
                }

                // Set outputs
                FirstFreeRow.Set(context, firstFreeRow);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"First free row in column {colIndex}: {firstFreeRow}");
            }
            catch (Exception ex)
            {
                FirstFreeRow.Set(context, 0);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving first free row: {ex.Message}");
            }
        }
    }
}