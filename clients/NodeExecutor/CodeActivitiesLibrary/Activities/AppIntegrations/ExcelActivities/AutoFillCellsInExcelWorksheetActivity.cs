using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Auto Fill Range in Excel Worksheet")]
    [Description("Copies data from a source range to a target range in the specified or active worksheet of an Excel workbook.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class AutoFillCellsInExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The Excel Worksheet to use. If not provided, the active worksheet will be used.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

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
            string status = "Success";

            try
            {
                Excel.Worksheet worksheet = WorksheetInstance.Get(context);
                ExcelRangesFormatEnum rangesFormat = RangesFormat.Get(context);

                // Use the active sheet if not provided
                if (worksheet == null)
                {
                    var excelApp = (Excel.Application)System.Runtime.InteropServices.Marshal.GetActiveObject("Excel.Application");
                    worksheet = excelApp?.ActiveSheet as Excel.Worksheet;
                }

                if (worksheet == null)
                    throw new InvalidOperationException("Worksheet instance is not available or invalid.");

                switch (rangesFormat)
                {
                    case ExcelRangesFormatEnum.SpecificRanges:
                        {
                            string startColumn = StartColumn.Get(context);
                            int startRow = StartRow.Get(context);
                            string sourceEndColumn = SourceEndColumn.Get(context);
                            int sourceEndRow = SourceEndRow.Get(context);
                            string destinationEndColumn = DestinationEndColumn.Get(context);
                            int destinationEndRow = DestinationEndRow.Get(context);

                            if (string.IsNullOrWhiteSpace(startColumn) ||
                                string.IsNullOrWhiteSpace(sourceEndColumn) ||
                                string.IsNullOrWhiteSpace(destinationEndColumn) ||
                                startRow <= 0 || sourceEndRow <= 0 || destinationEndRow <= 0)
                            {
                                throw new ArgumentException("All fields for Specific Ranges must be specified and valid.");
                            }

                            string sourceRangeStr = string.Format("{0}{1}:{2}{3}", startColumn, startRow, sourceEndColumn, sourceEndRow);
                            string targetRangeStr = string.Format("{0}{1}:{2}{3}",
                                startColumn,
                                destinationEndRow - (sourceEndRow - startRow),
                                destinationEndColumn,
                                destinationEndRow);

                            Excel.Range sourceRange = worksheet.Range[sourceRangeStr];
                            Excel.Range targetRange = worksheet.Range[targetRangeStr];

                            if (!(sourceRange.Value is object[,] sourceValues))
                                throw new InvalidOperationException(
                                    string.Format("Source range '{0}' does not contain valid data.", sourceRangeStr));

                            int rowCount = sourceValues.GetLength(0);
                            int colCount = sourceValues.GetLength(1);

                            for (int i = 1; i <= rowCount; i++)
                            {
                                for (int j = 1; j <= colCount; j++)
                                {
                                    ((Excel.Range)targetRange.Cells[i, j]).Value = sourceValues[i, j];
                                }
                            }

                            status += string.Format(" Copied data from '{0}' to '{1}'.", sourceRangeStr, targetRangeStr);
                            break;
                        }

                    case ExcelRangesFormatEnum.NamedCells:
                        {
                            string sourceCellsName = SourceCellsName.Get(context);
                            string destinationCellsName = DestinationCellsName.Get(context);

                            if (string.IsNullOrWhiteSpace(sourceCellsName) ||
                                string.IsNullOrWhiteSpace(destinationCellsName))
                            {
                                throw new ArgumentException(
                                    "Both Source Cells Name and Destination Cells Name must be specified when using Named Cells.");
                            }

                            Excel.Range sourceRange = worksheet.Names.Item(sourceCellsName).RefersToRange;
                            Excel.Range targetRange = worksheet.Names.Item(destinationCellsName).RefersToRange;

                            if (!(sourceRange.Value is object[,] sourceValues))
                                throw new InvalidOperationException(
                                    string.Format("Source named range '{0}' does not contain valid data.", sourceCellsName));

                            int rowCount = sourceValues.GetLength(0);
                            int colCount = sourceValues.GetLength(1);

                            for (int i = 1; i <= rowCount; i++)
                            {
                                for (int j = 1; j <= colCount; j++)
                                {
                                    ((Excel.Range)targetRange.Cells[i, j]).Value = sourceValues[i, j];
                                }
                            }

                            status += string.Format(" Copied data from named range '{0}' to named range '{1}'.",
                                sourceCellsName, destinationCellsName);
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(rangesFormat));
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = "Error auto-filling cells: " + ex.Message;
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}