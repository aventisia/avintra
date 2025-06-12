using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Auto Fill Range in Excel Worksheet")]
    [Description("Copies data from a source range to a target range in the active worksheet of an Excel instance.")]
    public class AutoFillCellsInExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target worksheet.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]
        [DisplayName("Ranges Format")]
        [Description("Specifies how ranges are defined: by specific ranges or named cells.")]
        [DefaultValue(ExcelRangesFormatEnum.SpecificRanges)]
        public InArgument<ExcelRangesFormatEnum> RangesFormat { get; set; }

        // Specific Ranges Fields

        [DisplayName("Start Column")]
        [Description("The starting column of the source range (e.g., 'A').")]
        [RenderIfCondition(nameof(RangesFormat), ExcelRangesFormatEnum.SpecificRanges)]
        public InArgument<string> StartColumn { get; set; }


        [DisplayName("Start Row")]
        [Description("The starting row of the source range (e.g., '1').")]
        [RenderIfCondition(nameof(RangesFormat), ExcelRangesFormatEnum.SpecificRanges)]
        public InArgument<int> StartRow { get; set; }


        [DisplayName("Source End Column")]
        [Description("The ending column of the source range (e.g., 'B').")]
        [RenderIfCondition(nameof(RangesFormat), ExcelRangesFormatEnum.SpecificRanges)]
        public InArgument<string> SourceEndColumn { get; set; }


        [DisplayName("Source End Row")]
        [Description("The ending row of the source range (e.g., '5').")]
        [RenderIfCondition(nameof(RangesFormat), ExcelRangesFormatEnum.SpecificRanges)]
        public InArgument<int> SourceEndRow { get; set; }


        [DisplayName("Destination End Column")]
        [Description("The ending column of the target range (e.g., 'C').")]
        [RenderIfCondition(nameof(RangesFormat), ExcelRangesFormatEnum.SpecificRanges)]
        public InArgument<string> DestinationEndColumn { get; set; }


        [DisplayName("Destination End Row")]
        [Description("The ending row of the target range (e.g., '10').")]
        [RenderIfCondition(nameof(RangesFormat), ExcelRangesFormatEnum.SpecificRanges)]
        public InArgument<int> DestinationEndRow { get; set; }

        // Named Cells Fields

        [DisplayName("Source Cells Name")]
        [Description("The name of the named range containing the source data.")]
        [RenderIfCondition(nameof(RangesFormat), ExcelRangesFormatEnum.NamedCells)]
        public InArgument<string> SourceCellsName { get; set; }


        [DisplayName("Destination Cells Name")]
        [Description("The name of the named range where the data should be pasted.")]
        [RenderIfCondition(nameof(RangesFormat), ExcelRangesFormatEnum.NamedCells)]
        public InArgument<string> DestinationCellsName { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var excelApp = ExcelApplication.Get(context);
                var rangesFormat = RangesFormat.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                if (!(excelApp.ActiveSheet is Excel.Worksheet worksheet))
                    throw new InvalidOperationException("Worksheet is not available.");

                switch (rangesFormat)
                {
                    case ExcelRangesFormatEnum.SpecificRanges:
                        {
                            var startColumn = StartColumn.Get(context);
                            var startRow = StartRow.Get(context);
                            var sourceEndColumn = SourceEndColumn.Get(context);
                            var sourceEndRow = SourceEndRow.Get(context);
                            var destinationEndColumn = DestinationEndColumn.Get(context);
                            var destinationEndRow = DestinationEndRow.Get(context);

                            if (string.IsNullOrWhiteSpace(startColumn) || string.IsNullOrWhiteSpace(sourceEndColumn) ||
                                string.IsNullOrWhiteSpace(destinationEndColumn) ||
                                startRow <= 0 || sourceEndRow <= 0 || destinationEndRow <= 0)
                                throw new ArgumentException(
                                    "All fields for Specific Ranges must be specified and valid.");

                            // Construct source and target ranges
                            var sourceRangeStr = $"{startColumn}{startRow}:{sourceEndColumn}{sourceEndRow}";
                            var targetRangeStr =
                                $"{startColumn}{destinationEndRow - (sourceEndRow - startRow)}:{destinationEndColumn}{destinationEndRow}";

                            var sourceRange = worksheet.Range[sourceRangeStr];
                            var targetRange = worksheet.Range[targetRangeStr];

                            // Copy values only from source to target
                            if (!(sourceRange.Value is object[,] sourceValues))
                                throw new InvalidOperationException(
                                    $"Source range '{sourceRangeStr}' does not contain valid data.");

                            var rowCount = sourceValues.GetLength(0);
                            var colCount = sourceValues.GetLength(1);

                            for (var i = 1; i <= rowCount; i++)
                                for (var j = 1; j <= colCount; j++)
                                    ((Excel.Range)targetRange.Cells[i, j]).Value = sourceValues[i, j];

                            status += $" Copied data from '{sourceRangeStr}' to '{targetRangeStr}'.";
                            break;
                        }

                    case ExcelRangesFormatEnum.NamedCells:
                        {
                            var sourceCellsName = SourceCellsName.Get(context);
                            var destinationCellsName = DestinationCellsName.Get(context);

                            if (string.IsNullOrWhiteSpace(sourceCellsName) ||
                                string.IsNullOrWhiteSpace(destinationCellsName))
                                throw new ArgumentException(
                                    "Both Source Cells Name and Destination Cells Name must be specified when using Named Cells.");

                            var sourceRange = worksheet.Names.Item(sourceCellsName).RefersToRange;
                            var targetRange = worksheet.Names.Item(destinationCellsName).RefersToRange;

                            // Copy values only from source to target
                            if (!(sourceRange.Value is object[,] sourceValues))
                                throw new InvalidOperationException(
                                    $"Source named range '{sourceCellsName}' does not contain valid data.");

                            var rowCount = sourceValues.GetLength(0);
                            var colCount = sourceValues.GetLength(1);

                            for (var i = 1; i <= rowCount; i++)
                                for (var j = 1; j <= colCount; j++)
                                    ((Excel.Range)targetRange.Cells[i, j]).Value = sourceValues[i, j];

                            status +=
                                $" Copied data from named range '{sourceCellsName}' to named range '{destinationCellsName}'.";
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(rangesFormat));
                }
            }
            catch (Exception ex)
            {
                status = $"Error auto-filling cells: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}