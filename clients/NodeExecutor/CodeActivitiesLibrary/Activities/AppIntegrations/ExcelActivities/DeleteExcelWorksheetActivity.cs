using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Delete Excel Worksheet")]
    [Description("Deletes a specific worksheet from its parent Excel workbook.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class DeleteExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [DisplayName("Worksheet Instance")]
        [Description("The Excel Worksheet object to delete (optional if using Deletion Mode).")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

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
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            string status;
            Excel.Worksheet ws = null;
            Excel.Workbook workbook = null;

            try
            {
                var worksheet = WorksheetInstance.Get(context);
                var deletionMode = DeletionMode.Get(context);

                ws = worksheet; // Use provided instance if available

                if (ws != null)
                {
                    workbook = ws.Parent as Excel.Workbook;
                }
                else
                {
                    throw new InvalidOperationException("Worksheet instance is required when WorkbookInstance is not provided. You cannot use DeletionMode without an existing worksheet reference.");
                }

                if (workbook == null)
                    throw new InvalidOperationException("Unable to access parent workbook from the worksheet instance.");

                // Disable alerts to prevent confirmation dialogs
                workbook.Application.DisplayAlerts = false;

                // Delete based on mode
                switch (deletionMode)
                {
                    case WorksheetDeleteByModeEnum.Name:
                        {
                            var worksheetName = WorksheetName.Get(context);

                            if (string.IsNullOrWhiteSpace(worksheetName))
                                throw new ArgumentException("Worksheet Name cannot be empty when using 'Name' mode.");

                            Excel.Worksheet wsByName = workbook.Worksheets[worksheetName] as Excel.Worksheet;
                            if (wsByName == null)
                                throw new InvalidOperationException($"Worksheet '{worksheetName}' not found.");

                            wsByName.Delete();
                            status = $"Successfully deleted worksheet '{worksheetName}'.";
                            break;
                        }

                    case WorksheetDeleteByModeEnum.Index:
                        {
                            var worksheetIndex = WorksheetIndex.Get(context);

                            if (worksheetIndex < 1 || worksheetIndex > workbook.Worksheets.Count)
                                throw new ArgumentOutOfRangeException(nameof(WorksheetIndex),
                                    $"Invalid worksheet index. Must be between 1 and {workbook.Worksheets.Count}.");

                            Excel.Worksheet wsByIndex = workbook.Worksheets[worksheetIndex] as Excel.Worksheet;
                            string wsName = wsByIndex?.Name ?? $"Index {worksheetIndex}";
                            wsByIndex?.Delete();
                            status = $"Successfully deleted worksheet '{wsName}'.";
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(deletionMode), "Invalid worksheet deletion mode.");
                }
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                string errorMsg = $"Error deleting worksheet: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, errorMsg);
            }
            finally
            {
                // Re-enable alerts if workbook and application exist
                if (workbook?.Application != null)
                    workbook.Application.DisplayAlerts = true;
            }
        }
    }
}