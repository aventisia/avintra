using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Select Cells in Excel Worksheet")]
    [Description("Selects a specific range of cells in the given Excel worksheet or workbook.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class SelectCellsInExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The Excel Worksheet object where the cell selection will be performed.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Selection Mode")]
        [Description("Specifies how to select the cells.")]
        [DefaultValue(ExcelCellSelectionModeEnum.NamedCells)]
        public InArgument<ExcelCellSelectionModeEnum> SelectionMode { get; set; }

        [DisplayName("Name")]
        [Description("The name of the named range to select (required if 'Selection Mode' is 'Named Cells').")]
        [RenderIfCondition(nameof(SelectionMode), ExcelCellSelectionModeEnum.NamedCells)]
        public InArgument<string> Name { get; set; }

        [DisplayName("Start Column")]
        [Description("The starting column of the range to select (required if 'Selection Mode' is 'Range of Cells').")]
        [RenderIfCondition(nameof(SelectionMode), ExcelCellSelectionModeEnum.RangeOfCells)]
        public InArgument<string> StartColumn { get; set; }

        [DisplayName("End Column")]
        [Description("The ending column of the range to select (required if 'Selection Mode' is 'Range of Cells').")]
        [RenderIfCondition(nameof(SelectionMode), ExcelCellSelectionModeEnum.RangeOfCells)]
        public InArgument<string> EndColumn { get; set; }

        [DisplayName("Start Row")]
        [Description("The starting row of the range to select (required if 'Selection Mode' is 'Range of Cells').")]
        [RenderIfCondition(nameof(SelectionMode), ExcelCellSelectionModeEnum.RangeOfCells)]
        public InArgument<int> StartRow { get; set; }

        [DisplayName("End Row")]
        [Description("The ending row of the range to select (required if 'Selection Mode' is 'Range of Cells').")]
        [RenderIfCondition(nameof(SelectionMode), ExcelCellSelectionModeEnum.RangeOfCells)]
        public InArgument<int> EndRow { get; set; }

        [DisplayName("X-Axis Direction")]
        [Description("Specifies the direction along the X-axis for relative selection (required if 'Selection Mode' is 'Relative to Active Cell').")]
        [DefaultValue(ExcelXAxisDirectionEnum.Right)]
        [RenderIfCondition(nameof(SelectionMode), ExcelCellSelectionModeEnum.RelativeToActiveCell)]
        public InArgument<ExcelXAxisDirectionEnum> XAxisDirection { get; set; }

        [DisplayName("Y-Axis Direction")]
        [Description("Specifies the direction along the Y-axis for relative selection (required if 'Selection Mode' is 'Relative to Active Cell').")]
        [DefaultValue(ExcelYAxisDirectionEnum.Above)]
        [RenderIfCondition(nameof(SelectionMode), ExcelCellSelectionModeEnum.RelativeToActiveCell)]
        public InArgument<ExcelYAxisDirectionEnum> YAxisDirection { get; set; }

        [DisplayName("X Offset")]
        [Description("The number of columns to offset from the active cell (required if 'Selection Mode' is 'Relative to Active Cell').")]
        [RenderIfCondition(nameof(SelectionMode), ExcelCellSelectionModeEnum.RelativeToActiveCell)]
        public InArgument<int> XOffset { get; set; }

        [DisplayName("Y Offset")]
        [Description("The number of rows to offset from the active cell (required if 'Selection Mode' is 'Relative to Active Cell').")]
        [RenderIfCondition(nameof(SelectionMode), ExcelCellSelectionModeEnum.RelativeToActiveCell)]
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
                var selectionMode = SelectionMode.Get(context);

                // Ensure we have a valid worksheet (can derive from workbook if only one sheet)
                if (worksheet == null)
                {
                    if (worksheet == null)
                    {
                        var excelApp = (Excel.Application)System.Runtime.InteropServices.Marshal.GetActiveObject("Excel.Application");
                        worksheet = excelApp?.ActiveSheet as Excel.Worksheet;
                    }
                    if (worksheet == null)
                        throw new InvalidOperationException("Unable to access worksheet from workbook.");
                }

                switch (selectionMode)
                {
                    case ExcelCellSelectionModeEnum.NamedCells:
                        {
                            var name = Name.Get(context);

                            if (string.IsNullOrWhiteSpace(name))
                                throw new ArgumentException("Name cannot be empty when using 'Named Cells' mode.");

                            var namedRange = worksheet.Names.Cast<Excel.Name>()
                                .FirstOrDefault(n => n.Name.Equals(name, StringComparison.OrdinalIgnoreCase))
                                ?.RefersToRange;

                            if (namedRange == null)
                                throw new ArgumentException($"Named range '{name}' not found.");

                            namedRange.Select();
                            break;
                        }

                    case ExcelCellSelectionModeEnum.RangeOfCells:
                        {
                            var startCol = StartColumn.Get(context);
                            var endCol = EndColumn.Get(context);
                            var startRow = StartRow.Get(context);
                            var endRow = EndRow.Get(context);

                            if (string.IsNullOrWhiteSpace(startCol) || string.IsNullOrWhiteSpace(endCol))
                                throw new ArgumentException("Start and end columns are required for 'Range of Cells' mode.");

                            var range = worksheet.Range[
                                worksheet.Cells[startRow, GetColumnIndex(startCol)],
                                worksheet.Cells[endRow, GetColumnIndex(endCol)]
                            ];

                            range.Select();
                            break;
                        }

                    case ExcelCellSelectionModeEnum.RelativeToActiveCell:
                        {
                            var xDir = XAxisDirection.Get(context);
                            var yDir = YAxisDirection.Get(context);
                            var xOffset = XOffset.Get(context);
                            var yOffset = YOffset.Get(context);

                            if (!(worksheet.Application.Selection is Excel.Range activeCell))
                                throw new InvalidOperationException("No active cell found.");

                            var activeRow = activeCell.Row;
                            var activeCol = activeCell.Column;

                            var newRow = activeRow + (yDir == ExcelYAxisDirectionEnum.Above ? -yOffset : yOffset);
                            var newCol = activeCol + (xDir == ExcelXAxisDirectionEnum.Left ? -xOffset : xOffset);

                            Excel.Range newRange = worksheet.Cells[newRow, newCol];
                            newRange.Select();
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(selectionMode));
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error selecting cells: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }

        private static int GetColumnIndex(string columnName)
        {
            if (string.IsNullOrWhiteSpace(columnName))
                throw new ArgumentException("Column name cannot be empty.", nameof(columnName));

            columnName = columnName.ToUpperInvariant();

            return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
        }
    }
}