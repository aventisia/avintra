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
    public class ReadFromExcelWorksheetActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

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
        [Description("The starting column of the range to read (required if 'Retrieve Mode' is 'Range of Cells').")]
        [RenderIfCondition(nameof(RetrieveMode), "RangeOfCells")]
        public InArgument<string> StartColumn { get; set; }


        [DisplayName("Start Row")]
        [Description("The starting row of the range to read (required if 'Retrieve Mode' is 'Range of Cells').")]
        [RenderIfCondition(nameof(RetrieveMode), "RangeOfCells")]
        public InArgument<int> StartRow { get; set; }


        [DisplayName("End Column")]
        [Description("The ending column of the range to read (required if 'Retrieve Mode' is 'Range of Cells').")]
        [RenderIfCondition(nameof(RetrieveMode), "RangeOfCells")]
        public InArgument<string> EndColumn { get; set; }


        [DisplayName("End Row")]
        [Description("The ending row of the range to read (required if 'Retrieve Mode' is 'Range of Cells').")]
        [RenderIfCondition(nameof(RetrieveMode), "RangeOfCells")]
        public InArgument<int> EndRow { get; set; }


        [DisplayName("Name")]
        [Description("The name of the named range to read (required if 'Retrieve Mode' is 'Values of Named Cells').")]
        [RenderIfCondition(nameof(RetrieveMode), "ValuesOfNamedCells")]
        public InArgument<string> Name { get; set; }


        [DisplayName("Get Cell Contents as Text")]
        [Description("If true, retrieves cell contents as text; otherwise, retrieves raw values.")]
        public InArgument<bool> GetContentsAsText { get; set; }


        [DisplayName("First Line of Range Contains Column Names")]
        [Description("If true, treats the first row as column names.")]
        public InArgument<bool> FirstLineContainsColumnNames { get; set; }


        [DisplayName("Omit Empty Columns and Rows")]
        [Description("If true, omits empty columns to the right and empty rows at the bottom.")]
        [RenderIfCondition(nameof(RetrieveMode), "ValuesOfNamedCells")]
        public InArgument<bool> OmitEmptyColumnsAndRows { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Excel Data")]
        [Description("Returns the data read from the specified range as a DataTable.")]
        public OutArgument<DataTable> ExcelData { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";
            DataTable dataTable = null;

            try
            {
                var excelApp = ExcelApplication.Get(context);
                var retrieveMode = RetrieveMode.Get(context);
                var startCol = StartColumn.Get(context);
                var startRow = StartRow.Get(context);
                var endCol = EndColumn.Get(context);
                var endRow = EndRow.Get(context);
                var name = Name.Get(context);
                var getContentsAsText = GetContentsAsText.Get(context);
                var firstLineContainsColumnNames = FirstLineContainsColumnNames.Get(context);
                var omitEmptyColumnsAndRows = OmitEmptyColumnsAndRows.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                if (!(excelApp.ActiveSheet is Excel.Worksheet ws))
                    throw new InvalidOperationException("Active sheet is not a valid Excel worksheet.");

                switch (retrieveMode)
                {
                    case ExcelRetrieveModeEnum.SingleCell:
                        {
                            var cell = ws.Cells[startRow, GetColumnIndex(startCol)];
                            dataTable = new DataTable();
                            dataTable.Columns.Add("Value");
                            dataTable.Rows.Add(cell.Value);
                            break;
                        }

                    case ExcelRetrieveModeEnum.RangeOfCells:
                        {
                            var range = ws.Range[ws.Cells[startRow, GetColumnIndex(startCol)],
                                ws.Cells[endRow, GetColumnIndex(endCol)]];
                            dataTable = ReadRange(range, getContentsAsText, firstLineContainsColumnNames);
                            break;
                        }

                    case ExcelRetrieveModeEnum.Selection:
                        {
                            if (!(excelApp.Selection is Excel.Range selection))
                                throw new InvalidOperationException("No range is selected.");

                            dataTable = ReadRange(selection, getContentsAsText, firstLineContainsColumnNames);
                            break;
                        }

                    case ExcelRetrieveModeEnum.AllAvailableValues:
                        {
                            var usedRange = ws.UsedRange;
                            dataTable = ReadRange(usedRange, getContentsAsText, firstLineContainsColumnNames);
                            break;
                        }

                    case ExcelRetrieveModeEnum.ValuesOfNamedCells:
                        {
                            var namedRange = ws.Names.Item(name)?.RefersToRange;
                            if (namedRange == null)
                                throw new ArgumentException($"Named range '{name}' not found.");

                            dataTable = ReadRange(namedRange, getContentsAsText, firstLineContainsColumnNames);

                            if (omitEmptyColumnsAndRows)
                                // Trim empty columns and rows
                                dataTable = TrimEmptyColumnsAndRows(dataTable);

                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(retrieveMode));
                }
            }
            catch (Exception ex)
            {
                status = $"Error reading from Excel: {ex.Message}";
            }

            ExcelData.Set(context, dataTable);
            StatusMessage.Set(context, status);
        }

        private static DataTable ReadRange(Excel.Range range, bool getContentsAsText, bool firstLineContainsColumnNames)
        {
            var dataTable = new DataTable();

            try
            {
                var rowCount = range.Rows.Count;
                var colCount = range.Columns.Count;

                // Add columns dynamically
                for (var j = 1; j <= colCount; j++)
                {
                    var cellValue = (range.Cells[1, j] as Excel.Range)?.Text?.ToString() ?? $"Column{j}";
                    dataTable.Columns.Add(cellValue);
                }

                // Add rows
                for (var i = 1; i <= rowCount; i++)
                {
                    var row = dataTable.NewRow();
                    for (var j = 1; j <= colCount; j++)
                    {
                        var cell = range.Cells[i, j] as Excel.Range;
                        row[j - 1] = getContentsAsText ? cell.Text : cell.Value;
                    }

                    dataTable.Rows.Add(row);
                }

                if (!firstLineContainsColumnNames)
                    // Remove the first row if it's treated as data
                    if (dataTable.Rows.Count > 0)
                        dataTable.Rows.RemoveAt(0);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }

            return dataTable;
        }

        private static DataTable TrimEmptyColumnsAndRows(DataTable dataTable)
        {
            // Trim empty columns
            for (var i = dataTable.Columns.Count - 1; i >= 0; i--)
                if (dataTable.AsEnumerable().All(row => row.IsNull(i)))
                    dataTable.Columns.RemoveAt(i);

            // Trim empty rows
            for (var i = dataTable.Rows.Count - 1; i >= 0; i--)
                if (dataTable.Rows[i].ItemArray.All(item => item == DBNull.Value))
                    dataTable.Rows.RemoveAt(i);

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
    }
}