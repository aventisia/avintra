using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.DataTransformations.DataTableActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Linq;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Write to Excel Worksheet")]
    [Description("Writes a value to a specific cell or range of cells in an Excel worksheet.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class WriteToExcelWorksheetActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The Excel Worksheet object where the value will be written.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Value To Write")]
        [Description("The value (text or DataTable) to write into the specified cell or range.")]
        public InArgument<object> ValueToWrite { get; set; }

        [RequiredArgument]
        [DisplayName("Write Mode")]
        [Description("Specifies how to determine the target cell(s) for writing.")]
        [DefaultValue(ExcelCellWriteModeEnum.OnSpecifiedCell)]
        public InArgument<ExcelCellWriteModeEnum> WriteMode { get; set; }

        [DisplayName("Column Index")]
        [Description("The index of the column (1 for 'A'). Takes precedence if greater than 0.")]
        [RenderIfCondition(nameof(WriteMode), ExcelCellWriteModeEnum.OnSpecifiedCell)]
        public InArgument<int> ColumnIndex { get; set; }

        [DisplayName("Row")]
        [Description("The row number where the data should be written.")]
        [RenderIfCondition(nameof(WriteMode), ExcelCellWriteModeEnum.OnSpecifiedCell)]
        public InArgument<int> Row { get; set; }

        [DisplayName("Name")]
        [Description("The name of the named range to write to.")]
        [RenderIfCondition(nameof(WriteMode), ExcelCellWriteModeEnum.OnNamedCells)]
        public InArgument<string> Name { get; set; }

        [DisplayName("Populate Entire Range")]
        [Description("If true, populates the entire named range with the same value.")]
        public InArgument<bool> PopulateEntireRange { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var worksheet = WorksheetInstance.Get(context);
                var rawValue = ValueToWrite.Get(context);
                var writeMode = WriteMode.Get(context);

                if (worksheet == null)
                {
                    var excelApp = (Excel.Application)System.Runtime.InteropServices.Marshal.GetActiveObject("Excel.Application");
                    worksheet = excelApp?.ActiveSheet as Excel.Worksheet;
                }

                if (worksheet == null)
                    throw new InvalidOperationException("Worksheet instance is not provided or active sheet not found.");

                var workbook = worksheet.Parent as Excel.Workbook;

                switch (writeMode)
                {
                    case ExcelCellWriteModeEnum.OnSpecifiedCell:
                        {
                            int rowNumber = Row.Get(context);
                            int startColIndex = ColumnIndex.Get(context);

                            if (startColIndex <= 0)
                                throw new ArgumentException("Column Index must be provided and greater than zero.");

                            if (rowNumber <= 0)
                                throw new ArgumentException("Row number must be greater than zero.");


                            Excel.Range targetCell = worksheet.Cells[rowNumber, colIndex];
                            if (targetCell == null)
                                throw new ArgumentException($"Invalid cell reference at row {rowNumber} and column index {colIndex}.");

                            WriteValueToRange(targetCell, rawValue);
                            break;
                        }

                    case ExcelCellWriteModeEnum.OnCurrentlyActiveCell:
                        {
                            var activeCell = worksheet.Application.Selection as Excel.Range;
                            if (activeCell == null)
                                throw new InvalidOperationException("No active cell found in worksheet.");
                            WriteValueToRange(activeCell, rawValue);
                            break;
                        }

                    case ExcelCellWriteModeEnum.OnNamedCells:
                        {
                            var name = Name.Get(context);
                            var populateEntireRange = PopulateEntireRange.Get(context);

                            if (string.IsNullOrWhiteSpace(name))
                                throw new ArgumentException("Name cannot be empty when using 'On Named Cells' mode.");

                            Excel.Range namedRange = null;

                            // Try resolving the named range at workbook level, fallback to worksheet
                            try
                            {
                                namedRange = workbook?.Names?.Item(name)?.RefersToRange;
                            }
                            catch
                            {
                                try
                                {
                                    namedRange = worksheet?.Names?.Item(name)?.RefersToRange;
                                }
                                catch
                                {
                                    throw new ArgumentException($"Named range '{name}' not found in workbook or worksheet.");
                                }
                            }

                            if (namedRange == null)
                                throw new ArgumentException($"Named range '{name}' not found.");

                            if (rawValue is DataTable dataTable)
                            {
                                if (dataTable.Rows.Count == 0 || dataTable.Columns.Count == 0)
                                    throw new ArgumentException("DataTable is empty.");

                                WriteDataTableToRange(namedRange, dataTable, populateEntireRange);
                            }
                            else
                            {
                                string value = rawValue?.ToString();
                                if (string.IsNullOrEmpty(value))
                                    throw new ArgumentException("Value to write cannot be null or empty.");

                                if (populateEntireRange)
                                    namedRange.Value = value;
                                else
                                    namedRange.Cells[1, 1].Value = value;
                            }
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(writeMode));
                }

                // Set outputs on success
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Successfully wrote to Excel worksheet.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error writing to Excel worksheet: {ex.Message}");
            }
        }

        private void WriteValueToRange(Excel.Range range, object value)
        {
            if (value is DataTable dataTable)
            {
                WriteDataTableToRange(range, dataTable, false);
            }
            else
            {
                string finalValue = string.Empty;

                if (value == null)
                {
                    finalValue = string.Empty;
                }
                else if (value is string stringValue)
                {
                    finalValue = stringValue;
                }
                else if (value is IEnumerable<string> stringList)
                {
                    finalValue = string.Join(Environment.NewLine, stringList);
                }
                else
                {
                    finalValue = value.ToString();
                }

                range.Value = finalValue;

                // Optional: Wrap text in Excel cell to show line breaks
                range.WrapText = true;
            }
        }

        private void WriteDataTableToRange(Excel.Range startCell, DataTable dataTable, bool populateEntireRange)
        {
            if (dataTable.Rows.Count == 0 || dataTable.Columns.Count == 0)
                return;

            int rowCount = dataTable.Rows.Count;
            int colCount = dataTable.Columns.Count;

            object[,] values = new object[rowCount + 1, colCount]; // +1 for header

            // Write headers
            for (int c = 0; c < colCount; c++)
            {
                values[0, c] = dataTable.Columns[c].ColumnName;
            }

            // Write rows
            for (int r = 0; r < rowCount; r++)
            {
                for (int c = 0; c < colCount; c++)
                {
                    values[r + 1, c] = dataTable.Rows[r][c];
                }
            }

            Excel.Range targetRange = startCell.Resize[rowCount + 1, colCount];
            targetRange.Value = values;
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
