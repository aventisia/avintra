using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Paste DataTable to Excel Worksheet")]
    [Description("Pastes a DataTable of data to the specified Excel worksheet starting at the given row and column.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class PasteDataTableToExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The Excel Worksheet object where the data will be pasted.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Data Table")]
        [Description("The DataTable containing the data to paste into the Excel worksheet.")]
        public InArgument<DataTable> DataTable { get; set; }

        [RequiredArgument]
        [DefaultValue(1)]
        [DisplayName("Start Row")]
        [Description("The row number where pasting should start.")]
        public InArgument<long> StartRow { get; set; }

        [RequiredArgument]
        [DefaultValue(1)]
        [DisplayName("Start Column")]
        [Description("The column number where pasting should start.")]
        public InArgument<long> StartColumn { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            string status = "Success";

            try
            {
                var worksheet = WorksheetInstance.Get(context);
                var dataTable = DataTable.Get(context);
                var startRow = StartRow.Get(context);
                var startCol = StartColumn.Get(context);

                if (worksheet == null)
                    throw new InvalidOperationException("Worksheet instance is required but was not provided.");

                if (dataTable == null)
                    throw new InvalidOperationException("DataTable is required but was not provided.");

                // Paste column headers (first row)
                for (var j = 0; j < dataTable.Columns.Count; j++)
                    worksheet.Cells[startRow, startCol + j] = dataTable.Columns[j].ColumnName;

                // Paste data rows
                long rowNo = 0;
                foreach (DataRow row in dataTable.Rows)
                {
                    for (var j = 0; j < dataTable.Columns.Count; j++)
                        worksheet.Cells[startRow + rowNo + 1, startCol + j] = row[j]?.ToString();

                    rowNo++;
                }

                status = $"Successfully pasted {dataTable.Rows.Count} rows starting at Row {startRow}, Column {startCol}.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error pasting data to Excel: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}