using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Run Excel Macro")]
    [Description("Runs a specified VBA macro in the active Excel workbook.")]
    public class RunExcelMacroActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]

        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target workbook.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]

        [DisplayName("Macro Name")]
        [Description("The name of the VBA macro to execute.")]
        public InArgument<string> MacroName { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Macro Return Value")]
        [Description("Returns the value returned by the macro, if any.")]
        public OutArgument<string> MacroReturnValue { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var returnValue = "";
            var status = "Success";

            try
            {
                var excelApp = ExcelApplication.Get(context);
                var macroName = MacroName.Get(context);

                if (excelApp?.ActiveWorkbook == null)
                    throw new InvalidOperationException("Excel application or workbook is not available.");

                if (!(excelApp.ActiveSheet is Excel.Worksheet ws))
                    throw new InvalidOperationException("Active sheet is not a valid Excel worksheet.");

                // Call the macro
                var result = excelApp.Run(macroName);

                // Capture return value (if any)
                returnValue = result?.ToString() ?? "None";
            }
            catch (Exception ex)
            {
                status = $"Error running macro: {ex.Message}";
                returnValue = "None";
            }

            MacroReturnValue.Set(context, returnValue);
            StatusMessage.Set(context, status);
        }
    }
}