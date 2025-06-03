using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Rename Excel Worksheet")]
    [Description("Renames a specific worksheet in the active Excel workbook.")]
    public class RenameExcelWorksheetActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]

        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target worksheet.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]

        [DisplayName("Selection Type")]
        [Description("Specifies whether to select the worksheet by Name or Index.")]
        [DefaultValue(WorksheetSelectionTypeEnum.Name)]
        public InArgument<WorksheetSelectionTypeEnum> SelectionType { get; set; }

        [RequiredArgument]

        [DisplayName("Search Value")]
        [Description("The worksheet name (if selection type is 'Name') or index (if selection type is 'Index').")]
        public InArgument<string> SearchValue { get; set; }

        [RequiredArgument]

        [DisplayName("New Worksheet Name")]
        [Description("The new name to assign to the selected worksheet.")]
        public InArgument<string> NewWorksheetName { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


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
                var newWorksheetName = NewWorksheetName.Get(context);

                if (excelApp?.ActiveWorkbook == null)
                    throw new InvalidOperationException("Excel application or workbook is not available.");

                var wb = excelApp.ActiveWorkbook;

                Excel.Worksheet ws = null;

                switch (selectionType)
                {
                    case WorksheetSelectionTypeEnum.Name:
                        ws = wb.Worksheets[searchValue] as Excel.Worksheet;
                        break;

                    case WorksheetSelectionTypeEnum.Index:
                        if (!int.TryParse(searchValue, out var sheetIndex))
                            throw new ArgumentException("Invalid worksheet index provided.");

                        ws = wb.Worksheets[sheetIndex] as Excel.Worksheet;
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(selectionType));
                }

                if (ws == null)
                    throw new ArgumentException($"Worksheet '{searchValue}' not found.");

                // Validate new worksheet name
                if (string.IsNullOrWhiteSpace(newWorksheetName))
                    throw new ArgumentException("New worksheet name cannot be empty.");

                // Rename the worksheet
                ws.Name = newWorksheetName;

                status = $"Successfully renamed worksheet from '{searchValue}' to '{newWorksheetName}'.";
            }
            catch (Exception ex)
            {
                status = $"Error renaming worksheet: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}