using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Activate Cell in Excel Worksheet")]
    [Description(
        "Activates a specific cell in the active worksheet of an Excel instance based on absolute position, relative offset, or named range.")]
    public class ActivateCellInExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target worksheet.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]
        [DisplayName("Activation Mode")]
        [Description("Choose how to activate the cell: absolutely, relatively, or via named range.")]
        [DefaultValue(ActivationModeEnum.Absolute)]
        public InArgument<ActivationModeEnum> ActivationMode { get; set; }


        [DisplayName("Column")]
        [Description("The column letter (e.g., 'A', 'B') or number (e.g., 1, 2) of the target cell.")]
        [RenderIfCondition(nameof(ActivationMode), ActivationModeEnum.Absolute)]
        public InArgument<string> Column { get; set; }


        [DisplayName("Row")]
        [Description("The row number of the target cell.")]
        [RenderIfCondition(nameof(ActivationMode), ActivationModeEnum.Absolute)]
        public InArgument<int> Row { get; set; }


        [DisplayName("Name")]
        [Description("The name of the named range or cell to activate.")]
        [RenderIfCondition(nameof(ActivationMode), ActivationModeEnum.NamedRange)]
        public InArgument<string> Name { get; set; }


        [DisplayName("Direction")]
        [Description("The direction to move from the currently active cell when activating relatively.")]
        [DefaultValue(CellMoveDirectionEnum.Down)]
        [RenderIfCondition(nameof(ActivationMode), ActivationModeEnum.Relative)]
        public InArgument<CellMoveDirectionEnum> Direction { get; set; }


        [DisplayName("Offset From Active Cell")]
        [Description("Number of cells to move from the current active cell when activating relatively.")]
        [RenderIfCondition(nameof(ActivationMode), ActivationModeEnum.Relative)]
        public InArgument<int> OffsetFromActiveCell { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var excelApp = ExcelApplication.Get(context);
                var activationMode = ActivationMode.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                if (!(excelApp.ActiveSheet is Excel.Worksheet worksheet))
                    throw new InvalidOperationException("Worksheet is not available.");

                switch (activationMode)
                {
                    case ActivationModeEnum.Absolute:
                        var row = Row.Get(context);
                        var colStr = Column.Get(context);

                        if (!int.TryParse(colStr, out var colNum))
                           // Convert column letter (like "A", "B") to number
                            colNum = GetColumnIndex(colStr);

                        worksheet.Cells[row, colNum]?.Select(); 
                        status = $"Activated cell at Row {row}, Column {colStr}.";
                        break;

                    case ActivationModeEnum.Relative:
                        var direction = Direction.Get(context);
                        var offset = OffsetFromActiveCell.Get(context);

                        if (excelApp.ActiveCell is Excel.Range activeCell)
                        {
                            Excel.Range targetCell = null;

                            switch (direction)
                            {
                                case CellMoveDirectionEnum.Up:
                                    targetCell = activeCell.Offset[-offset, 0];
                                    break;
                                case CellMoveDirectionEnum.Down:
                                    targetCell = activeCell.Offset[offset, 0];
                                    break;
                                case CellMoveDirectionEnum.Left:
                                    targetCell = activeCell.Offset[0, -offset];
                                    break;
                                case CellMoveDirectionEnum.Right:
                                    targetCell = activeCell.Offset[0, offset];
                                    break;
                            }

                            if (targetCell != null)
                            {
                                targetCell.Select();
                                status = $"Activated cell {offset} cells {direction} from active cell.";
                            }
                            else
                            {
                                status = "Failed to calculate relative cell.";
                            }

                            // Optional: release COM objects
                            GC.KeepAlive(targetCell);
                            GC.KeepAlive(activeCell);
                        }
                        else
                        {
                            status = "No active cell found.";
                        }

                        break;

                    case ActivationModeEnum.NamedRange:
                        var name = Name.Get(context);
                        var range = worksheet.Range[name];

                        if (range != null)
                        {
                            range.Select();
                            status = $"Activated named range '{name}'.";
                        }
                        else
                        {
                            status = $"Named range '{name}' not found.";
                        }

                        break;

                    default:
                        throw new ArgumentOutOfRangeException();
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error activating cell: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
            finally
            {
                // Optional: Force garbage collection to clean up COM objects
                GC.Collect();
                GC.WaitForPendingFinalizers();
            }
        }

     // Helper method to convert column letters to numbers
        private static int GetColumnIndex(string columnName)
        {
            if (string.IsNullOrEmpty(columnName)) return -1;

            columnName = columnName.ToUpperInvariant();

            int columnIndex = 0;
            foreach (char c in columnName)
            {
                columnIndex = columnIndex * 26 + (c - 'A' + 1);
            }

            return columnIndex;
        }
    }
}