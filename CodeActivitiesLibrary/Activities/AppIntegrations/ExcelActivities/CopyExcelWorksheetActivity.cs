using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Copy Excel Worksheet")]
    [Description("Copies a worksheet from one Excel instance to another.")]
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
                var sourceWorkbook = SourceExcelApplication.Get(context);
                var copyMode = CopyMode.Get(context);
                var targetWorkbook = TargetExcelApplication.Get(context);
                var pastePosition = PastePosition.Get(context);

                if (sourceWorkbook == null)
                    throw new ArgumentNullException(nameof(SourceExcelApplication), "Source workbook cannot be null.");

                if (targetWorkbook == null)
                    throw new ArgumentNullException(nameof(TargetExcelApplication), "Target workbook cannot be null.");

                Excel.Worksheet sourceSheet = null;

                switch (copyMode)
                {
                    case WorksheetCopyModeEnum.Name:
                        var worksheetName = WorksheetName.Get(context);
                        if (string.IsNullOrWhiteSpace(worksheetName))
                            throw new ArgumentException("Worksheet Name cannot be empty when using 'Name' mode.");
                        sourceSheet = sourceWorkbook.Worksheets[worksheetName] as Excel.Worksheet;
                        break;

                    case WorksheetCopyModeEnum.Index:
                        var worksheetIndex = WorksheetIndex.Get(context);
                        if (worksheetIndex < 1 || worksheetIndex > sourceWorkbook.Worksheets.Count)
                            throw new ArgumentOutOfRangeException(nameof(WorksheetIndex),
                                $"Invalid worksheet index. Must be between 1 and {sourceWorkbook.Worksheets.Count}.");
                        sourceSheet = sourceWorkbook.Worksheets[worksheetIndex] as Excel.Worksheet;
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(copyMode));
                }

                if (sourceSheet == null)
                    throw new InvalidOperationException("Source worksheet not found.");

                //  Copy the worksheet to the target workbook
                sourceSheet.Copy(
                    Before: pastePosition == WorksheetPastePositionEnum.FirstWorksheet
                        ? targetWorkbook.Worksheets[1] as object
                        : Type.Missing,
                    After: pastePosition == WorksheetPastePositionEnum.LastWorksheet
                        ? targetWorkbook.Worksheets[targetWorkbook.Worksheets.Count] as object
                        : Type.Missing
                );

                status = $"Successfully copied worksheet '{sourceSheet.Name}' to target workbook.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error copying worksheet: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }

            StatusMessage.Set(context, status);
        }
    }
}