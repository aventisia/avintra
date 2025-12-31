using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Activate Cell in Excel Worksheet")]
    [Description("Activates a specific cell in the given worksheet based on absolute position, relative offset, or named range.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class ActivateCellInExcelWorksheetActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The specific worksheet where the cell should be activated. If not provided, the active worksheet will be used.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

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

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var worksheet = WorksheetInstance.Get(context);
                var activationMode = ActivationMode.Get(context);

                if (worksheet == null)
                {
                    var excelApp = (Excel.Application)System.Runtime.InteropServices.Marshal.GetActiveObject("Excel.Application");
                    worksheet = excelApp?.ActiveSheet as Excel.Worksheet;
                }

                if (worksheet == null)
                    throw new InvalidOperationException("No active worksheet found to perform cell activation.");

                switch (activationMode)
                {
                    case ActivationModeEnum.Absolute:
                        var row = Row.Get(context);
                        var colStr = Column.Get(context);

                        if (string.IsNullOrWhiteSpace(colStr))
                            throw new ArgumentException("Column must be provided for absolute activation.");

                        if (!int.TryParse(colStr, out var colNum))
                            // Convert column letter (like "A", "B") to number
                            colNum = GetColumnIndex(colStr);

                        worksheet.Cells[row, colNum]?.Select();
                        status = $"Activated cell at Row {row}, Column {colStr}.";
                        break;

                    case ActivationModeEnum.Relative:
                        var direction = Direction.Get(context);
                        var offset = OffsetFromActiveCell.Get(context);

                        if (!(worksheet.Application.ActiveCell is Excel.Range activeCell))
                            throw new InvalidOperationException("No active cell found to move relative from.");

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

                        targetCell?.Select();
                        status = $"Activated cell {offset} cells {direction} from active cell.";
                        break;

                    case ActivationModeEnum.NamedRange:
                        var name = Name.Get(context);
                        if (string.IsNullOrWhiteSpace(name))
                            throw new ArgumentException("Named range name cannot be empty.");

                        var range = worksheet.Range[name];
                        if (range == null)
                            throw new ArgumentException($"Named range '{name}' not found.");

                        range.Select();
                        status = $"Activated named range '{name}'.";
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(activationMode), "Invalid activation mode.");
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

        // Helper method to convert column letters (A, B, C, ...) to numeric index
        private static int GetColumnIndex(string columnName)
        {
            if (string.IsNullOrEmpty(columnName))
                throw new ArgumentException("Column name cannot be null or empty.");

            columnName = columnName.ToUpperInvariant();
            int columnIndex = 0;

            foreach (char c in columnName)
            {
                if (c < 'A' || c > 'Z')
                    throw new ArgumentException($"Invalid column letter '{c}' in '{columnName}'.");
                columnIndex = columnIndex * 26 + (c - 'A' + 1);
            }

            return columnIndex;
        }
    }
}