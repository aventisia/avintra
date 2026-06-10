using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Linq;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Write Array Values to Excel Worksheet")]
    [Description("Writes a value or array of values to a row or range in an Excel worksheet.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class WriteToExcelArrayValuesActivity : BaseCodeActivity
    {
        // -----------------------
        // Input Arguments
        // -----------------------

        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The target Excel Worksheet object where data will be written.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Value(s) To Write")]
        [Description("A single value, or an array/list of values to write across columns.")]
        public InArgument<object> ValueToWrite { get; set; }

        [RequiredArgument]
        [DisplayName("Write Mode")]
        [Description("Specifies how to determine the target cell(s) for writing.")]
        [DefaultValue(ExcelCellWriteModeEnum.OnSpecifiedCell)]
        public InArgument<ExcelCellWriteModeEnum> WriteMode { get; set; }

        // --- Specified Cell Mode ---
        [DisplayName("Column Index")]
        [Description("Starting column index (1 = A). Takes precedence if > 0.")]
        [RenderIfCondition(nameof(WriteMode), ExcelCellWriteModeEnum.OnSpecifiedCell)]
        public InArgument<int> ColumnIndex { get; set; }

        [DisplayName("Row")]
        [Description("Row number to write to.")]
        [RenderIfCondition(nameof(WriteMode), ExcelCellWriteModeEnum.OnSpecifiedCell)]
        public InArgument<int> Row { get; set; }

        // --- Named Range Mode ---
        [DisplayName("Name")]
        [Description("The name of the named range to write to (required if 'Write Mode' is 'On Named Cells').")]
        [RenderIfCondition(nameof(WriteMode), ExcelCellWriteModeEnum.OnNamedCells)]
        public InArgument<string> Name { get; set; }

        [DisplayName("Populate Entire Range")]
        [Description("If true, populates the entire named range with the same value.")]
        public InArgument<bool> PopulateEntireRange { get; set; }

        // -----------------------
        // Execution Logic
        // -----------------------
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
                    throw new InvalidOperationException("Worksheet instance is null or not provided.");

                switch (writeMode)
                {
                    // ------------------- SPECIFIED CELL -------------------
                    case ExcelCellWriteModeEnum.OnSpecifiedCell:
                        {
                            int rowNumber = Row.Get(context);
                            int startColIndex = ColumnIndex.Get(context);

                            if (startColIndex <= 0)
                                throw new ArgumentException("Column Index must be provided and greater than zero.");

                            if (rowNumber <= 0)
                                throw new ArgumentException("Row number must be greater than zero.");


                            if (rowNumber <= 0)
                                throw new ArgumentException("Row number must be greater than zero.");

                            // Handle single value or array/list
                            var valuesToWrite = ExtractValuesAsArray(rawValue);

                            // Write each value to adjacent columns
                            for (int i = 0; i < valuesToWrite.Length; i++)
                            {
                                Excel.Range cell = worksheet.Cells[rowNumber, startColIndex + i];
                                WriteSingleValueToCell(cell, valuesToWrite[i]);
                            }
                            break;
                        }

                    // ------------------- ACTIVE CELL -------------------
                    case ExcelCellWriteModeEnum.OnCurrentlyActiveCell:
                        {
                            var activeCell = worksheet.Application.Selection as Excel.Range;
                            if (activeCell == null)
                                throw new InvalidOperationException("No active cell found.");

                            var valuesToWrite = ExtractValuesAsArray(rawValue);
                            for (int i = 0; i < valuesToWrite.Length; i++)
                            {
                                Excel.Range cell = activeCell.Offset[0, i];
                                WriteSingleValueToCell(cell, valuesToWrite[i]);
                            }
                            break;
                        }

                    // ------------------- NAMED RANGE -------------------
                    case ExcelCellWriteModeEnum.OnNamedCells:
                        {
                            var name = Name.Get(context);
                            var populateEntireRange = PopulateEntireRange.Get(context);

                            if (string.IsNullOrWhiteSpace(name))
                                throw new ArgumentException("Named range name cannot be empty.");

                            Excel.Range namedRange = null;
                            try
                            {
                                // Access named range from the worksheet itself
                                namedRange = worksheet.Range[name];
                            }
                            catch
                            {
                                throw new ArgumentException($"Named range '{name}' not found in worksheet '{worksheet.Name}'.");
                            }

                            if (namedRange == null)
                                throw new ArgumentException($"Named range '{name}' not found in worksheet '{worksheet.Name}'.");

                            if (rawValue is DataTable dataTable)
                            {
                                if (dataTable.Rows.Count == 0 || dataTable.Columns.Count == 0)
                                    throw new ArgumentException("DataTable is empty.");
                                WriteDataTableToRange(namedRange, dataTable, populateEntireRange);
                            }
                            else
                            {
                                var valuesToWrite = ExtractValuesAsArray(rawValue);
                                if (populateEntireRange)
                                {
                                    int totalCells = namedRange.Cells.Count;
                                    int valueCount = valuesToWrite.Length;
                                    for (int i = 1; i <= totalCells; i++)
                                    {
                                        Excel.Range cell = namedRange.Cells[i];
                                        var value = valuesToWrite[(i - 1) % valueCount];
                                        WriteSingleValueToCell(cell, value);
                                    }
                                }
                                else
                                {
                                    // Just write first value to top-left
                                    namedRange.Cells[1, 1].Value = FormatValue(valuesToWrite.FirstOrDefault());
                                }
                            }
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(writeMode));
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Successfully wrote values to Excel worksheet.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error writing to Excel worksheet: {ex.Message}");
            }
        }

        private object[] ExtractValuesAsArray(object value)
        {
            if (value == null) return new object[] { null };

            // Handle arrays
            if (value.GetType().IsArray)
                return ((Array)value).Cast<object>().ToArray();

            // Handle IList (List<T>, etc.)
            if (value is IList list)
            {
                var result = new object[list.Count];
                for (int i = 0; i < list.Count; i++)
                    result[i] = list[i];
                return result;
            }

            // Single value → wrap in array
            return new object[] { value };
        }

        private void WriteSingleValueToCell(Excel.Range cell, object value)
        {
            cell.Value = FormatValue(value);
            if (value is string str && str.Contains("\n"))
                cell.WrapText = true;
        }

        private object FormatValue(object value)
        {
            if (value == null) return string.Empty;
            if (value is string s) return s;
            if (value is IEnumerable<string> stringEnumerable)
                return string.Join(Environment.NewLine, stringEnumerable);

            return value.ToString();
        }

        // --- Keep your existing helpers ---
        private void WriteDataTableToRange(Excel.Range startCell, DataTable dataTable, bool populateEntireRange)
        {
            if (dataTable.Rows.Count == 0 || dataTable.Columns.Count == 0)
                return;

            int rowCount = dataTable.Rows.Count;
            int colCount = dataTable.Columns.Count;
            object[,] values = new object[rowCount + 1, colCount];

            for (int c = 0; c < colCount; c++)
                values[0, c] = dataTable.Columns[c].ColumnName;

            for (int r = 0; r < rowCount; r++)
                for (int c = 0; c < colCount; c++)
                    values[r + 1, c] = dataTable.Rows[r][c];

            Excel.Range targetRange = startCell.Resize[rowCount + 1, colCount];
            targetRange.Value = values;
        }

        private static int GetColumnIndex(string columnName)
        {
            if (string.IsNullOrWhiteSpace(columnName))
                throw new ArgumentException("Column name c4o    annot be empty.", nameof(columnName));

            columnName = columnName.ToUpperInvariant();
            return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
        }
    }

}
