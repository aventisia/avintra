using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Copy Excel Worksheet")]
    [Description("Copies a worksheet from one Excel instance to another or within the same instance.")]
    public class CopyExcelWorksheetActivity : Extensions.BaseCodeActivity
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
        [RenderIfCondition(nameof(CopyMode), "Name")]
        public InArgument<string> WorksheetName { get; set; }


        [DisplayName("Worksheet Index")]
        [Description("The index of the worksheet to copy (required if 'Copy Mode' is 'Index').")]
        [RenderIfCondition(nameof(CopyMode), "Index")]
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
                var sourceApp = SourceExcelApplication.Get(context);
                var copyMode = CopyMode.Get(context);
                var targetApp = TargetExcelApplication.Get(context);
                var pastePosition = PastePosition.Get(context);

                if (sourceApp?.ActiveWorkbook == null || targetApp?.ActiveWorkbook == null)
                    throw new InvalidOperationException(
                        "Source or target Excel application or workbook is not available.");

                Excel.Worksheet sourceSheet = null;

                switch (copyMode)
                {
                    case WorksheetCopyModeEnum.Name:
                        {
                            var worksheetName = WorksheetName.Get(context);

                            if (string.IsNullOrWhiteSpace(worksheetName))
                                throw new ArgumentException("Worksheet Name cannot be empty when using 'Name' mode.");

                            sourceSheet = sourceApp.ActiveWorkbook.Worksheets[worksheetName] as Excel.Worksheet;
                            break;
                        }

                    case WorksheetCopyModeEnum.Index:
                        {
                            var worksheetIndex = WorksheetIndex.Get(context);

                            if (worksheetIndex < 1 || worksheetIndex > sourceApp.ActiveWorkbook.Worksheets.Count)
                                throw new ArgumentOutOfRangeException(nameof(WorksheetIndex),
                                    $"Invalid worksheet index. Must be between 1 and {sourceApp.ActiveWorkbook.Worksheets.Count}.");

                            sourceSheet = sourceApp.ActiveWorkbook.Worksheets[worksheetIndex] as Excel.Worksheet;
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(copyMode));
                }

                if (sourceSheet == null)
                    throw new InvalidOperationException("Source worksheet not found.");

                var insertPosition = 0;

                switch (pastePosition)
                {
                    case WorksheetPastePositionEnum.FirstWorksheet:
                        insertPosition = 1;
                        break;

                    case WorksheetPastePositionEnum.LastWorksheet:
                        insertPosition = targetApp.ActiveWorkbook.Worksheets.Count + 1;
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(pastePosition));
                }

                // Copy the worksheet
                sourceSheet.Copy(Type.Missing, targetApp.ActiveWorkbook.Worksheets[insertPosition]);

                status = $"Successfully copied worksheet '{sourceSheet.Name}'.";
            }
            catch (Exception ex)
            {
                status = $"Error copying worksheet: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}