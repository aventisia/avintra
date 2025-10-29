using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Paste Range Cells to Excel Worksheet")]
    [Description("Pastes a range of cells from a source worksheet to a specified range or named area in a target worksheet.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class PasteCellsToExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Source Worksheet Instance")]
        [Description("The source Excel worksheet containing the range to copy.")]
        public InArgument<Excel.Worksheet> SourceWorksheet { get; set; }

        [RequiredArgument]
        [DisplayName("Target Worksheet Instance")]
        [Description("The target Excel worksheet where the data will be pasted.")]
        public InArgument<Excel.Worksheet> TargetWorksheet { get; set; }

        [RequiredArgument]
        [DisplayName("Source Range Address")]
        [Description("The range address (e.g., 'A1:B10') in the source worksheet to copy.")]
        public InArgument<string> SourceRangeAddress { get; set; }

        [RequiredArgument]
        [DisplayName("Paste Mode")]
        [Description("Specifies how to determine the paste location.")]
        [DefaultValue(CellPasteModeEnum.OnSpecifiedCell)]
        public InArgument<CellPasteModeEnum> PasteMode { get; set; }

        [DisplayName("Name")]
        [Description("The name of the named range to paste into (required if 'Paste Mode' is 'On Named Cells').")]
        [RenderIfCondition(nameof(PasteMode), CellPasteModeEnum.OnNamedCells)]
        public InArgument<string> Name { get; set; }

        [DisplayName("Column")]
        [Description("The column letter (e.g., 'A', 'B') where the paste should begin (required if 'Paste Mode' is 'On Specified Cell').")]
        [RenderIfCondition(nameof(PasteMode), CellPasteModeEnum.OnSpecifiedCell)]
        public InArgument<string> Column { get; set; }

        [DisplayName("Row")]
        [Description("The row number where the paste should begin (required if 'Paste Mode' is 'On Specified Cell').")]
        [RenderIfCondition(nameof(PasteMode), CellPasteModeEnum.OnSpecifiedCell)]
        public InArgument<int> Row { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            string status;

            try
            {
                var sourceWs = SourceWorksheet.Get(context);
                var targetWs = TargetWorksheet.Get(context);
                var sourceRangeAddress = SourceRangeAddress.Get(context);
                var pasteMode = PasteMode.Get(context);

                if (sourceWs == null)
                    throw new ArgumentNullException(nameof(SourceWorksheet), "Source worksheet cannot be null.");

                if (targetWs == null)
                    throw new ArgumentNullException(nameof(TargetWorksheet), "Target worksheet cannot be null.");

                if (string.IsNullOrWhiteSpace(sourceRangeAddress))
                    throw new ArgumentException("Source range address cannot be empty.");

                Excel.Range sourceRange = sourceWs.Range[sourceRangeAddress];
                if (sourceRange == null || IsRangeEmpty(sourceRange))
                    throw new InvalidOperationException($"Source range '{sourceRangeAddress}' not found or empty.");

                Excel.Range targetRange;

                switch (pasteMode)
                {
                    case CellPasteModeEnum.OnNamedCells:
                        {
                            var name = Name.Get(context);
                            if (string.IsNullOrWhiteSpace(name))
                                throw new ArgumentException("Name cannot be empty when using 'On Named Cells' mode.");

                            Excel.Range namedRange = null;

                            // Try to find named range at workbook level first
                            var wb = targetWs.Parent as Excel.Workbook;
                            foreach (Excel.Name n in wb.Names)
                            {
                                if (n.Name.Equals(name, StringComparison.OrdinalIgnoreCase))
                                {
                                    namedRange = n.RefersToRange;
                                    break;
                                }
                            }

                            if (namedRange == null)
                                throw new InvalidOperationException($"Named range '{name}' not found in the workbook.");

                            targetRange = namedRange;
                            break;
                        }

                    case CellPasteModeEnum.OnCurrentlyActiveCell:
                        {
                            var app = targetWs.Application;
                            var activeCell = app?.ActiveCell as Excel.Range;
                            if (activeCell == null)
                                throw new InvalidOperationException("No active cell found in target worksheet.");
                            targetRange = activeCell;
                            break;
                        }

                    case CellPasteModeEnum.OnSpecifiedCell:
                        {
                            var colLetter = Column.Get(context);
                            var rowIndex = Row.Get(context);
                            if (string.IsNullOrWhiteSpace(colLetter) || rowIndex <= 0)
                                throw new ArgumentException("Both Column and Row must be specified when PasteMode is 'On Specified Cell'.");

                            int colIndex = GetColumnIndex(colLetter);
                            targetRange = targetWs.Cells[rowIndex, colIndex];
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(pasteMode));
                }

                // Copy and paste values + formatting
                sourceRange.Copy();
                targetRange.PasteSpecial(Excel.XlPasteType.xlPasteAll);

                status = $"Successfully pasted range '{sourceRangeAddress}' into worksheet '{targetWs.Name}'.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error pasting cells: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }

        // Helper method to convert column letter to index
        private static int GetColumnIndex(string columnName)
        {
            if (string.IsNullOrWhiteSpace(columnName))
                throw new ArgumentException("Column name cannot be empty.", nameof(columnName));

            columnName = columnName.ToUpperInvariant();
            
            return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
        }

        // Helper method to check if a range is empty
        private static bool IsRangeEmpty(Excel.Range range)
        {
            if (range == null) return true;

            var value = range.Value2;

            if (value == null)
                return true;

            if (value is string str)
                return string.IsNullOrWhiteSpace(str);

            if (value is object[,] array)
            {
                foreach (var item in array)
                {
                    if (item != null && !string.IsNullOrWhiteSpace(item.ToString()))
                        return false;
                }
                return true;
            }

            return false; // Assume not empty if it's a non-null single cell with non-string value
        }
    }
}