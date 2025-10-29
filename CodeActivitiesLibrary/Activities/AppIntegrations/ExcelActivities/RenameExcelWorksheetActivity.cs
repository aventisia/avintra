using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Rename Excel Worksheet")]
    [Description("Renames a specific worksheet in the given Excel instance based on name or index.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class RenameExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------
        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The Excel Worksheet object used to access the workbook containing the target sheet.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

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
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var worksheet = WorksheetInstance.Get(context);
                var selectionType = SelectionType.Get(context);
                var searchValue = SearchValue.Get(context);
                var newWorksheetName = NewWorksheetName.Get(context);

                if (worksheet == null)
                    throw new InvalidOperationException("Worksheet instance must be provided.");

                var workbook = worksheet.Parent as Excel.Workbook;
                if (workbook == null)
                    throw new InvalidOperationException("Unable to access workbook from the provided worksheet.");

                Excel.Worksheet targetSheet = null;

                // Select worksheet by name or index
                switch (selectionType)
                {
                    case WorksheetSelectionTypeEnum.Name:
                        targetSheet = workbook.Worksheets[searchValue] as Excel.Worksheet;
                        break;

                    case WorksheetSelectionTypeEnum.Index:
                        if (!int.TryParse(searchValue, out var sheetIndex))
                            throw new ArgumentException("Invalid worksheet index provided.");
                        targetSheet = workbook.Worksheets[sheetIndex] as Excel.Worksheet;
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(selectionType));
                }

                if (targetSheet == null)
                    throw new ArgumentException($"Worksheet '{searchValue}' not found.");

                 // Validate new worksheet name
                if (string.IsNullOrWhiteSpace(newWorksheetName))
                    throw new ArgumentException("New worksheet name cannot be empty.");

                // Rename the worksheet
                var oldName = targetSheet.Name;
                targetSheet.Name = newWorksheetName;

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully renamed worksheet from '{oldName}' to '{newWorksheetName}'.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error renaming worksheet: {ex.Message}");
            }
        }
    }
}