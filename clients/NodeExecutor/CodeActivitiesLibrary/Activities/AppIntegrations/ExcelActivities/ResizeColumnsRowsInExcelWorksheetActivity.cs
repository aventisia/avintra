using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Resize Columns or Rows in Excel Worksheet")]
    [Description("Resizes the width of columns or the height of rows in the provided Excel worksheet.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class ResizeColumnsRowsInExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Worksheet Instance")]
        [Description("The Excel Worksheet object in which columns or rows should be resized.")]
        public InArgument<Excel.Worksheet> WorksheetInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Resize Target")]
        [Description("Specifies whether to resize Columns or Rows.")]
        [DefaultValue(ExcelColumnResizeTargetEnum.Columns)]
        public InArgument<ExcelColumnResizeTargetEnum> ResizeTarget { get; set; }

        [RequiredArgument]
        [DisplayName("Selection Range")]
        [Description("Specifies how to select the range to resize: All available, Range, or Single.")]
        [DefaultValue(ExcelColumnSelectionRangeEnum.AllAvailable)]
        public InArgument<ExcelColumnSelectionRangeEnum> SelectionRange { get; set; }

        [DisplayName("Start Column")]
        [Description("The starting column of the range to resize (required if 'Selection Range' is 'Range').")]
        [RenderIfCondition(nameof(SelectionRange), ExcelColumnSelectionRangeEnum.Range)]
        public InArgument<string> StartColumn { get; set; }

        [DisplayName("End Column")]
        [Description("The ending column of the range to resize (required if 'Selection Range' is 'Range').")]
        [RenderIfCondition(nameof(SelectionRange), ExcelColumnSelectionRangeEnum.Range)]
        public InArgument<string> EndColumn { get; set; }

        [DisplayName("Column")]
        [Description("The column letter (e.g., 'A', 'B') to resize (required if 'Selection Range' is 'Single').")]
        [RenderIfCondition(nameof(SelectionRange), ExcelColumnSelectionRangeEnum.Single)]
        public InArgument<string> Column { get; set; }

        [RequiredArgument]
        [DisplayName("Resize Type")]
        [Description("Choose whether to resize using a custom size or autofit.")]
        [DefaultValue(ExcelColumnResizeTypeEnum.CustomSize)]
        public InArgument<ExcelColumnResizeTypeEnum> ResizeType { get; set; }

        [DisplayName("Width")]
        [Description("The new width for columns or height for rows (required if 'Resize Type' is 'Custom Size').")]
        [RenderIfCondition(nameof(ResizeType), ExcelColumnResizeTypeEnum.CustomSize)]
        public InArgument<double> Width { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            string status = "Success";

            try
            {
                var worksheet = WorksheetInstance.Get(context);
                var resizeTarget = ResizeTarget.Get(context);
                var selectionRange = SelectionRange.Get(context);
                var resizeType = ResizeType.Get(context);

                // Ensure worksheet is available
                if (worksheet == null)
                {

                    if (worksheet == null)
                    {
                        var excelApp = (Excel.Application)System.Runtime.InteropServices.Marshal.GetActiveObject("Excel.Application");
                        worksheet = excelApp?.ActiveSheet as Excel.Worksheet;
                    }

                    if (worksheet == null)
                        throw new InvalidOperationException("Unable to access an active worksheet from the provided workbook.");
                }

                switch (selectionRange)
                {
                    case ExcelColumnSelectionRangeEnum.AllAvailable:
                        ApplyResizeToAll(worksheet, resizeTarget, resizeType, context);
                        break;

                    case ExcelColumnSelectionRangeEnum.Range:
                        ApplyResizeToRange(worksheet, resizeTarget, resizeType, context);
                        break;

                    case ExcelColumnSelectionRangeEnum.Single:
                        ApplyResizeToSingle(worksheet, resizeTarget, resizeType, context);
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(selectionRange));
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error resizing columns/rows: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }

        // ----------------------
        // Helper Methods
        // ----------------------
        private void ApplyResizeToAll(Excel.Worksheet worksheet, ExcelColumnResizeTargetEnum target, ExcelColumnResizeTypeEnum resizeType, CodeActivityContext context)
        {
            switch (target)
            {
                case ExcelColumnResizeTargetEnum.Columns:
                    if (resizeType == ExcelColumnResizeTypeEnum.Autofit)
                        worksheet.Columns.AutoFit();
                    else
                        worksheet.Columns.ColumnWidth = Width.Get(context);
                    break;

                case ExcelColumnResizeTargetEnum.Rows:
                    if (resizeType == ExcelColumnResizeTypeEnum.Autofit)
                        worksheet.Rows.AutoFit();
                    else
                        worksheet.Rows.RowHeight = Width.Get(context);
                    break;
            }
        }

        private void ApplyResizeToRange(Excel.Worksheet worksheet, ExcelColumnResizeTargetEnum target, ExcelColumnResizeTypeEnum resizeType, CodeActivityContext context)
        {
            var startCol = StartColumn.Get(context);
            var endCol = EndColumn.Get(context);

            var startColIndex = GetColumnIndex(startCol);
            var endColIndex = GetColumnIndex(endCol);

            var range = worksheet.Range[worksheet.Cells[1, startColIndex], worksheet.Cells[1, endColIndex]];

            switch (target)
            {
                case ExcelColumnResizeTargetEnum.Columns:
                    if (resizeType == ExcelColumnResizeTypeEnum.Autofit)
                        range.EntireColumn.AutoFit();
                    else
                        range.EntireColumn.ColumnWidth = Width.Get(context);
                    break;

                case ExcelColumnResizeTargetEnum.Rows:
                    if (resizeType == ExcelColumnResizeTypeEnum.Autofit)
                        range.EntireRow.AutoFit();
                    else
                        range.EntireRow.RowHeight = Width.Get(context);
                    break;
            }
        }

        private void ApplyResizeToSingle(Excel.Worksheet worksheet, ExcelColumnResizeTargetEnum target, ExcelColumnResizeTypeEnum resizeType, CodeActivityContext context)
        {
            var colLetter = Column.Get(context);
            var colIndex = GetColumnIndex(colLetter);

            switch (target)
            {
                case ExcelColumnResizeTargetEnum.Columns:
                    if (resizeType == ExcelColumnResizeTypeEnum.Autofit)
                        worksheet.Columns[colIndex].AutoFit();
                    else
                        worksheet.Columns[colIndex].ColumnWidth = Width.Get(context);
                    break;

                case ExcelColumnResizeTargetEnum.Rows:
                    if (resizeType == ExcelColumnResizeTypeEnum.Autofit)
                        worksheet.Rows[colIndex].AutoFit();
                    else
                        worksheet.Rows[colIndex].RowHeight = Width.Get(context);
                    break;
            }
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