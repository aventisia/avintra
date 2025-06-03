using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Delete Range from Excel Worksheet")]
    [Description("Deletes a range of cells from the active worksheet of an Excel instance.")]
    public class DeleteFromExcelWorksheetActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target worksheet.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]
        [DisplayName("Deletion Mode")]
        [Description("Specifies how to delete cells: Single Cell or Range of Cells.")]
        [DefaultValue(CellDeletionModeEnum.RangeOfCells)]
        public InArgument<CellDeletionModeEnum> DeletionMode { get; set; }


        [DisplayName("Start Column")]
        [Description("The starting column of the range to delete.")]
        [RenderIfCondition(nameof(DeletionMode), "RangeOfCells")]
        public InArgument<string> StartColumn { get; set; }


        [DisplayName("End Column")]
        [Description("The ending column of the range to delete.")]
        [RenderIfCondition(nameof(DeletionMode), "RangeOfCells")]
        public InArgument<string> EndColumn { get; set; }


        [DisplayName("Start Row")]
        [Description("The starting row of the range to delete.")]
        [RenderIfCondition(nameof(DeletionMode), "RangeOfCells")]
        public InArgument<int> StartRow { get; set; }


        [DisplayName("End Row")]
        [Description("The ending row of the range to delete.")]
        [RenderIfCondition(nameof(DeletionMode), "RangeOfCells")]
        public InArgument<int> EndRow { get; set; }


        [DisplayName("Shift Direction")]
        [Description("Specifies how to shift remaining cells after deletion.")]
        [DefaultValue(CellShiftDirectionEnum.Up)]
        public InArgument<CellShiftDirectionEnum> ShiftDirection { get; set; }

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
                var excelApp = ExcelApplication.Get(context);
                var deletionMode = DeletionMode.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                if (!(excelApp.ActiveSheet is Excel.Worksheet ws))
                    throw new InvalidOperationException("Active sheet is not a valid Excel worksheet.");

                switch (deletionMode)
                {
                    case CellDeletionModeEnum.SingleCell:
                        {
                            var colStr = StartColumn.Get(context);
                            var row = StartRow.Get(context);

                            if (!int.TryParse(colStr, out var colNum))
                                // Convert column letter (like "A", "B") to number
                                colNum = GetColumnIndex(colStr);

                            if (!(ws.Cells[row, colNum] is Excel.Range targetCell))
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

                            int startColNum, endColNum;

                            if (!int.TryParse(startColStr, out startColNum)) startColNum = GetColumnIndex(startColStr);

                            if (!int.TryParse(endColStr, out endColNum)) endColNum = GetColumnIndex(endColStr);

                            var range = ws.Range[ws.Cells[startRow, startColNum], ws.Cells[endRow, endColNum]];
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

                            status =
                                $"Deleted range from Row {startRow}, Column {startColStr} to Row {endRow}, Column {endColStr}.";
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(deletionMode));
                }
            }
            catch (Exception ex)
            {
                status = $"Error deleting cells: {ex.Message}";
            }

            StatusMessage.Set(context, status);
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