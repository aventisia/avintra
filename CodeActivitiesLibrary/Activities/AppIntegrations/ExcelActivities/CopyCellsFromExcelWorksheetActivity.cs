using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using System.Runtime.InteropServices;
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
            Excel.Application excelApp = null;
            Excel.Worksheet worksheet = null;

            try
            {
                excelApp = ExcelApplication.Get(context);
                var copyMode = CopyMode.Get(context);

                if (excelApp?.ActiveWorkbook == null)
                    throw new InvalidOperationException("Excel application or workbook is not available.");

                string worksheetName = SourceWorksheetName.Get(context);
                var workbook = excelApp.ActiveWorkbook;

                worksheet = string.IsNullOrEmpty(worksheetName)
                    ? (Excel.Worksheet)workbook.ActiveSheet
                    : (Excel.Worksheet)workbook.Worksheets[worksheetName];

                if (worksheet == null)
                    throw new InvalidOperationException($"Worksheet '{worksheetName}' not found.");

                switch (copyMode)
                {
                    case CellCopyModeEnum.SingleCell:
                        {
                            var colStr = StartColumn.Get(context);
                            var row = StartRow.Get(context);
                            int colNum = GetColumnIndex(colStr);

                            var cell = worksheet.Cells[row, colNum] as Excel.Range;
                            if (cell == null)
                                throw new InvalidOperationException($"Cell at Row {row}, Column {colStr} does not exist.");

                            cell.Copy();
                            status = $"Copied cell at Row {row}, Column {colStr}.";
                            Marshal.ReleaseComObject(cell);
                            break;
                        }

                    case CellCopyModeEnum.NamedCells:
                        {
                            var name = Name.Get(context);
                            var namedItem = worksheet.Names.Item(name);
                            if (namedItem == null)
                                throw new InvalidOperationException($"Named range '{name}' not found.");

                            var namedRange = namedItem.RefersToRange;
                            if (namedRange != null)
                            {
                                namedRange.Copy();
                                status = $"Copied named range '{name}'.";
                                Marshal.ReleaseComObject(namedRange);
                            }
                            else
                            {
                                status = $"Named range '{name}' not found.";
                            }

                            Marshal.ReleaseComObject(namedItem);
                            break;
                        }

                    case CellCopyModeEnum.Selection:
                        {
                            var selection = excelApp.Selection as Excel.Range;
                            if (selection != null)
                            {
                                selection.Copy();
                                status = "Copied selected range.";
                                Marshal.ReleaseComObject(selection);
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

                            int startColNum = GetColumnIndex(startColStr);
                            int endColNum = GetColumnIndex(endColStr);

                            var startCell = worksheet.Cells[startRow, startColNum];
                            var endCell = worksheet.Cells[endRow, endColNum];
                            var range = worksheet.Range[startCell, endCell];

                            range.Copy();
                            status = $"Copied range from Row {startRow}, Column {startColStr} to Row {endRow}, Column {endColStr}.";

                            Marshal.ReleaseComObject(startCell);
                            Marshal.ReleaseComObject(endCell);
                            Marshal.ReleaseComObject(range);
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
            finally
            {
                if (worksheet != null) Marshal.ReleaseComObject(worksheet);
                // Don't release excelApp unless you're sure it was created by this activity
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