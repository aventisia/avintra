using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Set Active Excel Worksheet")]
    [Description("Activates a specific worksheet in the active Excel workbook by name or index.")]
    public class SetActiveExcelWorksheetActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target workbook.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Selection Type")]
        [Description("Choose whether to select the worksheet by Name or Index.")]
        [DefaultValue(WorksheetSelectionTypeEnum.Name)]
        public InArgument<WorksheetSelectionTypeEnum> SelectionType { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Search Value")]
        [Description("The worksheet name (if selection type is 'Name') or index (if selection type is 'Index').")]
        public InArgument<string> SearchValue { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")] 

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var excelApp = ExcelApplication.Get(context);
                var selectionType = SelectionType.Get(context);
                var searchValue = SearchValue.Get(context);

                if (excelApp?.ActiveWorkbook == null)
                    throw new InvalidOperationException("Excel application or workbook is not available.");

                var wb = excelApp.ActiveWorkbook;

                switch (selectionType)
                {
                    case WorksheetSelectionTypeEnum.Name:
                        {
                            if (string.IsNullOrWhiteSpace(searchValue))
                                throw new ArgumentException("Worksheet name cannot be empty when using 'Name' mode.");

                            if (!(wb.Worksheets[searchValue] is Excel.Worksheet ws))
                                throw new ArgumentException($"Worksheet '{searchValue}' not found.");

                            ws.Select();
                            break;
                        }

                    case WorksheetSelectionTypeEnum.Index:
                        {
                            if (!int.TryParse(searchValue, out var sheetIndex))
                                throw new ArgumentException("Invalid worksheet index provided.");

                            if (!(wb.Worksheets[sheetIndex] is Excel.Worksheet ws))
                                throw new ArgumentException($"Worksheet at index '{sheetIndex}' not found.");

                            ws.Select();
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(selectionType));
                }
            }
            catch (Exception ex)
            {
                status = $"Error setting active worksheet: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}