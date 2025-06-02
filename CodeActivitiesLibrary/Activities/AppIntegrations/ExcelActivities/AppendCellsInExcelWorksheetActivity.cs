using System;
using System.Activities;
using System.ComponentModel;
using System.Data;
using CodeActivitiesLibrary.Extensions;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Append Range to Excel Worksheet")]
    [Description("Appends a range of data (e.g., from a DataTable) to the active worksheet of an Excel instance.")]
    public class AppendCellsInExcelWorksheetActivity : Extensions.BaseCodeActivity
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
        [DisplayName("Data Table")]
        [Description("The DataTable containing the data to be appended to the worksheet.")]
        public InArgument<DataTable> DataTable { get; set; }

        [Category("Input")]
        [DisplayName("Append Mode")]
        [Description("Specifies how to append data: To Named Cells or To Active Sheet.")]
        [DefaultValue(CellAppendModeEnum.ToActiveSheet)]
        public InArgument<CellAppendModeEnum> AppendMode { get; set; }

        [Category("Input")]
        [DisplayName("Name")]
        [Description("The name of the named range to which data should be appended.")]
        [RenderIfCondition(nameof(AppendMode), "ToNamedCells")]
        public InArgument<string> Name { get; set; }

        [Category("Input")]
        [DisplayName("First Row Has Headers")]
        [Description("If true, skips the first row of the DataTable as it contains headers.")]
        public InArgument<bool> FirstRowHasHeaders { get; set; }

        [Category("Input")]
        [DisplayName("Starting Column")]
        [Description("The column number where appending should start.")]
        [RenderIfCondition(nameof(AppendMode), "ToActiveSheet")]
        public InArgument<long> StartingColumn { get; set; }

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
                var dataTable = DataTable.Get(context);
                var appendMode = AppendMode.Get(context);

                if (excelApp?.ActiveWorkbook == null || excelApp.ActiveSheet == null)
                    throw new InvalidOperationException("Excel application or worksheet is not available.");

                if (!(excelApp.ActiveSheet is Excel.Worksheet worksheet))
                    throw new InvalidOperationException("Worksheet is not available.");

                var hasHeaders = FirstRowHasHeaders.Get(context);
                var startingColumn = StartingColumn.Get(context);

                switch (appendMode)
                {
                    case CellAppendModeEnum.ToNamedCells:
                        {
                            var name = Name.Get(context);

                            if (string.IsNullOrWhiteSpace(name))
                                throw new ArgumentException("Name cannot be empty when appending to named cells.");

                            var namedRange = worksheet.Names.Item(name).RefersToRange;
                            var rowCount = namedRange.Rows.Count;
                            var colCount = namedRange.Columns.Count;

                            for (var i = 0; i < dataTable.Rows.Count; i++)
                            {
                                var row = dataTable.Rows[i];

                                if (hasHeaders && i == 0)
                                    continue; // Skip headers if present

                                for (var j = 0; j < dataTable.Columns.Count; j++)
                                    namedRange.Cells[rowCount + i, j + 1] = row[j]?.ToString();
                            }

                            status += $" Appended data to named range '{name}'.";
                            break;
                        }

                    case CellAppendModeEnum.ToActiveSheet:
                        {
                            long startRow = worksheet.UsedRange.Rows.Count + 1; // Start after last used row

                            for (var i = 0; i < dataTable.Rows.Count; i++)
                            {
                                var row = dataTable.Rows[i];

                                if (hasHeaders && i == 0)
                                    continue; // Skip headers if present

                                for (var j = 0; j < dataTable.Columns.Count; j++)
                                    worksheet.Cells[startRow + i, startingColumn + j] = row[j]?.ToString();
                            }

                            status +=
                                $" Appended data to active sheet starting at row {startRow}, column {startingColumn}.";
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(appendMode));
                }
            }
            catch (Exception ex)
            {
                status = $"Error appending cells: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}