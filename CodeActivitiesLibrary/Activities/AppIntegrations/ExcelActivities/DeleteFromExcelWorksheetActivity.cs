using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Delete Range from Excel Worksheet")]
    [Description("Deletes a range of cells or a single cell from the specified Excel worksheet.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class DeleteFromExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The Excel Worksheet object to delete cells from.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Deletion Mode")]
        [Description("Specifies how to delete cells: Single Cell or Range of Cells.")]
        [DefaultValue(CellDeletionModeEnum.RangeOfCells)]
        public InArgument<CellDeletionModeEnum> DeletionMode { get; set; }

        [DisplayName("Start Column")]
        [Description("The starting column of the range to delete (letter or number).")]
        [RenderIfCondition(nameof(DeletionMode), CellDeletionModeEnum.RangeOfCells)]
        public InArgument<string> StartColumn { get; set; }

        [DisplayName("End Column")]
        [Description("The ending column of the range to delete (letter or number).")]
        [RenderIfCondition(nameof(DeletionMode), CellDeletionModeEnum.RangeOfCells)]
        public InArgument<string> EndColumn { get; set; }

        [DisplayName("Start Row")]
        [Description("The starting row of the range to delete.")]
        [RenderIfCondition(nameof(DeletionMode), CellDeletionModeEnum.RangeOfCells)]
        public InArgument<int> StartRow { get; set; }

        [DisplayName("End Row")]
        [Description("The ending row of the range to delete.")]
        [RenderIfCondition(nameof(DeletionMode), CellDeletionModeEnum.RangeOfCells)]
        public InArgument<int> EndRow { get; set; }

        [DisplayName("Shift Direction")]
        [Description("Specifies how to shift remaining cells after deletion.")]
        [DefaultValue(CellShiftDirectionEnum.Up)]
        public InArgument<CellShiftDirectionEnum> ShiftDirection { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {           
                var worksheet = WorksheetInstance.Get(context);
                var deletionMode = DeletionMode.Get(context);

                if (worksheet == null)
                    throw new InvalidOperationException("Worksheet instance cannot be null.");

                switch (deletionMode)
                {
                    case CellDeletionModeEnum.SingleCell:
                        {
                            var colStr = StartColumn.Get(context);
                            var row = StartRow.Get(context);

                            if (row <= 0)
                                throw new ArgumentOutOfRangeException(nameof(StartRow), "Row index must be greater than 0.");

                            int colNum;
                            if (!int.TryParse(colStr, out colNum))
                                colNum = GetColumnIndex(colStr);

                            var targetCell = worksheet.Cells[row, colNum] as Excel.Range;
                            if (targetCell == null)
                                throw new InvalidOperationException($"Cell at Row {row}, Column {colStr} does not exist.");

                            targetCell.Delete();
                            status = $"Deleted cell at Row {row}, Column {colStr}.";
                            break;
                        }

                    case CellDeletionModeEnum.RangeOfCells:
                        {
                            var startColStr = StartColumn.Get(context);
                            var endColStr = EndColumn.Get(context);
                            var startRow = StartRow.Get(context);
                            var endRow = EndRow.Get(context);

                            if (startRow <= 0 || endRow <= 0)
                                throw new ArgumentOutOfRangeException(nameof(StartRow), "Row indexes must be greater than 0.");

                            int startColNum = int.TryParse(startColStr, out var tmpStart) ? tmpStart : GetColumnIndex(startColStr);
                            int endColNum = int.TryParse(endColStr, out var tmpEnd) ? tmpEnd : GetColumnIndex(endColStr);

                            var range = worksheet.Range[worksheet.Cells[startRow, startColNum], worksheet.Cells[endRow, endColNum]];
                            var shiftDirection = ShiftDirection.Get(context);

                            switch (shiftDirection)
                            {
                                case CellShiftDirectionEnum.Left:
                                    range.Delete(Excel.XlDeleteShiftDirection.xlShiftToLeft);
                                    break;

                                case CellShiftDirectionEnum.Up:
                                    range.Delete(Excel.XlDeleteShiftDirection.xlShiftUp);
                                    break;

                                default:
                                    throw new ArgumentOutOfRangeException(nameof(shiftDirection));
                            }

                            status = $"Deleted range from Row {startRow}, Column {startColStr} to Row {endRow}, Column {endColStr}.";
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(deletionMode));
                }
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error deleting cells: {ex.Message}";
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