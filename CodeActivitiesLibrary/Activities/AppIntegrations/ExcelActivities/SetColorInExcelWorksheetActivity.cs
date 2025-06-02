using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using CodeActivitiesLibrary.Extensions;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Set Color in Excel Worksheet")]
    [Description("Fills the background of a selected range of cells with the specified color.")]
    public class SetColorInExcelWorksheetActivity : Extensions.BaseCodeActivity
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
        [DisplayName("Selection Mode")]
        [Description("Specifies how to select the cells to color.")]
        [DefaultValue(ExcelSelectionModeForColorEnum.SingleCell)]
        public InArgument<ExcelSelectionModeForColorEnum> SelectionMode { get; set; }

        [Category("Input")]
        [DisplayName("Start Column")]
        [Description("The starting column of the range to color (required if 'Selection Mode' is 'Range of Cells').")]
        [RenderIfCondition(nameof(SelectionMode), "RangeOfCells")]
        public InArgument<string> StartColumn { get; set; }

        [Category("Input")]
        [DisplayName("End Column")]
        [Description("The ending column of the range to color (required if 'Selection Mode' is 'Range of Cells').")]
        [RenderIfCondition(nameof(SelectionMode), "RangeOfCells")]
        public InArgument<string> EndColumn { get; set; }

        [Category("Input")]
        [DisplayName("Start Row")]
        [Description("The starting row of the range to color (required if 'Selection Mode' is 'Range of Cells').")]
        [RenderIfCondition(nameof(SelectionMode), "RangeOfCells")]
        public InArgument<int> StartRow { get; set; }

        [Category("Input")]
        [DisplayName("End Row")]
        [Description("The ending row of the range to color (required if 'Selection Mode' is 'Range of Cells').")]
        [RenderIfCondition(nameof(SelectionMode), "RangeOfCells")]
        public InArgument<int> EndRow { get; set; }

        [Category("Input")]
        [DisplayName("Named Range")]
        [Description("The name of the named range to color (required if 'Selection Mode' is 'Named Cells').")]
        [RenderIfCondition(nameof(SelectionMode), "NamedCells")]
        public InArgument<string> NamedRange { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Color Format")]
        [Description("Specifies the format of the color input.")]
        [DefaultValue(ExcelColorFormatEnum.Name)]
        public InArgument<ExcelColorFormatEnum> ColorFormat { get; set; }

        [Category("Input")]
        [DisplayName("Color Name")]
        [Description("The name of the color to apply (required if 'Color Format' is 'Name').")]
        [RenderIfCondition(nameof(ColorFormat), "Name")]
        public InArgument<string> ColorName { get; set; }

        [Category("Input")]
        [DisplayName("Color Hexadecimal Value")]
        [Description(
            "The hexadecimal value of the color to apply (required if 'Color Format' is 'Hexadecimal Value').")]
        [RenderIfCondition(nameof(ColorFormat), "HexadecimalValue")]
        public InArgument<string> ColorHexValue { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")] 

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var excelApp = ExcelApplication.Get(context);
                var selectionMode = SelectionMode.Get(context);
                var colorFormat = ColorFormat.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                Excel.Worksheet ws = excelApp.ActiveSheet;

                Excel.Range range = null;

                switch (selectionMode)
                {
                    case ExcelSelectionModeForColorEnum.SingleCell:
                        {
                            var startCol = StartColumn.Get(context);
                            var startRow = StartRow.Get(context);

                            range = ws.Cells[startRow, GetColumnIndex(startCol)];
                            break;
                        }

                    case ExcelSelectionModeForColorEnum.RangeOfCells:
                        {
                            var startCol = StartColumn.Get(context);
                            var endCol = EndColumn.Get(context);
                            var startRow = StartRow.Get(context);
                            var endRow = EndRow.Get(context);

                            range = ws.Range[ws.Cells[startRow, GetColumnIndex(startCol)],
                                ws.Cells[endRow, GetColumnIndex(endCol)]];
                            break;
                        }

                    case ExcelSelectionModeForColorEnum.NamedCells:
                        {
                            var namedRange = NamedRange.Get(context);

                            if (string.IsNullOrWhiteSpace(namedRange))
                                throw new ArgumentException("Named range cannot be empty when using 'Named Cells' mode.");

                            range = ws.Names.Item(namedRange)?.RefersToRange;
                            if (range == null)
                                throw new ArgumentException($"Named range '{namedRange}' not found.");
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(selectionMode));
                }

                if (range == null)
                    throw new ArgumentException("No valid range was selected.");

                var colorValue = 0;

                switch (colorFormat)
                {
                    case ExcelColorFormatEnum.Name:
                        {
                            var colorName = ColorName.Get(context);

                            if (string.IsNullOrWhiteSpace(colorName))
                                throw new ArgumentException("Color name cannot be empty when using 'Name' format.");

                            colorValue = GetColorValueFromName(colorName);
                            break;
                        }

                    case ExcelColorFormatEnum.HexadecimalValue:
                        {
                            var hexValue = ColorHexValue.Get(context);

                            if (string.IsNullOrWhiteSpace(hexValue))
                                throw new ArgumentException(
                                    "Hexadecimal value cannot be empty when using 'Hexadecimal Value' format.");

                            colorValue = Convert.ToInt32(hexValue, 16);
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(colorFormat));
                }

                // Apply the color to the selected range
                range.Interior.Color = colorValue;
            }
            catch (Exception ex)
            {
                status = $"Error setting cell color: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        private static int GetColorValueFromName(string colorName)
        {
            switch (colorName.ToLower())
            {
                case "red":
                    return 255; // RGB: #FF0000
                case "green":
                    return 65280; // RGB: #00FF00
                case "blue":
                    return 255 * 256 * 256; // RGB: #0000FF
                case "yellow":
                    return 65535; // RGB: #FFFF00
                case "black":
                    return 0; // RGB: #000000
                case "white":
                    return 16777215; // RGB: #FFFFFF
                default:
                    throw new ArgumentException($"Unsupported color name: {colorName}");
            }
        }

        private static int GetColumnIndex(string columnName)
        {
            if (string.IsNullOrWhiteSpace(columnName))
                throw new ArgumentException("Column name cannot be empty.", nameof(columnName));

            columnName = columnName.ToUpperInvariant();

            return columnName.Aggregate(0, (current, c) => current * 26 + (c - 'A') + 1);
        }
    }
}