using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Copy Excel Worksheet")]
    [Description("Copies a worksheet from one Excel instance to another by duplicating its content.")]
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
                var targetApp = TargetExcelApplication.Get(context);
                var copyMode = CopyMode.Get(context);
                var pastePosition = PastePosition.Get(context);

                if (sourceApp == null || sourceApp.ActiveWorkbook == null)
                    throw new ArgumentNullException(nameof(SourceExcelApplication), "Source Excel application or workbook is null.");

                if (targetApp == null || targetApp.ActiveWorkbook == null)
                    throw new ArgumentNullException(nameof(TargetExcelApplication), "Target Excel application or workbook is null.");

                Excel.Worksheet sourceSheet = null;

                switch (copyMode)
                {
                    case WorksheetCopyModeEnum.Name:
                        var worksheetName = WorksheetName.Get(context);
                        sourceSheet = sourceApp.ActiveWorkbook.Worksheets[worksheetName] as Excel.Worksheet;
                        break;

                    case WorksheetCopyModeEnum.Index:
                        var worksheetIndex = WorksheetIndex.Get(context);
                        sourceSheet = sourceApp.ActiveWorkbook.Worksheets[worksheetIndex] as Excel.Worksheet;
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(copyMode));
                }

                if (sourceSheet == null)
                    throw new InvalidOperationException("Source worksheet not found.");

                // Create new worksheet in target workbook
                Excel.Workbook targetWb = targetApp.ActiveWorkbook;
                Excel.Worksheet targetSheet = targetWb.Worksheets.Add();

                // Set worksheet name (ensure uniqueness)
                string newName = sourceSheet.Name;
                int counter = 1;
                while (SheetExists(targetWb, newName))
                {
                    newName = $"{sourceSheet.Name} ({counter++})";
                }
                targetSheet.Name = newName;

                // Copy all used range values
                Excel.Range sourceRange = sourceSheet.UsedRange;
                Excel.Range targetRange = targetSheet.Range["A1"].Resize[sourceRange.Rows.Count, sourceRange.Columns.Count];
                targetRange.Value2 = sourceRange.Value2;

                // Optional: Copy column widths
                for (int i = 1; i <= sourceRange.Columns.Count; i++)
                {
                    targetSheet.Columns[i].ColumnWidth = sourceSheet.Columns[i].ColumnWidth;
                }

                // Optional: Copy row heights
                for (int i = 1; i <= sourceRange.Rows.Count; i++)
                {
                    targetSheet.Rows[i].RowHeight = sourceSheet.Rows[i].RowHeight;
                }

                // Optional: Copy formatting
                sourceRange.Copy();
                targetRange.PasteSpecial(Excel.XlPasteType.xlPasteFormats);

                // Optional: Delete empty default sheet
                Excel.Worksheet firstSheet = targetWb.Worksheets[1];
                if (firstSheet.Name != targetSheet.Name)
                {
                    ((Excel._Worksheet)firstSheet).Delete();
                }

                // Move worksheet to desired position
                if (pastePosition == WorksheetPastePositionEnum.FirstWorksheet)
                {
                    targetSheet.Move(Before: targetWb.Worksheets[1]);
                }
                else if (pastePosition == WorksheetPastePositionEnum.LastWorksheet)
                {
                    targetSheet.Move(After: targetWb.Worksheets[targetWb.Worksheets.Count]);
                }

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

        // Helper method to check if a worksheet exists
        private bool SheetExists(Excel.Workbook workbook, string sheetName)
        {
            foreach (Excel.Worksheet sheet in workbook.Worksheets)
            {
                if (sheet.Name == sheetName)
                {
                    return true;
                }
            }
            return false;
        }
    }
}