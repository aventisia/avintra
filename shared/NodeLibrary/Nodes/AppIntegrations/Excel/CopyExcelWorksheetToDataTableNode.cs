using System.Runtime.InteropServices;
using Excel = Microsoft.Office.Interop.Excel;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Copy Range from Excel Worksheet to DataTable"), Description("Copies a specified range of cells from the provided Excel worksheet into a DataTable.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class CopyExcelWorksheetToDataTableNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet object from which the data will be copied.")]
    public required InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

    [DisplayName("Range to Copy"), Description("The range of cells to copy (e.g., 'A1:B10').")]
    public required InArgument<string> RangeToCopy { get; set; }

    [DisplayName("Has Headers"), Description("Indicates whether the first row contains column headers.")]
    public InArgument<bool> HasHeaders { get; set; } = new InArgument<bool>(true);

    [DisplayName("Copied Data"), Description("Returns the copied data as a DataTable for further processing.")]
    public OutArgument<DataTable> CopiedData { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";
        DataTable dataTable = new DataTable();
        Excel.Worksheet worksheet = null;
        Excel.Range xlRange = null;

        try
        {
            worksheet = WorksheetInstance.Get(context);
            string rangeAddress = RangeToCopy.Get(context);
            bool hasHeaders = HasHeaders.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance is required and cannot be null.");

            xlRange = worksheet.Range[rangeAddress];
            if (xlRange == null || xlRange.Value == null)
                throw new ArgumentException($"Invalid or empty range: '{rangeAddress}'");

            int rowCount = xlRange.Rows.Count;
            int colCount = xlRange.Columns.Count;

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
            StatusMessage.Set(context, $"Successfully copied range '{rangeAddress}' into DataTable.");
        }
        catch (Exception ex)
        {
            CopiedData.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error copying Excel range to DataTable: {ex.Message}");
        }
        finally
        {
            ReleaseObject(xlRange);
            ReleaseObject(worksheet);
        }
    }

    private string GetCellValue(Excel.Range cell)
    {
        if (cell == null) return string.Empty;
        try { return (cell.Text ?? cell.Value2?.ToString() ?? string.Empty).ToString(); }
        catch { return string.Empty; }
    }

    private void ReleaseObject(object obj)
    {
        try { if (obj != null) Marshal.ReleaseComObject(obj); }
        catch { }
    }
}
