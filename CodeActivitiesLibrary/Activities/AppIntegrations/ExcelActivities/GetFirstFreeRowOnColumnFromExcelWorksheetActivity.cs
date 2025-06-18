using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Get First Free Row on Column from Excel Worksheet")]
    [Description("Retrieves the first free row number for a specific column from the active worksheet.")]
    public class GetFirstFreeRowOnColumnFromExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target worksheet.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

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
            var status = "Success";
            var result = 0;

            try
            {
                var excelApp = ExcelApplication.Get(context);
                var colIndex = ColumnIndex.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                if (!(excelApp.ActiveSheet is Excel.Worksheet ws))
                    throw new InvalidOperationException("Active sheet is not available or not a valid worksheet.");

                // Validate column index
                if (colIndex < 1 || colIndex > ws.Columns.Count)
                    throw new ArgumentException(
                        $"Invalid column index: {colIndex}. Must be between 1 and {ws.Columns.Count}.");

                // Find the last used cell in the specified column

                if (!(ws.Cells[ws.Rows.Count, colIndex] is Excel.Range lastCell))
                    throw new InvalidOperationException($"Column {colIndex} does not exist in the active worksheet.");

                // Find the first empty cell below the last used cell
                var nextEmptyCell = (Excel.Range)lastCell.End[Excel.XlDirection.xlUp].Offset[1, 0];

                result = nextEmptyCell.Row;
                FirstFreeRow.Set(context, result);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error retrieving first free row: {ex.Message}";
                result = 0;
                FirstFreeRow.Set(context, result);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}