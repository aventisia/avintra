using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data;
using System.Linq;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Read from Excel Worksheet")]
    [Description("Reads values from a specified cell range in the active Excel worksheet.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class ReadFromExcelWorksheetActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target worksheet.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]
        [DisplayName("Retrieve Mode")]
        [Description("Specifies how to retrieve data from the worksheet.")]
        [DefaultValue(ExcelRetrieveModeEnum.SingleCell)]
        public InArgument<ExcelRetrieveModeEnum> RetrieveMode { get; set; }


        [DisplayName("Start Column")]
        [Description("The starting column letter (e.g., 'A').")]
        [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.RangeOfCells)]
        public InArgument<string> StartColumn { get; set; }

        [DisplayName("Start Column Index")]
        [Description("The starting column index (e.g., 1 for 'A'). Takes precedence if greater than 0.")]
        [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.RangeOfCells)]
        public InArgument<int> StartColumnIndex { get; set; }

        [DisplayName("Start Row")]
        [Description("The starting row of the range to read.")]
        [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.RangeOfCells)]
        public InArgument<int> StartRow { get; set; }


        [DisplayName("End Column")]
        [Description("The ending column of the range to read (required if 'Retrieve Mode' is 'Range of Cells').")]
        [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.RangeOfCells)]
        public InArgument<string> EndColumn { get; set; }

        [DisplayName("End Column Index")]
        [Description("The ending column index (e.g., 4 for 'D'). Takes precedence if greater than 0.")]
        [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.RangeOfCells)]
        public InArgument<int> EndColumnIndex { get; set; }

        [DisplayName("End Row")]
        [Description("The ending row of the range to read (required if 'Retrieve Mode' is 'Range of Cells').")]
        [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.RangeOfCells)]
        public InArgument<int> EndRow { get; set; }


        [DisplayName("Name")]
        [Description("The name of the named range to read.")]
        [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.ValuesOfNamedCells)]
        public InArgument<string> Name { get; set; }


        [DisplayName("Get Cell Contents as Text")]
        [Description("If true, retrieves cell contents as text; otherwise, retrieves raw values.")]
        public InArgument<bool> GetContentsAsText { get; set; }


        [DisplayName("First Line of Range Contains Column Names")]
        [Description("If true, treats the first row as column names.")]
        public InArgument<bool> FirstLineContainsColumnNames { get; set; }


        [DisplayName("Omit Empty Columns and Rows")]
        [Description("If true, omits empty columns to the right and empty rows at the bottom.")]
        [RenderIfCondition(nameof(RetrieveMode), ExcelRetrieveModeEnum.ValuesOfNamedCells)]
        public InArgument<bool> OmitEmptyColumnsAndRows { get; set; }

        [DisplayName("Excel Data")]
        [Description("Returns the data read from the specified range as a DataTable.")]
        public OutArgument<DataTable> ExcelData { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            string status = "Starting Excel read...";
            DataTable dataTable = null;

            try
            {
                var excelApp = ExcelApplication.Get(context);
                var retrieveMode = RetrieveMode.Get(context);
                var startCol = StartColumn.Get(context);
                var startColIndex = StartColumnIndex.Get(context);
                var startRow = StartRow.Get(context);
                var endCol = EndColumn.Get(context);
                var endColIndex = EndColumnIndex.Get(context);
                var endRow = EndRow.Get(context);
                var name = Name.Get(context);
                var getContentsAsText = GetContentsAsText.Get(context);
                var firstLineContainsColumnNames = FirstLineContainsColumnNames.Get(context);
                var omitEmptyColumnsAndRows = OmitEmptyColumnsAndRows.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                if (!(excelApp.ActiveSheet is Excel.Worksheet ws))
                    throw new InvalidOperationException("Active sheet is not a valid Excel worksheet.");

                Log(context, "Excel worksheet detected. Starting read operation...");

                switch (retrieveMode)
                {
                    case ExcelRetrieveModeEnum.SingleCell:
                        {
                            int colIndex = startColIndex > 0 ? startColIndex : GetColumnIndex(startCol);
                            var cell = ws.Cells[startRow, colIndex] as Excel.Range;
                            dataTable = new DataTable();
                            dataTable.Columns.Add("Value");
                            dataTable.Rows.Add(getContentsAsText ? cell.Text : cell.Value2);
                            break;
                        }

                    case ExcelRetrieveModeEnum.RangeOfCells:
                        {
                            int startIndex = startColIndex > 0 ? startColIndex : GetColumnIndex(startCol);
                            int endIndex = endColIndex > 0 ? endColIndex : GetColumnIndex(endCol);

                            var range = ws.Range[ws.Cells[startRow, startIndex], ws.Cells[endRow, endIndex]];
                            dataTable = ReadRange(range, getContentsAsText, firstLineContainsColumnNames, omitEmptyColumnsAndRows);
                            break;
                        }

                    case ExcelRetrieveModeEnum.Selection:
                        {
                            if (!(excelApp.Selection is Excel.Range selection))
                                throw new InvalidOperationException("No range is selected.");

                            dataTable = ReadRange(selection, getContentsAsText, firstLineContainsColumnNames, omitEmptyColumnsAndRows);
                            break;
                        }

                    case ExcelRetrieveModeEnum.AllAvailableValues:
                        {
                            var usedRange = ws.UsedRange;
                            dataTable = ReadRange(usedRange, getContentsAsText, firstLineContainsColumnNames, omitEmptyColumnsAndRows);
                            break;
                        }

                    case ExcelRetrieveModeEnum.ValuesOfNamedCells:
                        {
                            var namedRange = ws.Names.Item(name)?.RefersToRange;
                            if (namedRange == null)
                                throw new ArgumentException($"Named range '{name}' not found.");

                            dataTable = ReadRange(namedRange, getContentsAsText, firstLineContainsColumnNames, omitEmptyColumnsAndRows);
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(retrieveMode));
                }

                ExcelData.Set(context, dataTable);

                if (dataTable != null)
                    Log(context, $"Excel read complete. Rows={dataTable.Rows.Count}, Cols={dataTable.Columns.Count}");

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Excel data read successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error reading from Excel: {ex.Message}";
                ExcelData.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
                Log(context, status);
            }
        }

        private static DataTable ReadRange(Excel.Range range, bool getContentsAsText, bool firstLineContainsColumnNames, bool trimEmpty)
        {
            var dataTable = new DataTable();

            int rowCount = range.Rows.Count;
            int colCount = range.Columns.Count;

            if (rowCount == 0 || colCount == 0)
                return dataTable;

            object[,] values = range.Value2 as object[,];
            if (values == null)
                return dataTable;

            int maxRow = values.GetLength(0);
            int maxCol = values.GetLength(1);

            if (trimEmpty)
            {
                while (maxRow > 1 && Enumerable.Range(1, maxCol).All(c => values[maxRow, c] == null))
                    maxRow--;

                while (maxCol > 1 && Enumerable.Range(1, maxRow).All(r => values[r, maxCol] == null))
                    maxCol--;
            }

            int startRow = firstLineContainsColumnNames ? 2 : 1;

            for (int j = 1; j <= maxCol; j++)
            {
                string columnName = $"Column{j}";
                if (firstLineContainsColumnNames)
                {
                    var header = values[1, j]?.ToString();
                    if (!string.IsNullOrWhiteSpace(header))
                        columnName = header;
                }
                dataTable.Columns.Add(columnName);
            }

            // Add rows
            for (int i = startRow; i <= maxRow; i++)
            {
                var row = dataTable.NewRow();
                for (int j = 1; j <= maxCol; j++)
                {
                    object val = values[i, j];
                    row[j - 1] = val ?? DBNull.Value;
                }
                dataTable.Rows.Add(row);
            }

            return dataTable;
        }

        // Helper method to convert column letter to index
        private static int GetColumnIndex(string columnName)
        {
            if (string.IsNullOrWhiteSpace(columnName))
                throw new ArgumentException("Column name cannot be empty.", nameof(columnName));

            columnName = columnName.ToUpperInvariant();

            return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
        }

        private void Log(CodeActivityContext context, string message)
        {
            // Append to StatusMessage output so it shows in logs
            var current = StatusMessage.Get(context) ?? string.Empty;
            StatusMessage.Set(context, $"{current}{Environment.NewLine}{message}");
        }
    }
}