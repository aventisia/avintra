using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Set Active Excel Worksheet")]
    [Description("Activates a specific worksheet in the active Excel workbook by name or index.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class SetActiveExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target workbook.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]
        [DisplayName("Selection Type")]
        [Description("Choose whether to select the worksheet by Name or Index.")]
        [DefaultValue(WorksheetSelectionTypeEnum.Name)]
        public InArgument<WorksheetSelectionTypeEnum> SelectionType { get; set; }

        [RequiredArgument]
        [DisplayName("Search Value")]
        [Description("The worksheet name (if selection type is 'Name') or index (if selection type is 'Index'). Can be string or integer depending on mode.")]
        public InArgument<object> SearchValue { get; set; }

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

                if (excelApp?.ActiveWorkbook == null)
                    throw new InvalidOperationException("Excel application or workbook is not available.");

                var wb = excelApp.ActiveWorkbook;

                switch (selectionType)
                {
                    case WorksheetSelectionTypeEnum.Name:
                        {
                            if (searchValue == null || !(searchValue is string sheetName) || string.IsNullOrWhiteSpace(sheetName))
                                throw new ArgumentException("A valid worksheet name must be provided when using 'Name' mode.");

                            if (!(wb.Worksheets[sheetName] is Excel.Worksheet ws))
                                throw new ArgumentException($"Worksheet '{sheetName}' not found.");

                            ws.Select();
                            break;
                        }

                    case WorksheetSelectionTypeEnum.Index:
                        {
                            if (searchValue == null)
                                throw new ArgumentException("Search value cannot be null in 'Index' mode.");

                            if (!(searchValue is int sheetIndex))
                            {
                                if (searchValue is string indexStr && int.TryParse(indexStr, out sheetIndex))
                                {
                                    // Try parsing from string if needed
                                }
                                else
                                {
                                    throw new ArgumentException("Invalid worksheet index provided. Must be an integer or string representation of an integer.");
                                }
                            }

                            if (!(wb.Worksheets[sheetIndex] is Excel.Worksheet ws))
                                throw new ArgumentException($"Worksheet at index '{sheetIndex}' not found.");

                            ws.Select();
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(selectionType));
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error setting active worksheet: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}