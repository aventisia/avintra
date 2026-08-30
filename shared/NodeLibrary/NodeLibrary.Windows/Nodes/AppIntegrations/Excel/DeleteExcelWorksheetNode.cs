using NodeLibrary.ExcelNodes.Enums;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Delete Excel Worksheet"), Description("Deletes a specific worksheet from the specified Excel Workbook.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class DeleteExcelWorksheetNode : BaseNode
{
    [DisplayName("Workbook Instance"), Description("The Excel Workbook from which the worksheet will be deleted.")]
    public required InArgument<object> WorkbookInstance { get; set; }

    [DisplayName("Delete Mode"), Description("Specifies how to identify the worksheet to delete (by Name or by Index).")]
    public required InArgument<WorksheetDeleteByModeEnum> DeleteMode { get; set; } = new InArgument<WorksheetDeleteByModeEnum>(WorksheetDeleteByModeEnum.Name);

    [DisplayName("Worksheet Name"), Description("The name of the worksheet to delete.")]
    [RenderIfCondition(nameof(DeleteMode), WorksheetDeleteByModeEnum.Name)]
    public InArgument<string> WorksheetName { get; set; } = new InArgument<string>();

    [DisplayName("Worksheet Index"), Description("The index of the worksheet to delete (1-based).")]
    [RenderIfCondition(nameof(DeleteMode), WorksheetDeleteByModeEnum.Index)]
    public InArgument<int> WorksheetIndex { get; set; } = new InArgument<int>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic? workbook = WorkbookInstance.Get(context);
            var deleteMode = DeleteMode.Get(context);

            if (workbook == null)
                throw new InvalidOperationException("Workbook instance cannot be null.");

            dynamic? targetSheet = null;

            switch (deleteMode)
            {
                case WorksheetDeleteByModeEnum.Name:
                    {
                        var name = WorksheetName.Get(context) ?? string.Empty;
                        if (string.IsNullOrWhiteSpace(name))
                            throw new ArgumentException("Worksheet name must be provided when DeleteMode is 'Name'.");
                        foreach (var ws in workbook.Worksheets)
                        {
                            if (ws.Name.Equals(name, StringComparison.OrdinalIgnoreCase))
                            {
                                targetSheet = ws;
                                break;
                            }
                        }
                        if (targetSheet == null)
                            throw new InvalidOperationException($"Worksheet '{name}' not found.");
                        break;
                    }

                case WorksheetDeleteByModeEnum.Index:
                    {
                        var index = WorksheetIndex.Get(context);
                        if (index < 1 || index > workbook.Worksheets.Count)
                            throw new ArgumentOutOfRangeException(nameof(WorksheetIndex), $"Index must be between 1 and {workbook.Worksheets.Count}.");
                        targetSheet = workbook.Worksheets[index];
                        break;
                    }

                default:
                    throw new ArgumentOutOfRangeException(nameof(deleteMode));
            }

            var sheetName = targetSheet.Name;
            workbook.Application.DisplayAlerts = false;
            targetSheet.Delete();
            workbook.Application.DisplayAlerts = true;

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully deleted worksheet '{sheetName}'.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error deleting worksheet: {ex.Message}");
        }
    }
}





