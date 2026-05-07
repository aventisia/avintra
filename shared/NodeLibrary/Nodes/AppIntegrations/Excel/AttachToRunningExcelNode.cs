using Excel = Microsoft.Office.Interop.Excel;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Attach to Running Excel Workbook"), Description("Attaches to a running Excel instance and opens the specified workbook if not already open.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class AttachToRunningExcelNode : BaseNode
{
    [DisplayName("Excel Application"), Description("The running Excel Application object to attach to.")]
    public required InArgument<Excel.Application> ExcelApplication { get; set; }

    [DisplayName("File Path"), Description("The full path of the Excel file to open or attach to in the running Excel instance.")]
    public required InArgument<string> FilePath { get; set; }

    [DisplayName("Workbook Instance"), Description("Returns the attached or opened workbook.")]
    public OutArgument<Excel.Workbook> WorkbookInstance { get; set; } = new OutArgument<Excel.Workbook>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";
        Excel.Workbook workbook = null;

        try
        {
            var excelApp = ExcelApplication.Get(context);
            var filePath = FilePath.Get(context);

            if (excelApp == null)
                throw new InvalidOperationException("Excel Application cannot be null.");

            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("File path cannot be empty.");

            if (!System.IO.File.Exists(filePath))
                throw new System.IO.FileNotFoundException($"Excel file not found at: {filePath}");

            bool alreadyOpen = false;
            foreach (Excel.Workbook wb in excelApp.Workbooks)
            {
                if (string.Equals(wb.FullName, filePath, StringComparison.OrdinalIgnoreCase))
                {
                    workbook = wb;
                    alreadyOpen = true;
                    break;
                }
            }

            if (!alreadyOpen)
                workbook = excelApp.Workbooks.Open(filePath);

            WorkbookInstance.Set(context, workbook);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, alreadyOpen
                ? "Attached to already open workbook successfully."
                : "Opened and attached to workbook successfully.");
        }
        catch (Exception ex)
        {
            WorkbookInstance.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error attaching to running Excel: {ex.Message}");
        }
    }
}
