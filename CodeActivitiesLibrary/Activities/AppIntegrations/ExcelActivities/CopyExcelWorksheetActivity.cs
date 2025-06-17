using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Copy Excel Worksheet")]
    [Description("Copies a worksheet from one Excel instance to another or within the same instance.")]
    public class CopyExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Source Excel Application")]
        [Description("The Excel Application object containing the source worksheet.")]
        public InArgument<Excel.Application> SourceExcelApplication { get; set; }

        [RequiredArgument]
        [DisplayName("Copy Mode")]
        [Description("Specifies how to identify the source worksheet: by Name or Index.")]
        [DefaultValue(WorksheetCopyModeEnum.Name)]
        public InArgument<WorksheetCopyModeEnum> CopyMode { get; set; }

        [DisplayName("Worksheet Name")]
        [Description("The name of the worksheet to copy (required if 'Copy Mode' is 'Name').")]
        [RenderIfCondition(nameof(CopyMode), WorksheetCopyModeEnum.Name)]
        public InArgument<string> WorksheetName { get; set; }

        [DisplayName("Worksheet Index")]
        [Description("The index of the worksheet to copy (required if 'Copy Mode' is 'Index').")]
        [RenderIfCondition(nameof(CopyMode), WorksheetCopyModeEnum.Index)]
        public InArgument<int> WorksheetIndex { get; set; }

        [RequiredArgument]
        [DisplayName("Target Excel Application")]
        [Description("The Excel Application object where the worksheet will be copied.")]
        public InArgument<Excel.Application> TargetExcelApplication { get; set; }

        [DisplayName("Paste Position")]
        [Description("Specifies where to paste the copied worksheet in the target workbook.")]
        [DefaultValue(WorksheetPastePositionEnum.FirstWorksheet)]
        public InArgument<WorksheetPastePositionEnum> PastePosition { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var sourceApp = SourceExcelApplication.Get(context);
                var copyMode = CopyMode.Get(context);
                var targetApp = TargetExcelApplication.Get(context);
                var pastePosition = PastePosition.Get(context);

                if (sourceApp?.ActiveWorkbook == null)
                    throw new InvalidOperationException("Source Excel application or workbook is not available.");

                if (targetApp == null)
                    throw new ArgumentNullException(nameof(TargetExcelApplication),
                        "Target Excel application cannot be null.");

                if (targetApp?.ActiveWorkbook == null)
                {
                    // If target has no active workbook, create a new one
                    targetApp.Workbooks.Add(Type.Missing);
                }

                Excel.Worksheet sourceSheet = null;

                switch (copyMode)
                {
                    case WorksheetCopyModeEnum.Name:
                        var worksheetName = WorksheetName.Get(context);
                        if (string.IsNullOrWhiteSpace(worksheetName))
                            throw new ArgumentException("Worksheet Name cannot be empty when using 'Name' mode.");
                        sourceSheet = sourceApp.ActiveWorkbook.Worksheets[worksheetName] as Excel.Worksheet;
                        break;

                    case WorksheetCopyModeEnum.Index:
                        var worksheetIndex = WorksheetIndex.Get(context);
                        if (worksheetIndex < 1 || worksheetIndex > sourceApp.ActiveWorkbook.Worksheets.Count)
                            throw new ArgumentOutOfRangeException(nameof(WorksheetIndex),
                                $"Invalid worksheet index. Must be between 1 and {sourceApp.ActiveWorkbook.Worksheets.Count}.");
                        sourceSheet = sourceApp.ActiveWorkbook.Worksheets[worksheetIndex] as Excel.Worksheet;
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(copyMode));
                }

                if (sourceSheet == null)
                    throw new InvalidOperationException("Source worksheet not found.");

                // Copy the worksheet to the target Excel instance
                sourceSheet.Copy(Type.Missing, Type.Missing); // This creates a new workbook with just the copied sheet

                // Get the new workbook created after copy
                var newWorkbook = sourceApp.Application.Workbooks[sourceApp.Application.Workbooks.Count];

                // Move the sheet to the target Excel application without removing it from the source.
                Excel.Worksheet copiedSheet = newWorkbook.Sheets[1];
                copiedSheet.Move(
                    Before: pastePosition == WorksheetPastePositionEnum.FirstWorksheet
                        ? targetApp.ActiveWorkbook?.Worksheets[1]
                        : Type.Missing,
                    After: pastePosition == WorksheetPastePositionEnum.LastWorksheet
                        ? targetApp.ActiveWorkbook?.Worksheets[targetApp.ActiveWorkbook.Worksheets.Count]
                        : Type.Missing
                );

                status = $"Successfully copied worksheet '{sourceSheet.Name}' to target Excel instance.";
            }
            catch (Exception ex)
            {
                status = $"Error copying worksheet: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}