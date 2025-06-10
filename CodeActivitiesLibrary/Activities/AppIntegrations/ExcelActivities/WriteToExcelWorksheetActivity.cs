using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Write to Excel Worksheet")]
    [Description("Writes a value to a specific cell or range of cells in an Excel worksheet.")]
    public class WriteToExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target worksheet.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]
        [DisplayName("Value To Write")]
        [Description("The value to write into the specified cell or range.")]
        public InArgument<string> ValueToWrite { get; set; }

        [RequiredArgument]
        [DisplayName("Write Mode")]
        [Description("Specifies how to determine the target cell(s) for writing.")]
        [DefaultValue(ExcelCellWriteModeEnum.OnSpecifiedCell)]
        public InArgument<ExcelCellWriteModeEnum> WriteMode { get; set; }


        [DisplayName("Column")]
        [Description(
            "The column letter (e.g., 'A', 'B') where the data should be written (required if 'Write Mode' is 'On Specified Cell').")]
        [RenderIfCondition(nameof(WriteMode), ExcelCellWriteModeEnum.OnSpecifiedCell)]
        public InArgument<string> Column { get; set; }


        [DisplayName("Row")]
        [Description(
            "The row number where the data should be written (required if 'Write Mode' is 'On Specified Cell').")]
        [RenderIfCondition(nameof(WriteMode), ExcelCellWriteModeEnum.OnSpecifiedCell)]
        public InArgument<int> Row { get; set; }


        [DisplayName("Name")]
        [Description("The name of the named range to write to (required if 'Write Mode' is 'On Named Cells').")]
        [RenderIfCondition(nameof(WriteMode), ExcelCellWriteModeEnum.OnNamedCells)]
        public InArgument<string> Name { get; set; }


        [DisplayName("Populate Entire Range")]
        [Description("If true, populates the entire named range with the same value.")]
        [RenderIfCondition(nameof(WriteMode), ExcelCellWriteModeEnum.OnNamedCells)]
        public InArgument<bool> PopulateEntireRange { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var excelApp = ExcelApplication.Get(context);
                var valueToWrite = ValueToWrite.Get(context);
                var writeMode = WriteMode.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                Excel.Worksheet ws = excelApp.ActiveSheet;

                switch (writeMode)
                {
                    case ExcelCellWriteModeEnum.OnSpecifiedCell:
                        {
                            var colLetter = Column.Get(context);
                            var rowNumber = Row.Get(context);

                            if (string.IsNullOrWhiteSpace(colLetter))
                                throw new ArgumentException("Column cannot be empty when using 'On Specified Cell' mode.");

                            var colIndex = GetColumnIndex(colLetter);

                            Excel.Range targetCell = ws.Cells[rowNumber, colIndex];
                            if (targetCell == null)
                                throw new ArgumentException($"Invalid cell reference: {colLetter}{rowNumber}");

                            targetCell.Value = valueToWrite;
                            break;
                        }

                    case ExcelCellWriteModeEnum.OnCurrentlyActiveCell:
                        {
                            var activeCell = ws.Application.Selection as Excel.Range;
                            if (activeCell == null)
                                throw new InvalidOperationException("No active cell found.");

                            activeCell.Value = valueToWrite;
                            break;
                        }

                    case ExcelCellWriteModeEnum.OnNamedCells:
                        {
                            var name = Name.Get(context);
                            var populateEntireRange = PopulateEntireRange.Get(context);

                            if (string.IsNullOrWhiteSpace(name))
                                throw new ArgumentException("Name cannot be empty when using 'On Named Cells' mode.");

                            var namedRange = ws.Names.Item(name)?.RefersToRange;
                            if (namedRange == null)
                                throw new ArgumentException($"Named range '{name}' not found.");

                            if (populateEntireRange)
                                namedRange.Value = valueToWrite;
                            else
                                namedRange.Cells[1, 1].Value = valueToWrite;

                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(writeMode));
                }
            }
            catch (Exception ex)
            {
                status = $"Error writing to Excel: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        private static int GetColumnIndex(string columnName)
        {
            if (string.IsNullOrWhiteSpace(columnName))
                throw new ArgumentException("Column name cannot be empty.", nameof(columnName));

            columnName = columnName.ToUpperInvariant();

            return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
        }
    }
}