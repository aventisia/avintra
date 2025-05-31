using System;
using System.Activities;
using System.ComponentModel;
using System.Data;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Paste Cells to Excel Worksheet")]
    [Description("Pastes a DataTable of data to the active Excel worksheet starting at the specified range.")]
    public class PasteDataTableToExcelWorksheetActivity : CodeActivity
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
        [DisplayName("Data Table")]
        [Description("The DataTable containing the data to paste into the Excel worksheet.")]
        public InArgument<DataTable> DataTable { get; set; }

        [RequiredArgument]
        [DefaultValue(1)]
        [Category("Input")]
        [DisplayName("Start Row")]
        [Description("The row number where pasting should start.")]
        public InArgument<long> StartRow { get; set; }

        [RequiredArgument]
        [DefaultValue(1)]
        [Category("Input")]
        [DisplayName("Start Column")]
        [Description("The column number where pasting should start.")]
        public InArgument<long> StartColumn { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")] public OutArgument<string> StatusMessage { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var excelApp = ExcelApplication.Get(context);
                var dataTable = DataTable.Get(context);
                var startRow = StartRow.Get(context);
                var startCol = StartColumn.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                if (!(excelApp.ActiveSheet is Excel.Worksheet ws))
                    throw new InvalidOperationException("Active worksheet is not available.");

                // Paste column headers (first row)
                for (var j = 0; j < dataTable.Columns.Count; j++)
                    ws.Cells[startRow, startCol + j] = dataTable.Columns[j].ColumnName;

                // Paste data rows
                long rowNo = 0;
                foreach (DataRow row in dataTable.Rows)
                {
                    for (var j = 0; j < dataTable.Columns.Count; j++)
                        ws.Cells[startRow + rowNo + 1, startCol + j] = row[j]?.ToString();

                    rowNo += 1;
                }

                status = $"Successfully pasted data starting at Row {startRow}, Column {startCol}.";
            }
            catch (Exception ex)
            {
                status = $"Error pasting data to Excel: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}