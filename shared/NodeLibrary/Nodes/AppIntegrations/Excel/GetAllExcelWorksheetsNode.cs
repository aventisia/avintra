
namespace NodeLibrary.ExcelNodes;

[DisplayName("Get All Excel Worksheets"), Description("Gets the list of all worksheet names and their indices from the specified Excel workbook.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class GetAllExcelWorksheetsNode : BaseNode
{
    [DisplayName("Workbook Instance"), Description("The Excel Workbook from which to retrieve all worksheets.")]
    public required InArgument<object> WorkbookInstance { get; set; }

    [DisplayName("Worksheet Names"), Description("A list of all worksheet names in the workbook.")]
    public OutArgument<List<string>> WorksheetNames { get; set; } = new OutArgument<List<string>>();

    [DisplayName("Worksheet Count"), Description("The total number of worksheets in the workbook.")]
    public OutArgument<int> WorksheetCount { get; set; } = new OutArgument<int>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic workbook = WorkbookInstance.Get(context);

            if (workbook == null)
                throw new InvalidOperationException("Workbook instance cannot be null.");

            var names = new List<string>();
            foreach (var sheet in workbook.Worksheets)
                names.Add(sheet.Name);

            WorksheetNames.Set(context, names);
            WorksheetCount.Set(context, names.Count);

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Found {names.Count} worksheet(s).");
        }
        catch (Exception ex)
        {
            WorksheetNames.Set(context, new List<string>());
            WorksheetCount.Set(context, 0);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error getting worksheets: {ex.Message}");
        }
    }
}





