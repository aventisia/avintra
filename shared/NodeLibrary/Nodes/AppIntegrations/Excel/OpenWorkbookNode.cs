namespace NodeLibrary.ExcelNodes;

[DisplayName("Open Excel Workbook"), Description("Opens or reuses an Excel workbook in an existing Excel instance by workbook name.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class OpenWorkbookNode : BaseNode
{
    [DisplayName("Excel Instance"), Description("Existing Excel application instance.")]
    public required InArgument<object> ExcelInstance { get; set; }

    [DisplayName("Workbook Name"), Description("Workbook file name to open (example: Report.xlsx).")]
    public required InArgument<string> WorkbookName { get; set; }

    [DisplayName("Open as ReadOnly"), Description("If set to true, the workbook will be opened in read-only mode, preventing any changes from being saved.")]
    public InArgument<bool> OpenAsReadOnly { get; set; } = new InArgument<bool>();

    [DisplayName("Read Protection Password"), Description("Password required to open the workbook if it is protected with a read password.")]
    public InArgument<SecureString> ReadProtectionPassword { get; set; } = new InArgument<SecureString>();

    [DisplayName("Workbook Instance"), Description("The Excel workbook instance that is opened or reused.")]
    public OutArgument<object> WorkbookInstance { get; set; } = new OutArgument<object>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            dynamic excelApp = ExcelInstance.Get(context);
            var workbookName = WorkbookName.Get(context);
            var readOnly = OpenAsReadOnly.Get(context);
            var password = ReadProtectionPassword.Get(context);
            dynamic? workbook = null;

            if (excelApp == null)
                throw new ArgumentException("Excel instance is not provided.");

            if (string.IsNullOrWhiteSpace(workbookName))
                throw new ArgumentException("Workbook name is not provided.");

            dynamic workbooks = ((dynamic)excelApp).Workbooks;
            foreach (var wb in workbooks)
            {
                if (string.Equals(
                    System.IO.Path.GetFileName((string)wb.FullName),
                    workbookName,
                    StringComparison.OrdinalIgnoreCase))
                {
                    workbook = wb;
                    WorkbookInstance.Set(context, workbook);
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, "Workbook already open. Reused existing workbook.");
                    return;
                }
            }

            workbook = workbooks.Open(
                workbookName,
                ReadOnly: readOnly,
                Password: password
            );

            WorkbookInstance.Set(context, workbook);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Workbook '{workbookName}' opened successfully.");
        }
        catch (Exception ex)
        {
            WorkbookInstance.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error opening workbook: {ex.Message}");
        }
    }
}




