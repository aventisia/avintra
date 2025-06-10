using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Set Color in Excel Worksheet")]
    [Description("Fills the background of a selected range of cells with the specified color.")]
    public class SetColorInExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------
        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target worksheet.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]
        [DisplayName("Selection Mode")]
        [Description("Specifies how to select the cells to color.")]
        [DefaultValue(ExcelSelectionModeForColorEnum.SingleCell)]
        public InArgument<ExcelSelectionModeForColorEnum> SelectionMode { get; set; }

        // Single Cell Fields

        [DisplayName("Start Column")]
        [Description("The starting column of the cell to color (e.g., 'A').")]
        [RenderIfCondition(nameof(SelectionMode), ExcelSelectionModeForColorEnum.SingleCell)]
        public InArgument<string> StartColumn { get; set; }


        [DisplayName("Start Row")]
        [Description("The starting row of the cell to color (e.g., '1').")]
        [RenderIfCondition(nameof(SelectionMode), ExcelSelectionModeForColorEnum.SingleCell)]
        public InArgument<int> StartRow { get; set; }

        // Range of Cells Fields

        [DisplayName("Start Column")]
        [Description("The starting column of the range to color (e.g., 'A').")]
        [RenderIfCondition(nameof(SelectionMode), ExcelSelectionModeForColorEnum.RangeOfCells)]
        public InArgument<string> StartColumnRange { get; set; }


        [DisplayName("Start Row")]
        [Description("The starting row of the range to color (e.g., '1').")]
        [RenderIfCondition(nameof(SelectionMode), ExcelSelectionModeForColorEnum.RangeOfCells)]
        public InArgument<int> StartRowRange { get; set; }


        [DisplayName("End Column")]
        [Description("The ending column of the range to color (e.g., 'B').")]
        [RenderIfCondition(nameof(SelectionMode), ExcelSelectionModeForColorEnum.RangeOfCells)]
        public InArgument<string> EndColumnRange { get; set; }


        [DisplayName("End Row")]
        [Description("The ending row of the range to color (e.g., '5').")]
        [RenderIfCondition(nameof(SelectionMode), ExcelSelectionModeForColorEnum.RangeOfCells)]
        public InArgument<int> EndRowRange { get; set; }

        // Named Cells Fields

        [DisplayName("Named Range")]
        [Description("The name of the named range to color.")]
        [RenderIfCondition(nameof(SelectionMode), ExcelSelectionModeForColorEnum.NamedCells)]
        public InArgument<string> NamedRange { get; set; }

        [RequiredArgument]
        [DisplayName("Color Format")]
        [Description("Specifies the format of the color input.")]
        [DefaultValue(ExcelColorFormatEnum.Name)]
        public InArgument<ExcelColorFormatEnum> ColorFormat { get; set; }

        // Color Name Field

        [DisplayName("Color Name")]
        [Description("The name of the color to apply (e.g., 'Red', 'Green').")]
        [RenderIfCondition(nameof(ColorFormat), ExcelColorFormatEnum.Name)]
        public InArgument<ExcelColorEnum> ColorName { get; set; }

        // Hexadecimal Value Field

        [DisplayName("Color Hexadecimal Value")]
        [Description("The hexadecimal value of the color to apply (e.g., '#FF0000' for Red).")]
        [RenderIfCondition(nameof(ColorFormat), ExcelColorFormatEnum.HexadecimalValue)]
        public InArgument<string> ColorHexValue { get; set; }

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
                var selectionMode = SelectionMode.Get(context);
                var colorFormat = ColorFormat.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                Excel.Worksheet ws = excelApp.ActiveSheet;

                Excel.Range range = null;

                string startCol = null;
                int startRow = 0;
                string endCol = null;
                int endRow = 0;

                switch (selectionMode)
                {
                    case ExcelSelectionModeForColorEnum.SingleCell:
                        startCol = StartColumn.Get(context);
                        startRow = StartRow.Get(context);
                        break;

                    case ExcelSelectionModeForColorEnum.RangeOfCells:
                        startCol = StartColumnRange.Get(context);
                        startRow = StartRowRange.Get(context);
                        endCol = EndColumnRange.Get(context);
                        endRow = EndRowRange.Get(context);
                        break;

                    case ExcelSelectionModeForColorEnum.NamedCells:
                        var namedRange = NamedRange.Get(context);
                        if (string.IsNullOrWhiteSpace(namedRange))
                            throw new ArgumentException("Named range cannot be empty when using 'Named Cells' mode.");
                        range = ws.Names.Item(namedRange)?.RefersToRange;
                        if (range == null)
                            throw new ArgumentException($"Named range '{namedRange}' not found.");
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(selectionMode));
                }

                // Construct range only after extracting values
                if (selectionMode == ExcelSelectionModeForColorEnum.SingleCell ||
                    selectionMode == ExcelSelectionModeForColorEnum.RangeOfCells)
                {
                    if (string.IsNullOrWhiteSpace(startCol) || startRow <= 0)
                        throw new ArgumentException("Both Start Column and Start Row must be specified for Single Cell mode.");

                    if (selectionMode == ExcelSelectionModeForColorEnum.RangeOfCells &&
                        (string.IsNullOrWhiteSpace(endCol) || endRow <= 0))
                        throw new ArgumentException("All fields for Range of Cells must be specified and valid.");

                    if (selectionMode == ExcelSelectionModeForColorEnum.SingleCell)
                    {
                        range = ws.Cells[startRow, GetColumnIndex(startCol)];
                    }
                    else if (selectionMode == ExcelSelectionModeForColorEnum.RangeOfCells)
                    {
                        range = ws.Range[ws.Cells[startRow, GetColumnIndex(startCol)],
                                         ws.Cells[endRow, GetColumnIndex(endCol)]];
                    }
                }

                if (range == null)
                    throw new ArgumentException("No valid range was selected.");

                int colorValue = 0;

                switch (colorFormat)
                {
                    case ExcelColorFormatEnum.Name:
                        var colorEnum = ColorName.Get(context);
                        colorValue = GetColorValueFromEnum(colorEnum);
                        break;

                    case ExcelColorFormatEnum.HexadecimalValue:
                        var hexValue = ColorHexValue.Get(context);
                        if (string.IsNullOrWhiteSpace(hexValue))
                            throw new ArgumentException("Hexadecimal value cannot be empty when using 'Hexadecimal Value' format.");
                        colorValue = Convert.ToInt32(hexValue.Replace("#", ""), 16);
                        break;

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

        private static int GetColorValueFromEnum(ExcelColorEnum color)
        {
            switch (color)
            {
                case ExcelColorEnum.Red:
                    return 255; // #FF0000
                case ExcelColorEnum.Green:
                    return 65280; // #00FF00
                case ExcelColorEnum.Blue:
                    return 255 * 256 * 256; // #0000FF
                case ExcelColorEnum.Yellow:
                    return 65535; // #FFFF00
                case ExcelColorEnum.Black:
                    return 0; // #000000
                case ExcelColorEnum.White:
                    return 16777215; // #FFFFFF
                case ExcelColorEnum.Aquamarine:
                    return 13959039; // #7FFFD4
                case ExcelColorEnum.Azure:
                    return 16777167; // #F0FFFF
                case ExcelColorEnum.Bisque:
                    return 16774015; // #FFE4C4
                case ExcelColorEnum.Coral:
                    return 16744576; // #FF7F50
                case ExcelColorEnum.DarkOrange:
                    return 16741615; // #FF8C00
                case ExcelColorEnum.Gold:
                    return 16766976; // #FFD700
                case ExcelColorEnum.Lime:
                    return 65280; // #00FF00
                case ExcelColorEnum.Magenta:
                    return 16711935; // #FF00FF
                case ExcelColorEnum.Orange:
                    return 16753920; // #FFA500
                case ExcelColorEnum.Pink:
                    return 16751052; // #FFC0CB
                case ExcelColorEnum.Purple:
                    return 8388736; // #800080
                case ExcelColorEnum.Teal:
                    return 8421376; // #008080
                case ExcelColorEnum.Turquoise:
                    return 13687627; // #40E0D0
                case ExcelColorEnum.Violet:
                    return 15631086; // #EE82EE
                default:
                    throw new ArgumentException($"Unsupported color: {color}");
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

    public enum ExcelColorEnum
    {
        [Description("Red (#FF0000)")]
        Red,

        [Description("Green (#00FF00)")]
        Green,

        [Description("Blue (#0000FF)")]
        Blue,

        [Description("Yellow (#FFFF00)")]
        Yellow,

        [Description("Black (#000000)")]
        Black,

        [Description("White (#FFFFFF)")]
        White,

        [Description("Aquamarine (#7FFFD4)")]
        Aquamarine,

        [Description("Azure (#F0FFFF)")]
        Azure,

        [Description("Bisque (#FFE4C4)")]
        Bisque,

        [Description("Coral (#FF7F50)")]
        Coral,

        [Description("Dark Orange (#FF8C00)")]
        DarkOrange,

        [Description("Gold (#FFD700)")]
        Gold,

        [Description("Lime (#00FF00)")]
        Lime,

        [Description("Magenta (#FF00FF)")]
        Magenta,

        [Description("Orange (#FFA500)")]
        Orange,

        [Description("Pink (#FFC0CB)")]
        Pink,

        [Description("Purple (#800080)")]
        Purple,

        [Description("Teal (#008080)")]
        Teal,

        [Description("Turquoise (#40E0D0)")]
        Turquoise,

        [Description("Violet (#EE82EE)")]
        Violet
    }
}