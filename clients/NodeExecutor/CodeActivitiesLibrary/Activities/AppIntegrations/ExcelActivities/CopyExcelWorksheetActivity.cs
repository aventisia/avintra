using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Copy Excel Worksheet")]
    [Description("Copies a worksheet to another workbook or within the same workbook, preserving data, formatting, and structure.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class CopyExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Source Workbook")]
        [Description("The Excel Workbook object containing the worksheet to copy.")]
        public InArgument<Excel.Workbook> SourceWorkbook { get; set; }

        [RequiredArgument]
        [DisplayName("Copy Mode")]
        [Description("Specifies how to identify the worksheet to copy (by Name or by Index).")]
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

        [DisplayName("Target Workbook")]
        [Description("The Excel Workbook where the worksheet will be copied. If not provided, the copy will be made within the same workbook.")]
        public InArgument<Excel.Workbook> TargetWorkbook { get; set; }

        [DisplayName("Paste Position")]
        [Description("Specifies where to paste the copied worksheet in the target workbook.")]
        [DefaultValue(WorksheetPastePositionEnum.LastWorksheet)]
        public InArgument<WorksheetPastePositionEnum> PastePosition { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("Copied Worksheet")]
        [Description("The new worksheet created as a result of the copy operation.")]
        public OutArgument<Excel.Worksheet> CopiedWorksheet { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            string status = string.Empty;

            try
            {
                var sourceWorkbook = SourceWorkbook.Get(context);
                var targetWorkbook = TargetWorkbook.Get(context);
                var copyMode = CopyMode.Get(context);
                var pastePosition = PastePosition.Get(context);

                if (sourceWorkbook == null)
                    throw new ArgumentNullException(nameof(SourceWorkbook), "Source workbook cannot be null.");

                // Identify the worksheet to copy
                Excel.Worksheet sourceSheet = null;

                if (copyMode == WorksheetCopyModeEnum.Name)
                {
                    var name = WorksheetName.Get(context);
                    if (string.IsNullOrWhiteSpace(name))
                        throw new ArgumentException("Worksheet name must be provided when CopyMode is 'Name'.");

                    sourceSheet = GetSheetByName(sourceWorkbook, name);
                    if (sourceSheet == null)
                        throw new InvalidOperationException($"No worksheet found with name '{name}'.");
                }
                else if (copyMode == WorksheetCopyModeEnum.Index)
                {
                    var index = WorksheetIndex.Get(context);
                    if (index <= 0 || index > sourceWorkbook.Worksheets.Count)
                        throw new ArgumentOutOfRangeException(nameof(WorksheetIndex), "Invalid worksheet index.");

                    sourceSheet = sourceWorkbook.Worksheets[index];
                }

                if (sourceSheet == null)
                    throw new InvalidOperationException("Unable to locate the source worksheet.");

                // Use same workbook if target not provided
                if (targetWorkbook == null)
                    targetWorkbook = sourceWorkbook;

                // Create new worksheet in target workbook
                Excel.Worksheet targetSheet = targetWorkbook.Worksheets.Add();

                // Ensure unique name for the copied sheet
                string newName = sourceSheet.Name;
                int counter = 1;
                while (SheetExists(targetWorkbook, newName))
                    newName = $"{sourceSheet.Name} ({counter++})";

                targetSheet.Name = newName;

                // Copy data
                Excel.Range sourceRange = sourceSheet.UsedRange;
                Excel.Range targetRange = targetSheet.Range["A1"].Resize[sourceRange.Rows.Count, sourceRange.Columns.Count];
                targetRange.Value2 = sourceRange.Value2;

                // Copy formatting
                sourceRange.Copy();
                targetRange.PasteSpecial(Excel.XlPasteType.xlPasteFormats);

                // Copy column widths
                for (int i = 1; i <= sourceRange.Columns.Count; i++)
                    targetSheet.Columns[i].ColumnWidth = sourceSheet.Columns[i].ColumnWidth;

                // Copy row heights
                for (int i = 1; i <= sourceRange.Rows.Count; i++)
                    targetSheet.Rows[i].RowHeight = sourceSheet.Rows[i].RowHeight;

                // Move worksheet to desired position
                if (pastePosition == WorksheetPastePositionEnum.FirstWorksheet)
                    targetSheet.Move(Before: targetWorkbook.Worksheets[1]);
                else if (pastePosition == WorksheetPastePositionEnum.LastWorksheet)
                    targetSheet.Move(After: targetWorkbook.Worksheets[targetWorkbook.Worksheets.Count]);

                // Output result
                CopiedWorksheet.Set(context, targetSheet);
                IsSuccess.Set(context, true);
                status = $"Successfully copied worksheet '{sourceSheet.Name}' as '{targetSheet.Name}' to target workbook.";
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error copying worksheet: {ex.Message}");
            }
        }
      // Helper method to check if a worksheet exists
        private Excel.Worksheet GetSheetByName(Excel.Workbook workbook, string sheetName)
        {
            foreach (Excel.Worksheet sheet in workbook.Worksheets)
            {
                if (sheet.Name.Equals(sheetName, StringComparison.OrdinalIgnoreCase))
                    return sheet;
            }
            return null;
        }

        private bool SheetExists(Excel.Workbook workbook, string sheetName)
        {
            foreach (Excel.Worksheet sheet in workbook.Worksheets)
            {
                if (sheet.Name.Equals(sheetName, StringComparison.OrdinalIgnoreCase))
                    return true;
            }
            return false;
        }
    }
}