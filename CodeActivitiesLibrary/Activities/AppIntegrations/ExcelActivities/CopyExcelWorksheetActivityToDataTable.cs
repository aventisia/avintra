using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Copy Range from Excel Worksheet to DataTable")]
    [Description("Copies a specified range of cells from the active worksheet of an Excel instance into a DataTable.")]
    public class CopyExcelWorksheetActivityToDataTable : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the source worksheet.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]
        [DisplayName("Range to Copy")]
        [Description("The range of cells to copy (e.g., 'A1:B10').")]
        public InArgument<string> RangeToCopy { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Copied Data")]
        [Description("Returns the copied data as a DataTable for further processing.")]
        public OutArgument<DataTable> CopiedData { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";
            var dataTable = new DataTable();

            try
            {
                var excelApp = ExcelApplication.Get(context);
                var rangeToCopy = RangeToCopy.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                if (!(excelApp.ActiveSheet is Excel.Worksheet ws))
                    throw new InvalidOperationException("Active worksheet is not available.");
                var xlRange = ws.Range[rangeToCopy];

                var rowCount = xlRange.Rows.Count;
                var colCount = xlRange.Columns.Count;

                // Add columns dynamically
                for (var j = 1; j <= colCount; j++)
                {
                    var cellValue = (xlRange.Cells[1, j] as Excel.Range)?.Text?.ToString() ?? $"Column{j}";
                    dataTable.Columns.Add(cellValue);
                }

                // Add rows
                for (var i = 1; i <= rowCount; i++)
                {
                    var row = dataTable.NewRow();
                    for (var j = 1; j <= colCount; j++)
                        row[j - 1] = (xlRange.Cells[i, j] as Excel.Range)?.Text?.ToString() ?? "";

                    dataTable.Rows.Add(row);
                }

                status = $"Successfully copied range '{rangeToCopy}'.";
                CopiedData.Set(context, dataTable);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error copying cells: {ex.Message}";
                CopiedData.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}