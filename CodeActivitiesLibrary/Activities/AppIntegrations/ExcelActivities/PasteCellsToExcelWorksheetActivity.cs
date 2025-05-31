using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using CodeActivitiesLibrary.Extensions;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Paste Cells to Excel Worksheet")]
    [Description(
        "Pastes a range of cells from a source Excel instance/workbook to a specific range in a target Excel worksheet.")]
    public class PasteCellsToExcelWorksheetActivity : CodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Target Excel Application")]
        [Description("The Excel Application object where the data will be pasted.")]
        public InArgument<Excel.Application> TargetExcelApplication { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Source Excel Application")]
        [Description("The Excel Application object where the data is coming from.")]
        public InArgument<Excel.Application> SourceExcelApplication { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Source Worksheet Name")]
        [Description("Name of the worksheet in the source Excel instance containing the data to copy.")]
        public InArgument<string> SourceWorksheetName { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Source Range Address")]
        [Description("The range address (e.g., 'A1:B10') in the source worksheet to copy.")]
        public InArgument<string> SourceRangeAddress { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Paste Mode")]
        [Description("Specifies how to determine the paste location.")]
        [DefaultValue(CellPasteModeEnum.OnSpecifiedCell)]
        public InArgument<CellPasteModeEnum> PasteMode { get; set; }

        [Category("Input")]
        [DisplayName("Name")]
        [Description("The name of the named range to paste into (required if 'Paste Mode' is 'On Named Cells').")]
        [RenderIfCondition(nameof(PasteMode), "OnNamedCells")]
        public InArgument<string> Name { get; set; }

        [Category("Input")]
        [DisplayName("Column")]
        [Description(
            "The column letter (e.g., 'A', 'B') where the paste should begin (required if 'Paste Mode' is 'On Specified Cell').")]
        [RenderIfCondition(nameof(PasteMode), "OnSpecifiedCell")]
        public InArgument<string> Column { get; set; }

        [Category("Input")]
        [DisplayName("Row")]
        [Description("The row number where the paste should begin (required if 'Paste Mode' is 'On Specified Cell').")]
        [RenderIfCondition(nameof(PasteMode), "OnSpecifiedCell")]
        public InArgument<int> Row { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")] public OutArgument<string> StatusMessage { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var sourceApp = SourceExcelApplication.Get(context);
                var targetApp = TargetExcelApplication.Get(context);
                var sourceWorksheetName = SourceWorksheetName.Get(context);
                var sourceRangeAddress = SourceRangeAddress.Get(context);
                var pasteMode = PasteMode.Get(context);

                if (sourceApp == null || targetApp == null)
                    throw new InvalidOperationException("Both source and target Excel applications must be provided.");

                if (sourceApp.ActiveWorkbook == null || targetApp.ActiveWorkbook == null)
                    throw new InvalidOperationException("Both Excel instances must have an active workbook.");

                if (!(sourceApp.ActiveWorkbook.Worksheets[sourceWorksheetName] is Excel.Worksheet sourceWs))
                    throw new InvalidOperationException($"Source worksheet '{sourceWorksheetName}' not found.");

                var sourceRange = sourceWs.Range[sourceRangeAddress];
                if (sourceRange == null)
                    throw new InvalidOperationException($"Source range '{sourceRangeAddress}' not found.");

                if (!(targetApp.ActiveWorkbook.ActiveSheet is Excel.Worksheet targetWs))
                    throw new InvalidOperationException("Target worksheet could not be retrieved.");

                switch (pasteMode)
                {
                    case CellPasteModeEnum.OnNamedCells:
                    {
                        var name = Name.Get(context);

                        if (string.IsNullOrWhiteSpace(name))
                            throw new ArgumentException("Name cannot be empty when using 'On Named Cells' mode.");

                        var namedRange = targetWs.Names.Item(name)?.RefersToRange;

                        if (namedRange == null)
                            throw new InvalidOperationException($"Named range '{name}' not found.");

                        sourceRange.Copy();
                        namedRange.PasteSpecial(Excel.XlPasteType.xlPasteAll,
                            Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                        break;
                    }

                    case CellPasteModeEnum.OnCurrentlyActiveCell:
                    {
                        var activeCell = targetApp.ActiveCell;
                        if (activeCell == null)
                            throw new InvalidOperationException("No active cell found.");

                        sourceRange.Copy();
                        activeCell.PasteSpecial(Excel.XlPasteType.xlPasteAll,
                            Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                        break;
                    }

                    case CellPasteModeEnum.OnSpecifiedCell:
                    {
                        var colLetter = Column.Get(context);
                        var rowIndex = Row.Get(context);

                        var colIndex = GetColumnIndex(colLetter);

                        if (!(targetWs.Cells[rowIndex, colIndex] is Excel.Range targetCell))
                            throw new InvalidOperationException(
                                $"Target cell at Column {colLetter}, Row {rowIndex} not found.");

                        sourceRange.Copy();
                        targetCell.PasteSpecial(Excel.XlPasteType.xlPasteAll,
                            Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);
                        break;
                    }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(pasteMode));
                }

                status = $"Successfully pasted range '{sourceRangeAddress}' from '{sourceWorksheetName}'.";
            }
            catch (Exception ex)
            {
                status = $"Error pasting cells: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        // Helper method to convert column letter to index
        private static int GetColumnIndex(string columnName)
        {
            if (string.IsNullOrWhiteSpace(columnName))
                throw new ArgumentException("Column name cannot be empty.", nameof(columnName));

            columnName = columnName.ToUpperInvariant();

            return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
        }
    }
}