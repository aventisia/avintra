using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Get Table Range from Excel Worksheet")]
    [Description("Retrieves the range address (e.g., 'A1:B10') of a specified table in the active Excel worksheet.")]
    public class GetTableRangeFromExcelWorksheetActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target worksheet.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Table Name")]
        [Description("The name of the table (ListObject) or pivot table to retrieve the range for.")]
        public InArgument<string> TableName { get; set; }

        [Category("Input")]
        [DisplayName("Is Pivot Table")]
        [Description("If true, retrieves the range of a pivot table instead of a regular table.")]
        public InArgument<bool> IsPivotTable { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")]
        [DisplayName("First Column Index")]
        [Description("Returns the column index of the first cell in the table range.")]
        public OutArgument<int> FirstColumnIndex { get; set; }

        [Category("Output")]
        [DisplayName("First Row Index")]
        [Description("Returns the row index of the first cell in the table range.")]
        public OutArgument<int> FirstRowIndex { get; set; }

        [Category("Output")]
        [DisplayName("Last Column Index")]
        [Description("Returns the column index of the last cell in the table range.")]
        public OutArgument<int> LastColumnIndex { get; set; }

        [Category("Output")]
        [DisplayName("Last Row Index")]
        [Description("Returns the row index of the last cell in the table range.")]
        public OutArgument<int> LastRowIndex { get; set; }

        [Category("Output")] 

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var excelApp = ExcelApplication.Get(context);
                var tableName = TableName.Get(context);
                var isPivotTable = IsPivotTable.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                if (!(excelApp.ActiveSheet is Excel.Worksheet ws))
                    throw new InvalidOperationException("Active sheet is not a valid Excel worksheet.");

                Excel.Range tableRange = null;

                if (isPivotTable)
                    // Find pivot table by name
                    foreach (var pt in ws.PivotTables())
                    {
                        if (!(pt.Name ?? "").Equals(tableName, StringComparison.OrdinalIgnoreCase)) continue;
                        tableRange = pt.TableRange1;
                        break;
                    }
                else
                    // Find regular table (ListObject) by name
                    try
                    {
                        var table = ws.ListObjects[tableName];
                        tableRange = table.Range;
                    }
                    catch
                    {
                        throw new ArgumentException($"Table '{tableName}' not found.");
                    }

                if (tableRange == null)
                    throw new InvalidOperationException("Table range could not be retrieved.");

                // Extract range bounds
                var firstCol = tableRange.Column;
                var firstRow = tableRange.Row;
                var lastCol = tableRange.Columns.Count + firstCol - 1;
                var lastRow = tableRange.Rows.Count + firstRow - 1;

                FirstColumnIndex.Set(context, firstCol);
                FirstRowIndex.Set(context, firstRow);
                LastColumnIndex.Set(context, lastCol);
                LastRowIndex.Set(context, lastRow);
            }
            catch (Exception ex)
            {
                status = $"Error retrieving table range: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}