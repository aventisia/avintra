

using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Set Active Excel Worksheet")]
    [Description("Activates a specific worksheet in the provided Excel workbook by name or index and outputs the active worksheet instance.")]

    public class SetActiveExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Workbook Instance")]
        [Description("The Excel Workbook object containing the target worksheets.")]
        public InArgument<Excel.Workbook> WorkbookInstance { get; set; }

        [DisplayName("Selection Type")]
        [Description("Choose whether to select the worksheet by Name or Index.")]
        [DefaultValue(WorksheetSelectionTypeEnum.Name)]
        public InArgument<WorksheetSelectionTypeEnum> SelectionType { get; set; }

        [DisplayName("Search Value")]
        [Description("The worksheet name (if selection type is 'Name') or index (if selection type is 'Index').")]
        public InArgument<object> SearchValue { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("Worksheet Instance")]
        [Description("Returns the activated Excel Worksheet instance.")]
        public OutArgument<Excel.Worksheet> WorksheetInstance { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            string status = "Success";

            try
            {
                var workbook = WorkbookInstance.Get(context);
                var selectionType = SelectionType.Get(context);
                var searchValue = SearchValue.Get(context);

                if (workbook == null)
                    throw new InvalidOperationException("Workbook instance is not provided or is invalid.");

                Excel.Worksheet targetWorksheet = null;

                // Determine worksheet by selection type
                switch (selectionType)
                {
                    case WorksheetSelectionTypeEnum.Name:
                        if (searchValue == null || string.IsNullOrWhiteSpace(searchValue.ToString()))
                            throw new ArgumentException("A valid worksheet name must be provided when using 'Name' mode.");

                        targetWorksheet = workbook.Worksheets[searchValue.ToString()] as Excel.Worksheet;
                        if (targetWorksheet == null)
                            throw new ArgumentException($"Worksheet with name '{searchValue}' not found.");
                        break;

                    case WorksheetSelectionTypeEnum.Index:
                        if (searchValue == null)
                            throw new ArgumentException("Worksheet index cannot be null in 'Index' mode'.");

                        if (!int.TryParse(searchValue.ToString(), out int sheetIndex))
                            throw new ArgumentException("Invalid worksheet index. Must be a valid integer.");

                        targetWorksheet = workbook.Worksheets[sheetIndex] as Excel.Worksheet;
                        if (targetWorksheet == null)
                            throw new ArgumentException($"Worksheet at index '{sheetIndex}' not found.");
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(selectionType), "Invalid worksheet selection type.");
                }

                // Activate and output the worksheet
                targetWorksheet?.Activate();
                WorksheetInstance.Set(context, targetWorksheet);

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                WorksheetInstance.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error setting active worksheet: {ex.Message}");
            }
        }
    }
}