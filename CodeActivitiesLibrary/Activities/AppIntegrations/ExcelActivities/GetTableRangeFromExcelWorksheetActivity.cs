using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Get Table Range from Excel Worksheet")]
    [Description("Retrieves the range address (e.g., 'A1:B10') of a specified table or pivot table in the provided Excel worksheet.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class GetTableRangeFromExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The Excel Worksheet object containing the target table or pivot table.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Table Name")]
        [Description("The name of the table (ListObject) or pivot table to retrieve the range for.")]
        public InArgument<string> TableName { get; set; }

        [DisplayName("Is Pivot Table")]
        [Description("If true, retrieves the range of a pivot table instead of a regular table.")]
        public InArgument<bool> IsPivotTable { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("First Column Index")]
        [Description("Returns the column index of the first cell in the table range.")]
        public OutArgument<int> FirstColumnIndex { get; set; }

        [DisplayName("First Row Index")]
        [Description("Returns the row index of the first cell in the table range.")]
        public OutArgument<int> FirstRowIndex { get; set; }

        [DisplayName("Last Column Index")]
        [Description("Returns the column index of the last cell in the table range.")]
        public OutArgument<int> LastColumnIndex { get; set; }

        [DisplayName("Last Row Index")]
        [Description("Returns the row index of the last cell in the table range.")]
        public OutArgument<int> LastRowIndex { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var worksheet = WorksheetInstance.Get(context);
                var tableName = TableName.Get(context);
                var isPivotTable = IsPivotTable.Get(context);

                if (worksheet == null)
                    throw new InvalidOperationException("Worksheet instance is required but was not provided.");

                if (string.IsNullOrWhiteSpace(tableName))
                    throw new ArgumentException("Table name must be provided.");

                Excel.Range tableRange = null;

                if (isPivotTable)
                {
                    // --- Retrieve Pivot Table ---
                    foreach (Excel.PivotTable pt in worksheet.PivotTables())
                    {
                        if ((pt.Name ?? "").Equals(tableName, StringComparison.OrdinalIgnoreCase))
                        {
                            tableRange = pt.TableRange1;
                            break;
                        }
                    }
                }
                else
                {
                    // --- Retrieve Regular Excel Table (ListObject) ---
                    Excel.ListObject table = null;
                    foreach (Excel.ListObject lo in worksheet.ListObjects)
                    {
                        if ((lo.Name ?? "").Equals(tableName, StringComparison.OrdinalIgnoreCase))
                        {
                            table = lo;
                            break;
                        }
                    }

                    if (table == null)
                        throw new ArgumentException($"Table '{tableName}' not found in worksheet '{worksheet.Name}'.");

                    tableRange = table.Range;
                }

                if (tableRange == null)
                    throw new InvalidOperationException($"Table or PivotTable '{tableName}' not found or range could not be retrieved.");

                // --- Extract Range Boundaries ---
                int firstCol = tableRange.Column;
                int firstRow = tableRange.Row;
                int lastCol = firstCol + tableRange.Columns.Count - 1;
                int lastRow = firstRow + tableRange.Rows.Count - 1;

                // --- Set Output Arguments ---
                FirstColumnIndex.Set(context, firstCol);
                FirstRowIndex.Set(context, firstRow);
                LastColumnIndex.Set(context, lastCol);
                LastRowIndex.Set(context, lastRow);

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully retrieved range for '{tableName}' (R{firstRow}C{firstCol} to R{lastRow}C{lastCol}).");
            }
            catch (Exception ex)
            {
                // --- Reset Outputs on Error ---
                FirstColumnIndex.Set(context, 0);
                FirstRowIndex.Set(context, 0);
                LastColumnIndex.Set(context, 0);
                LastRowIndex.Set(context, 0);

                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving table range: {ex.Message}");
            }
        }
    }
}
