using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Clear Cells in Excel Worksheet")]
    [Description("Clears a specified range or named cell in the provided worksheet or workbook.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class ClearCellsInExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The specific worksheet instance to clear cells from. If not provided, the active worksheet will be used.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Clear Mode")]
        [Description("Specifies how to clear cells: Single Cell, Named Cells, Range of Cells, or Relative to Active Cell.")]
        [DefaultValue(CellClearModeEnum.SingleCell)]
        public InArgument<CellClearModeEnum> ClearMode { get; set; }

        [DisplayName("Column")]
        [Description("The column letter (e.g., 'A', 'B') or number (e.g., 1, 2) of the target cell.")]
        [RenderIfCondition(nameof(ClearMode), CellClearModeEnum.SingleCell)]
        public InArgument<string> Column { get; set; }

        [DisplayName("Row")]
        [Description("The row number of the target cell.")]
        [RenderIfCondition(nameof(ClearMode), CellClearModeEnum.SingleCell)]
        public InArgument<int> Row { get; set; }

        [DisplayName("Name")]
        [Description("The name of the named range or cell to clear.")]
        [RenderIfCondition(nameof(ClearMode), CellClearModeEnum.NamedCells)]
        public InArgument<string> Name { get; set; }

        [DisplayName("Start Column")]
        [Description("The starting column of the range to clear.")]
        [RenderIfCondition(nameof(ClearMode), CellClearModeEnum.RangeOfCells)]
        public InArgument<string> StartColumn { get; set; }

        [DisplayName("End Column")]
        [Description("The ending column of the range to clear.")]
        [RenderIfCondition(nameof(ClearMode), CellClearModeEnum.RangeOfCells)]
        public InArgument<string> EndColumn { get; set; }

        [DisplayName("Start Row")]
        [Description("The starting row of the range to clear.")]
        [RenderIfCondition(nameof(ClearMode), CellClearModeEnum.RangeOfCells)]
        public InArgument<int> StartRow { get; set; }

        [DisplayName("End Row")]
        [Description("The ending row of the range to clear.")]
        [RenderIfCondition(nameof(ClearMode), CellClearModeEnum.RangeOfCells)]
        public InArgument<int> EndRow { get; set; }

        [DisplayName("X-Axis Direction")]
        [Description("The direction to move from the currently active cell when clearing relatively.")]
        [DefaultValue(ExcelXAxisDirectionEnum.Left)]
        [RenderIfCondition(nameof(ClearMode), CellClearModeEnum.RangeRelativeToActiveCell)]
        public InArgument<ExcelXAxisDirectionEnum> XAxisDirection { get; set; }

        [DisplayName("Y-Axis Direction")]
        [Description("The direction to move from the currently active cell when clearing relatively.")]
        [DefaultValue(ExcelYAxisDirectionEnum.Above)]
        [RenderIfCondition(nameof(ClearMode), CellClearModeEnum.RangeRelativeToActiveCell)]
        public InArgument<ExcelYAxisDirectionEnum> YAxisDirection { get; set; }

        [DisplayName("X Offset")]
        [Description("Number of cells to move horizontally from the active cell when clearing relatively.")]
        [RenderIfCondition(nameof(ClearMode), CellClearModeEnum.RangeRelativeToActiveCell)]
        public InArgument<int> XOffset { get; set; }

        [DisplayName("Y Offset")]
        [Description("Number of cells to move vertically from the active cell when clearing relatively.")]
        [RenderIfCondition(nameof(ClearMode), CellClearModeEnum.RangeRelativeToActiveCell)]
        public InArgument<int> YOffset { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {             
                var worksheet = WorksheetInstance.Get(context);
                var clearMode = ClearMode.Get(context);

              
                if (worksheet == null)
                {
                    var excelApp = (Excel.Application)System.Runtime.InteropServices.Marshal.GetActiveObject("Excel.Application");
                    worksheet = excelApp?.ActiveSheet as Excel.Worksheet;
                }

                if (worksheet == null)
                    throw new InvalidOperationException("Worksheet instance is not available.");

                switch (clearMode)
                {
                    case CellClearModeEnum.SingleCell:
                        {
                            var colStr = Column.Get(context);
                            var row = Row.Get(context);

                            if (!int.TryParse(colStr, out var colNum))
                                colNum = GetColumnIndex(colStr);

                            var targetCell = worksheet.Cells[row, colNum] as Excel.Range;
                            if (targetCell == null)
                                throw new InvalidOperationException($"Cell at Row {row}, Column {colStr} does not exist.");

                            targetCell.Clear();
                            status = $"Cleared cell at Row {row}, Column {colStr}.";
                            break;
                        }

                    case CellClearModeEnum.NamedCells:
                        {
                            var name = Name.Get(context);
                            Excel.Range namedRange = null;
                            try
                            {
                                namedRange = worksheet.Names.Item(name)?.RefersToRange;
                            }
                            catch { }

                            if (namedRange != null)
                            {
                                namedRange.Clear();
                                status = $"Cleared named range '{name}'.";
                            }
                            else
                            {
                                status = $"Named range '{name}' not found.";
                            }

                            break;
                        }

                    case CellClearModeEnum.RangeOfCells:
                        {
                            var startColStr = StartColumn.Get(context);
                            var endColStr = EndColumn.Get(context);
                            var startRow = StartRow.Get(context);
                            var endRow = EndRow.Get(context);

                            int startColNum = int.TryParse(startColStr, out var tempStart) ? tempStart : GetColumnIndex(startColStr);
                            int endColNum = int.TryParse(endColStr, out var tempEnd) ? tempEnd : GetColumnIndex(endColStr);

                            var range = worksheet.Range[worksheet.Cells[startRow, startColNum], worksheet.Cells[endRow, endColNum]];
                            range.Clear();
                            status = string.Format("Cleared range from Row {0}, Column {1} to Row {2}, Column {3}.",
                                startRow, startColStr, endRow, endColStr);
                            break;
                        }

                    case CellClearModeEnum.RangeRelativeToActiveCell:
                        {
                            var xDir = XAxisDirection.Get(context);
                            var yDir = YAxisDirection.Get(context);
                            var xOffset = XOffset.Get(context);
                            var yOffset = YOffset.Get(context);

                            var activeCell = worksheet.Application.ActiveCell as Excel.Range;
                            if (activeCell == null)
                                throw new InvalidOperationException("No active cell found in the worksheet.");

                            Excel.Range targetRange = null;

                            switch (xDir)
                            {
                                case ExcelXAxisDirectionEnum.Left:
                                    targetRange = activeCell.Offset[yOffset, -xOffset];
                                    break;
                                case ExcelXAxisDirectionEnum.Right:
                                    targetRange = activeCell.Offset[yOffset, xOffset];
                                    break;
                                default:
                                    throw new ArgumentOutOfRangeException("xDir");
                            }

                            if (targetRange != null)
                            {
                                targetRange.Clear();
                                status = string.Format("Cleared cell relative to active cell ({0}, {1}).", xDir, yDir);
                            }
                            else
                            {
                                status = "Failed to clear relative cell.";
                            }

                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException("clearMode");
                }
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = "Error clearing cells: " + ex.Message;
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }

        // Helper method to convert column letters to numbers
        private int GetColumnIndex(string columnName)
        {
            if (string.IsNullOrEmpty(columnName)) return -1;

            columnName = columnName.ToUpperInvariant();

            return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
        }
    }
}