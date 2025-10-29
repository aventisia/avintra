using System;
using System.Activities;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using CodeActivitiesLibrary.Extensions;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Write Values to Specific Excel Columns")]
    [Description("Writes a list of values to user-specified Excel columns in a single row (e.g., value1→A, value2→D, value3→G).")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class WriteValuesToSpecificColumnsActivity : BaseCodeActivity
    {
       
        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The Excel Worksheet instance where values will be written.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Values to Write")]
        [Description("A list or array of values (e.g., from JSON fields).")]
        public InArgument<object> ValuesToWrite { get; set; }

        [RequiredArgument]
        [DisplayName("Target Columns")]
        [Description("Column letters for each value (e.g., ['A','D','G','E','W','X']). Must match value count.")]
        public InArgument<object> TargetColumns { get; set; }

        [RequiredArgument]
        [DisplayName("Row")]
        [Description("The row number to write the data to (e.g., 5).")]
        public InArgument<int> Row { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
               
                var worksheet = WorksheetInstance.Get(context);
                var rawValues = ValuesToWrite.Get(context);
                var rawColumns = TargetColumns.Get(context);
                var rowNumber = Row.Get(context);

                 if (worksheet == null)
                 {
                      var excelApp = (Excel.Application)System.Runtime.InteropServices.Marshal.GetActiveObject("Excel.Application");
                       worksheet = excelApp?.ActiveSheet as Excel.Worksheet;
                 }

                 if (worksheet == null)
                   throw new InvalidOperationException("No valid worksheet is available in the provided workbook.");

                if (rowNumber <= 0)
                    throw new ArgumentException("Row number must be greater than zero.");

                var valuesList = NormalizeToList(rawValues);
                var columnsList = NormalizeToStringList(rawColumns);

                if (valuesList == null || columnsList == null)
                    throw new ArgumentException("Values or Target Columns cannot be null.");

                if (valuesList.Count == 0)
                {
                    StatusMessage.Set(context, "No values to write.");
                    IsSuccess.Set(context, true);
                    return;
                }

                if (valuesList.Count != columnsList.Count)
                    throw new ArgumentException(
                        $"Number of values ({valuesList.Count}) must match number of columns ({columnsList.Count}).");

                // Write each value to its specified column in the same row
                for (int i = 0; i < valuesList.Count; i++)
                {
                    string colLetter = columnsList[i]?.Trim();
                    if (string.IsNullOrEmpty(colLetter))
                        throw new ArgumentException($"Column letter at position {i + 1} is null or empty.");

                    int colIndex = ConvertColumnLetterToIndex(colLetter);
                    Excel.Range cell = worksheet.Cells[rowNumber, colIndex];
                    cell.Value = FormatCellValue(valuesList[i]);

                    if (valuesList[i] is string str && str.Contains("\n"))
                        cell.WrapText = true;
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully wrote {valuesList.Count} values to row {rowNumber}.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error writing to Excel: {ex.Message}");
            }
        }

        private IList<object> NormalizeToList(object input)
        {
            if (input == null) return new List<object>();
            if (input is IList list) return list.Cast<object>().ToList();
            if (input.GetType().IsArray) return ((Array)input).Cast<object>().ToList();
            return new List<object> { input };
        }

        private IList<string> NormalizeToStringList(object input)
        {
            if (input == null) return new List<string>();
            if (input is IList list)
                return list.Cast<object>().Select(x => x?.ToString()).ToList();
            if (input.GetType().IsArray)
                return ((Array)input).Cast<object>().Select(x => x?.ToString()).ToList();
            return new List<string> { input?.ToString() };
        }

        private object FormatCellValue(object value)
        {
            if (value == null) return string.Empty;
            if (value is DateTime dt) return dt;
            if (value is bool || value is double || value is float ||
                value is decimal || value is int || value is long)
                return value;
            return value.ToString();
        }

        private static int ConvertColumnLetterToIndex(string columnLetter)
        {
            if (string.IsNullOrWhiteSpace(columnLetter))
                throw new ArgumentException("Column letter cannot be null or empty.");

            columnLetter = columnLetter.ToUpperInvariant().Trim();
            int index = 0;
            foreach (char c in columnLetter)
            {
                if (c < 'A' || c > 'Z')
                    throw new ArgumentException($"Invalid Excel column letter: '{columnLetter}'");
                index = index * 26 + (c - 'A' + 1);
            }
            return index;
        }
    }
}