using NodeLibrary.ExcelNodes.Enums;
using Excel = Microsoft.Office.Interop.Excel;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Add New Worksheet"), Description("Adds a new worksheet to the specified Excel workbook.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class AddNewWorksheetNode : BaseNode
{
    [DisplayName("Workbook Instance"), Description("The Excel Workbook object where the new worksheet will be added.")]
    public required InArgument<Excel.Workbook> WorkbookInstance { get; set; }

    [DisplayName("New Worksheet Name"), Description("The name of the new worksheet to be created.")]
    public InArgument<string> NewWorksheetName { get; set; } = new InArgument<string>();

    [DisplayName("Add Worksheet As"), Description("Specifies whether to add the worksheet as the first or last sheet.")]
    public required InArgument<ExcelWorksheetPositionEnum> AddWorksheetAs { get; set; }

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var workbook = WorkbookInstance.Get(context);
            var newWorksheetName = NewWorksheetName.Get(context);
            var addWorksheetAs = AddWorksheetAs.Get(context);

            if (workbook == null)
                throw new InvalidOperationException("Workbook instance is not available.");

            Excel.Worksheet newSheet = (Excel.Worksheet)workbook.Sheets.Add();

            if (!string.IsNullOrWhiteSpace(newWorksheetName))
                newSheet.Name = newWorksheetName;
            else
                newSheet.Name = $"Sheet{workbook.Sheets.Count + 1}";

            switch (addWorksheetAs)
            {
                case ExcelWorksheetPositionEnum.First:
                    newSheet.Move(Before: workbook.Sheets[1]);
                    break;

                case ExcelWorksheetPositionEnum.Last:
                    newSheet.Move(After: workbook.Sheets[workbook.Sheets.Count]);
                    break;

                default:
                    throw new ArgumentOutOfRangeException(nameof(addWorksheetAs));
            }

            status += $" Added new worksheet named '{newSheet.Name}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error adding new worksheet: {ex.Message}");
        }
    }
}
