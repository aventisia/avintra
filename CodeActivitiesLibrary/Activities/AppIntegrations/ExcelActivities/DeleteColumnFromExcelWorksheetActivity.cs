using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Delete Column from Excel Worksheet")]
    [Description("Deletes a specific column from the specified Excel worksheet instance.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class DeleteColumnFromExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The Excel Worksheet object from which the column will be deleted.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Column Index")]
        [Description("The index (1-based) or letter (e.g., 'A', 'B') of the column to delete.")]
        public InArgument<string> ColumnIndex { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {              
                var worksheet = WorksheetInstance.Get(context);
                var columnIndexInput = ColumnIndex.Get(context);

                if (worksheet == null)
                    throw new InvalidOperationException("Worksheet instance is null.");

                if (string.IsNullOrWhiteSpace(columnIndexInput))
                    throw new ArgumentException("Column index cannot be empty.");

                // Convert column input (letter or number) to numeric index
                int columnNumber;
                if (!int.TryParse(columnIndexInput, out columnNumber))
                {
                    columnNumber = GetColumnIndex(columnIndexInput);
                }

                if (columnNumber < 1 || columnNumber > worksheet.Columns.Count)
                    throw new ArgumentOutOfRangeException(nameof(ColumnIndex),
                        $"Column index must be between 1 and {worksheet.Columns.Count}.");

                // Delete the column safely
                ((Excel.Range)worksheet.Columns[columnNumber]).Delete();

                status = $"Successfully deleted column {columnIndexInput} (Index: {columnNumber}) from worksheet '{worksheet.Name}'.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);

            }
            catch (Exception ex)
            {
                status = $"Error deleting column: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }

        private int GetColumnIndex(string columnName)
        {
            if (string.IsNullOrWhiteSpace(columnName)) return -1;

            columnName = columnName.Trim().ToUpperInvariant();
          
            return columnName.Aggregate(0, (acc, c) => acc * 26 + (c - 'A' + 1));
        }
    }
}