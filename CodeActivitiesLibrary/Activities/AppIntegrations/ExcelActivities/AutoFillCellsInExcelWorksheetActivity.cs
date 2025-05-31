using System;
using System.Activities;
using System.ComponentModel;
using CodeActivitiesLibrary.Extensions;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Auto Fill Range in Excel Worksheet")]
    [Description("Copies data from a source range to a target range in the active worksheet of an Excel instance.")]
    public class AutoFillCellsInExcelWorksheetActivity : CodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target worksheet.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Ranges Format")]
        [Description("Specifies how ranges are defined: by specific ranges or named cells.")]
        [DefaultValue(ExcelRangesFormatEnum.SpecificRanges)]
        public InArgument<ExcelRangesFormatEnum> RangesFormat { get; set; }

        [Category("Input")]
        [DisplayName("Source Range")]
        [Description("The range containing the data to be copied (e.g., 'A1:A5').")]
        [RenderIfCondition(nameof(RangesFormat), "SpecificRanges")]
        public InArgument<string> SourceRange { get; set; }

        [Category("Input")]
        [DisplayName("Target Range")]
        [Description("The range where the data should be pasted (e.g., 'A6:A10').")]
        [RenderIfCondition(nameof(RangesFormat), "SpecificRanges")]
        public InArgument<string> TargetRange { get; set; }

        [Category("Input")]
        [DisplayName("Source Named Range")]
        [Description("The name of the named range containing the source data.")]
        [RenderIfCondition(nameof(RangesFormat), "NamedCells")]
        public InArgument<string> SourceNamedRange { get; set; }

        [Category("Input")]
        [DisplayName("Target Named Range")]
        [Description("The name of the named range where the data should be pasted.")]
        [RenderIfCondition(nameof(RangesFormat), "NamedCells")]
        public InArgument<string> TargetNamedRange { get; set; }

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
                        var sourceRangeStr = SourceRange.Get(context);
                        var targetRangeStr = TargetRange.Get(context);

                        if (string.IsNullOrWhiteSpace(sourceRangeStr) || string.IsNullOrWhiteSpace(targetRangeStr))
                            throw new ArgumentException(
                                "Both Source Range and Target Range must be specified when using Specific Ranges.");

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
                        var sourceNamedRange = SourceNamedRange.Get(context);
                        var targetNamedRange = TargetNamedRange.Get(context);

                        if (string.IsNullOrWhiteSpace(sourceNamedRange) || string.IsNullOrWhiteSpace(targetNamedRange))
                            throw new ArgumentException(
                                "Both Source Named Range and Target Named Range must be specified when using Named Cells.");

                        var sourceRange = worksheet.Names.Item(sourceNamedRange).RefersToRange;
                        var targetRange = worksheet.Names.Item(targetNamedRange).RefersToRange;

                        // Copy values only from source to target
                        if (!(sourceRange.Value is object[,] sourceValues))
                            throw new InvalidOperationException(
                                $"Source named range '{sourceNamedRange}' does not contain valid data.");

                        var rowCount = sourceValues.GetLength(0);
                        var colCount = sourceValues.GetLength(1);

                        for (var i = 1; i <= rowCount; i++)
                        for (var j = 1; j <= colCount; j++)
                            ((Excel.Range)targetRange.Cells[i, j]).Value = sourceValues[i, j];

                        status +=
                            $" Copied data from named range '{sourceNamedRange}' to named range '{targetNamedRange}'.";
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