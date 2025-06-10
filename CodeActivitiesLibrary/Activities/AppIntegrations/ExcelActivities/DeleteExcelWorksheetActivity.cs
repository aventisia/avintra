using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Delete Excel Worksheet")]
    [Description("Deletes a specific worksheet from the active Excel workbook.")]
    public class DeleteExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target worksheet.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]
        [DisplayName("Deletion Mode")]
        [Description("Specifies how to identify the worksheet to delete: by Name or Index.")]
        [DefaultValue(WorksheetDeleteByModeEnum.Name)]
        public InArgument<WorksheetDeleteByModeEnum> DeletionMode { get; set; }


        [DisplayName("Worksheet Name")]
        [Description("The name of the worksheet to delete (required if 'Deletion Mode' is 'Name').")]
        [RenderIfCondition(nameof(DeletionMode), WorksheetDeleteByModeEnum.Name)]
        public InArgument<string> WorksheetName { get; set; }


        [DisplayName("Worksheet Index")]
        [Description("The index of the worksheet to delete (required if 'Deletion Mode' is 'Index').")]
        [RenderIfCondition(nameof(DeletionMode), WorksheetDeleteByModeEnum.Index)]
        public InArgument<int> WorksheetIndex { get; set; }

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
                var deletionMode = DeletionMode.Get(context);

                if (excelApp?.ActiveWorkbook == null)
                    throw new InvalidOperationException("Excel application or workbook is not available.");

                Excel.Worksheet ws = null;

                switch (deletionMode)
                {
                    case WorksheetDeleteByModeEnum.Name:
                        {
                            var worksheetName = WorksheetName.Get(context);

                            if (string.IsNullOrWhiteSpace(worksheetName))
                                throw new ArgumentException("Worksheet Name cannot be empty when using 'Name' mode.");

                            ws = excelApp.ActiveWorkbook.Worksheets[worksheetName] as Excel.Worksheet;
                            break;
                        }

                    case WorksheetDeleteByModeEnum.Index:
                        {
                            var worksheetIndex = WorksheetIndex.Get(context);

                            if (worksheetIndex < 1 || worksheetIndex > excelApp.ActiveWorkbook.Worksheets.Count)
                                throw new ArgumentOutOfRangeException(nameof(WorksheetIndex),
                                    $"Invalid worksheet index. Must be between 1 and {excelApp.ActiveWorkbook.Worksheets.Count}.");

                            ws = excelApp.ActiveWorkbook.Worksheets[worksheetIndex] as Excel.Worksheet;
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(deletionMode));
                }

                if (ws == null)
                    throw new InvalidOperationException($"Worksheet not found.");

                // Disable alerts to prevent confirmation dialogs
                excelApp.DisplayAlerts = false;

                // Delete the worksheet
                ws.Delete();

                // Re-enable alerts
                excelApp.DisplayAlerts = true;

                status = $"Successfully deleted worksheet.";
            }
            catch (Exception ex)
            {
                status = $"Error deleting worksheet: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}