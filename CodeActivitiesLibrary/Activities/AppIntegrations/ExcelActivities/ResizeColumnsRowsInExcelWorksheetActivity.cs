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
    [Description("Resizes the width of columns or the height of rows in the active Excel worksheet.")]
    public class ResizeColumnsRowsInExcelWorksheetActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the target worksheet.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

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
                var resizeTarget = ResizeTarget.Get(context);
                var selectionRange = SelectionRange.Get(context);
                var resizeType = ResizeType.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                if (!(excelApp.ActiveSheet is Excel.Worksheet ws))
                    throw new InvalidOperationException("Active sheet is not a valid Excel worksheet.");

                switch (selectionRange)
                {
                    case ExcelColumnSelectionRangeEnum.AllAvailable:
                        {
                            switch (resizeTarget)
                            {
                                case ExcelColumnResizeTargetEnum.Columns:
                                    if (resizeType == ExcelColumnResizeTypeEnum.Autofit)
                                        ws.Columns.AutoFit();
                                    else
                                        ws.Columns.ColumnWidth = Width.Get(context);
                                    break;

                                case ExcelColumnResizeTargetEnum.Rows:
                                    if (resizeType == ExcelColumnResizeTypeEnum.Autofit)
                                        ws.Rows.AutoFit();
                                    else
                                        ws.Rows.RowHeight = Width.Get(context);
                                    break;

                                default:
                                    throw new ArgumentOutOfRangeException(nameof(resizeTarget));
                            }

                            break;
                        }

                    case ExcelColumnSelectionRangeEnum.Range:
                        {
                            var startCol = StartColumn.Get(context);
                            var endCol = EndColumn.Get(context);

                            var startColIndex = GetColumnIndex(startCol);
                            var endColIndex = GetColumnIndex(endCol);

                            var range = ws.Range[ws.Cells[1, startColIndex], ws.Cells[1, endColIndex]];

                            switch (resizeTarget)
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

                                default:
                                    throw new ArgumentOutOfRangeException(nameof(resizeTarget));
                            }

                            break;
                        }

                    case ExcelColumnSelectionRangeEnum.Single:
                        {
                            var colLetter = Column.Get(context);
                            var colIndex = GetColumnIndex(colLetter);

                            switch (resizeTarget)
                            {
                                case ExcelColumnResizeTargetEnum.Columns:
                                    if (resizeType == ExcelColumnResizeTypeEnum.Autofit)
                                        ws.Columns[colIndex].AutoFit();
                                    else
                                        ws.Columns[colIndex].ColumnWidth = Width.Get(context);
                                    break;

                                case ExcelColumnResizeTargetEnum.Rows:
                                    if (resizeType == ExcelColumnResizeTypeEnum.Autofit)
                                        ws.Rows[colIndex].AutoFit();
                                    else
                                        ws.Rows[colIndex].RowHeight = Width.Get(context);
                                    break;

                                default:
                                    throw new ArgumentOutOfRangeException(nameof(resizeTarget));
                            }

                            break;
                        }

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