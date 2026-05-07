using Excel = Microsoft.Office.Interop.Excel;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Run Excel Macro"), Description("Runs a specified VBA macro in the provided Excel workbook.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class RunExcelMacroNode : BaseNode
{
    [DisplayName("Workbook Instance"), Description("The Excel Workbook containing the macro to run.")]
    public required InArgument<Excel.Workbook> WorkbookInstance { get; set; }

    [DisplayName("Macro Name"), Description("The name of the macro to run (e.g., 'Module1.MyMacro').")]
    public required InArgument<string> MacroName { get; set; }

    [DisplayName("Argument 1"), Description("Optional first argument to pass to the macro.")]
    public InArgument<object> Argument1 { get; set; } = new InArgument<object>();

    [DisplayName("Argument 2"), Description("Optional second argument to pass to the macro.")]
    public InArgument<object> Argument2 { get; set; } = new InArgument<object>();

    [DisplayName("Argument 3"), Description("Optional third argument to pass to the macro.")]
    public InArgument<object> Argument3 { get; set; } = new InArgument<object>();

    [DisplayName("Macro Result"), Description("The result returned by the macro, if any.")]
    public OutArgument<object> MacroResult { get; set; } = new OutArgument<object>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var workbook = WorkbookInstance.Get(context);
            var macroName = MacroName.Get(context);
            var arg1 = Argument1.Get(context);
            var arg2 = Argument2.Get(context);
            var arg3 = Argument3.Get(context);

            if (workbook == null)
                throw new InvalidOperationException("Workbook instance cannot be null.");

            if (string.IsNullOrWhiteSpace(macroName))
                throw new ArgumentException("Macro name cannot be empty.");

            var excelApp = workbook.Application;
            object result;

            // Build the full macro name with workbook reference if not already qualified
            string fullMacroName = macroName.Contains("!") ? macroName : $"'{workbook.Name}'!{macroName}";

            if (arg3 != null)
                result = excelApp.Run(fullMacroName, arg1, arg2, arg3);
            else if (arg2 != null)
                result = excelApp.Run(fullMacroName, arg1, arg2);
            else if (arg1 != null)
                result = excelApp.Run(fullMacroName, arg1);
            else
                result = excelApp.Run(fullMacroName);

            MacroResult.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully executed macro '{macroName}'.");
        }
        catch (Exception ex)
        {
            MacroResult.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error running macro: {ex.Message}");
        }
    }
}
