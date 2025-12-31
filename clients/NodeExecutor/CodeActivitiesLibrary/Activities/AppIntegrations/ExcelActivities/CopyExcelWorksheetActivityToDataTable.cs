using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data;
using System.Runtime.InteropServices;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Copy Range from Excel Worksheet to DataTable")]
    [Description("Copies a specified range of cells from the provided Excel worksheet into a DataTable.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class CopyExcelWorksheetActivityToDataTable : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The Excel Worksheet object from which the data will be copied.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Range to Copy")]
        [Description("The range of cells to copy (e.g., 'A1:B10').")]
        public InArgument<string> RangeToCopy { get; set; }

        [DisplayName("Has Headers")]
        [Description("Indicates whether the first row contains column headers.")]
        public InArgument<bool> HasHeaders { get; set; } = new InArgument<bool>(true);

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
            DataTable dataTable = new DataTable();
            Excel.Worksheet worksheet = null;
            Excel.Range xlRange = null;
            string status = string.Empty;

            try
            {
                // Get input arguments
                worksheet = WorksheetInstance.Get(context);
                string rangeAddress = RangeToCopy.Get(context);
                bool hasHeaders = HasHeaders.Get(context);

                if (worksheet == null)
                    throw new InvalidOperationException("Worksheet instance is required and cannot be null.");

                // Get the target range
                xlRange = worksheet.Range[rangeAddress];
                if (xlRange == null || xlRange.Value == null)
                    throw new ArgumentException($"Invalid or empty range: '{rangeAddress}'");

                int rowCount = xlRange.Rows.Count;
                int colCount = xlRange.Columns.Count;

                // Optional: Read headers from first row
                if (hasHeaders)
                {
                    for (int j = 1; j <= colCount; j++)
                    {
                        Excel.Range headerCell = xlRange.Cells[1, j] as Excel.Range;
                        string value = GetCellValue(headerCell).Trim();
                        string columnName = string.IsNullOrEmpty(value) ? $"Column{j}" : value;
                        dataTable.Columns.Add(columnName);
                        ReleaseObject(headerCell);
                    }
                }
                else
                {
                    for (int j = 1; j <= colCount; j++)
                        dataTable.Columns.Add($"Column{j}");
                }

                // Read data rows
                int startRow = hasHeaders ? 2 : 1;
                for (int i = startRow; i <= rowCount; i++)
                {
                    DataRow row = dataTable.NewRow();
                    for (int j = 1; j <= colCount; j++)
                    {
                        Excel.Range cell = xlRange.Cells[i, j] as Excel.Range;
                        row[j - 1] = GetCellValue(cell);
                        ReleaseObject(cell);
                    }
                    dataTable.Rows.Add(row);
                }

                CopiedData.Set(context, dataTable);
                IsSuccess.Set(context, true);
                status = $"Successfully copied range '{rangeAddress}' into DataTable.";
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                CopiedData.Set(context, null);
                IsSuccess.Set(context, false);
                status = $"Error copying Excel range to DataTable: {ex.Message}";
                StatusMessage.Set(context, status);
            }
            finally
            {
                // Clean up COM objects
                ReleaseObject(xlRange);
                ReleaseObject(worksheet);
            }
        }

        // Helper to safely get cell value
        private string GetCellValue(Excel.Range cell)
        {
            if (cell == null) return string.Empty;
            try
            {
                return (cell.Text ?? cell.Value2?.ToString() ?? string.Empty).ToString();
            }
            catch
            {
                return string.Empty;
            }
        }

        // Helper to release COM objects safely
        private void ReleaseObject(object obj)
        {
            try
            {
                if (obj != null)
                {
                    Marshal.ReleaseComObject(obj);
                    obj = null;
                }
            }
            catch
            {
                obj = null;
            }
        }
    }
}