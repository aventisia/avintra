using Excel = Microsoft.Office.Interop.Excel;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Rename Excel Worksheet"), Description("Renames a specified worksheet in the Excel workbook.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class RenameExcelWorksheetNode : BaseNode
{
    [DisplayName("Worksheet Instance"), Description("The Excel Worksheet to rename.")]
    public required InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

    [DisplayName("New Name"), Description("The new name for the worksheet.")]
    public required InArgument<string> NewName { get; set; }

    protected override void Execute(INodeContext context)
    {
        try
        {
            var worksheet = WorksheetInstance.Get(context);
            var newName = NewName.Get(context);

            if (worksheet == null)
                throw new InvalidOperationException("Worksheet instance cannot be null.");

            if (string.IsNullOrWhiteSpace(newName))
                throw new ArgumentException("New worksheet name cannot be empty.");

            if (newName.Length > 31)
                throw new ArgumentException("Worksheet name cannot exceed 31 characters.");

            var oldName = worksheet.Name;
            worksheet.Name = newName;

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully renamed worksheet from '{oldName}' to '{newName}'.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error renaming worksheet: {ex.Message}");
        }
    }
}
