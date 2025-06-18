using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Copy Cells from Excel Worksheet")]
    [Description(
        "Copies a specified range of cells from an Excel worksheet for later use or pasting into another worksheet.")]
    public class CopyCellsFromExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the source worksheet.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]
        [DisplayName("Copy Mode")]
        [Description("Specifies how to copy cells: Single Cell, Named Cells, Selection, or Range of Cells.")]
        [DefaultValue(CellCopyModeEnum.SingleCell)]
        public InArgument<CellCopyModeEnum> CopyMode { get; set; }


        [DisplayName("Source Worksheet Name")]
        [Description("Name of the worksheet in the source Excel application.")]
        public InArgument<string> SourceWorksheetName { get; set; }


        [DisplayName("Source Range Address")]
        [Description("The range address (e.g., 'A1:B10') in the source worksheet to copy.")]
        [RenderIfCondition(nameof(CopyMode), CellCopyModeEnum.RangeOfCells)]
        public InArgument<string> SourceRangeAddress { get; set; }


        [DisplayName("Start Column")]
        [Description("The starting column of the range to copy.")]
        [RenderIfCondition(nameof(CopyMode), CellCopyModeEnum.RangeOfCells)]
        public InArgument<string> StartColumn { get; set; }


        [DisplayName("Start Row")]
        [Description("The starting row of the range to copy.")]
        [RenderIfCondition(nameof(CopyMode), CellCopyModeEnum.RangeOfCells)]
        public InArgument<int> StartRow { get; set; }


        [DisplayName("End Column")]
        [Description("The ending column of the range to copy.")]
        [RenderIfCondition(nameof(CopyMode), CellCopyModeEnum.RangeOfCells)]
        public InArgument<string> EndColumn { get; set; }


        [DisplayName("End Row")]
        [Description("The ending row of the range to copy.")]
        [RenderIfCondition(nameof(CopyMode), CellCopyModeEnum.RangeOfCells)]
        public InArgument<int> EndRow { get; set; }


        [DisplayName("Name")]
        [Description("The name of the named range to copy.")]
        [RenderIfCondition(nameof(CopyMode), CellCopyModeEnum.NamedCells)]
        public InArgument<string> Name { get; set; }

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
                var copyMode = CopyMode.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                if (!(excelApp.ActiveSheet is Excel.Worksheet worksheet))
                    throw new InvalidOperationException("Worksheet is not available.");

                switch (copyMode)
                {
                    case CellCopyModeEnum.SingleCell:
                        {
                            var colStr = StartColumn.Get(context);
                            var row = StartRow.Get(context);

                            if (!int.TryParse(colStr, out var colNum))
                                // Convert column letter (like "A", "B") to number
                                colNum = GetColumnIndex(colStr);

                            if (!(worksheet.Cells[row, colNum] is Excel.Range targetCell))
                                throw new InvalidOperationException($"Cell at Row {row}, Column {colStr} does not exist.");

                            targetCell.Copy();
                            status = $"Copied cell at Row {row}, Column {colStr}.";
                            break;
                        }

                    case CellCopyModeEnum.NamedCells:
                        {
                            var name = Name.Get(context);
                            var namedRange = worksheet.Names.Item(name)?.RefersToRange;

                            if (namedRange != null)
                            {
                                namedRange.Copy();
                                status = $"Copied named range '{name}'.";
                            }
                            else
                            {
                                status = $"Named range '{name}' not found.";
                            }

                            break;
                        }

                    case CellCopyModeEnum.Selection:
                        {
                            if (worksheet.Application.Selection is Excel.Range selection)
                            {
                                selection.Copy();
                                status = "Copied selected range.";
                            }
                            else
                            {
                                status = "No range is currently selected.";
                            }

                            break;
                        }

                    case CellCopyModeEnum.RangeOfCells:
                        {
                            var startColStr = StartColumn.Get(context);
                            var endColStr = EndColumn.Get(context);
                            var startRow = StartRow.Get(context);
                            var endRow = EndRow.Get(context);

                            int startColNum, endColNum;

                            if (!int.TryParse(startColStr, out startColNum)) startColNum = GetColumnIndex(startColStr);

                            if (!int.TryParse(endColStr, out endColNum)) endColNum = GetColumnIndex(endColStr);

                            var range = worksheet.Range[worksheet.Cells[startRow, startColNum],
                                worksheet.Cells[endRow, endColNum]];
                            range.Copy();
                            status =
                                $"Copied range from Row {startRow}, Column {startColStr} to Row {endRow}, Column {endColStr}.";
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(copyMode));
                }
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error copying cells: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }

        // Helper method to convert column letters to numbers
        private static int GetColumnIndex(string columnName)
        {
            if (string.IsNullOrEmpty(columnName)) return -1;

            columnName = columnName.ToUpperInvariant();

            return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
        }
    }
}