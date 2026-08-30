using NodeLibrary.ExcelNodes.Enums;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Rename Excel Worksheet"), Description("Renames a specified worksheet in the Excel workbook.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class RenameExcelWorksheetNode : BaseNode
{
    [DisplayName("Workbook Instance"), Description("The Excel Workbook containing the worksheet to rename.")]
    public required InArgument<object> WorkbookInstance { get; set; }

    [DisplayName("Selection Type"), Description("Specifies how to identify the worksheet: by Name or by Index.")]
    public required InArgument<WorksheetSelectionTypeEnum> SelectionType { get; set; } = new InArgument<WorksheetSelectionTypeEnum>(WorksheetSelectionTypeEnum.Name);

    [DisplayName("Search Value"), Description("The worksheet name (if selection type is 'Name') or 1-based index (if selection type is 'Index').")]
    public InArgument<string> SearchValue { get; set; } = new InArgument<string>();

    [DisplayName("New Worksheet Name"), Description("The new name to assign to the selected worksheet.")]
    public required InArgument<string> NewWorksheetName { get; set; }

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic? workbook = WorkbookInstance.Get(context);

            if (workbook == null)
                throw new InvalidOperationException("Workbook instance cannot be null.");

            var selectionType = SelectionType.Get(context);
            var searchValue = SearchValue.Get(context);
            var newName = NewWorksheetName.Get(context);

            if (string.IsNullOrWhiteSpace(searchValue))
                throw new ArgumentException("Search value cannot be empty.");

            if (string.IsNullOrWhiteSpace(newName))
                throw new ArgumentException("New worksheet name cannot be empty.");

            if (newName.Length > 31)
                throw new ArgumentException("Worksheet name cannot exceed 31 characters.");

            dynamic? targetSheet = null;

            switch (selectionType)
            {
                case WorksheetSelectionTypeEnum.Name:
                    {
                        foreach (var ws in workbook.Worksheets)
                        {
                            if (ws.Name.Equals(searchValue, StringComparison.OrdinalIgnoreCase))
                            {
                                targetSheet = ws;
                                break;
                            }
                        }
                        if (targetSheet == null)
                            throw new InvalidOperationException($"Worksheet '{searchValue}' not found.");
                        break;
                    }

                case WorksheetSelectionTypeEnum.Index:
                    {
                        if (!int.TryParse(searchValue, out var index))
                            throw new ArgumentException("Worksheet index must be a valid number.");
                        if (index < 1 || index > workbook.Worksheets.Count)
                            throw new ArgumentOutOfRangeException(nameof(SearchValue), $"Index must be between 1 and {workbook.Worksheets.Count}.");
                        targetSheet = workbook.Worksheets[index];
                        break;
                    }

                default:
                    throw new ArgumentOutOfRangeException(nameof(selectionType));
            }

            var oldName = targetSheet.Name;
            targetSheet.Name = newName;

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





