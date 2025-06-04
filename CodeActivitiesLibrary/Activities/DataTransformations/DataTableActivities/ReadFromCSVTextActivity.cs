using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data;
using System.IO;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Read From CSV Text")]
    [Description("Generates a data table from a CSV text.")]
    public sealed class ReadFromCsvTextActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("CSV Text")]
        [Description("The CSV text to parse.")]
        public InArgument<string> CsvText { get; set; }


        [DisplayName("Trim Fields")]
        [Description("If true, trims whitespace from fields.")]
        public InArgument<bool> TrimFields { get; set; }


        [DisplayName("First Line Contains Column Names")]
        [Description("If true, treats the first line as column names.")]
        public InArgument<bool> FirstLineContainsColumnNames { get; set; }


        [DisplayName("Get CSV Fields as Text")]
        [Description("If true, converts all fields to text.")]
        public InArgument<bool> GetCsvFieldsAsText { get; set; }


        [DisplayName("Columns Separator")]
        [Description("Specifies how columns are separated in the CSV text.")]
        [DefaultValue(ReadCsvSeparatorEnum.Predefined)]
        public InArgument<ReadCsvSeparatorEnum> ColumnsSeparator { get; set; }


        [DisplayName("Custom Separator")]
        [Description("The custom separator to use when 'Columns Separator' is 'Custom'.")]
        [RenderIfCondition(nameof(ColumnsSeparator), "Custom")]
        public InArgument<string> CustomSeparator { get; set; }


        [DisplayName("Fixed Column Widths")]
        [Description("The fixed widths of columns when 'Columns Separator' is 'Fixed Column Widths'.")]
        [RenderIfCondition(nameof(ColumnsSeparator), "FixedColumnWidths")]
        public InArgument<string> FixedColumnWidths { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Result Data Table")]
        [Description("The generated data table.")]
        public OutArgument<DataTable> ResultDataTable { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            DataTable resultTable = null;

            try
            {
                var csvText = CsvText.Get(context);
                var trimFields = TrimFields.Get(context);
                var firstLineContainsColumnNames = FirstLineContainsColumnNames.Get(context);
                var getFieldsAsText = GetCsvFieldsAsText.Get(context);
                var columnsSeparator = ColumnsSeparator.Get(context);

                if (string.IsNullOrWhiteSpace(csvText))
                    throw new ArgumentException("CSV text cannot be empty.");

                using (var reader = new StringReader(csvText))
                {
                    resultTable = new DataTable();

                    string[] headers = null;
                    if (firstLineContainsColumnNames)
                    {
                        headers = reader.ReadLine()
                            ?.Split(GetSeparator(columnsSeparator, CustomSeparator.Get(context)).ToCharArray());

                        if (headers == null || !headers.Any())
                            throw new ArgumentException("CSV text does not contain valid column names.");
                    }

                    while (reader.Peek() > -1)
                    {
                        var row = reader.ReadLine();
                        if (string.IsNullOrWhiteSpace(row)) continue;

                        var values = ParseRow(row, columnsSeparator, CustomSeparator.Get(context));

                        if (resultTable.Columns.Count == 0 && headers != null)
                        {
                            foreach (var header in headers)
                            {
                                resultTable.Columns.Add(header);
                            }
                        }

                        if (values.Length <= 0) continue;
                        var newRow = resultTable.NewRow();
                        for (var i = 0; i < values.Length; i++)
                        {
                            if (getFieldsAsText)
                                newRow[i] = values[i];
                            else
                                newRow[i] = Convert.ChangeType(values[i], typeof(string));
                        }

                        resultTable.Rows.Add(newRow);
                    }

                    if (trimFields)
                    {
                        foreach (DataRow row in resultTable.Rows)
                        {
                            for (var i = 0; i < row.ItemArray.Length; i++)
                            {
                                if (row[i] != null)
                                    row[i] = ((string)row[i]).Trim();
                            }
                        }
                    }
                }

                status = $"Successfully generated data table with {resultTable.Rows.Count} rows.";
            }
            catch (Exception ex)
            {
                status = $"Error generating data table: {ex.Message}";
            }

            ResultDataTable.Set(context, resultTable);
            StatusMessage.Set(context, status);
        }

        private static string GetSeparator(ReadCsvSeparatorEnum separatorType, string customSeparator)
        {
            switch (separatorType)
            {
                case ReadCsvSeparatorEnum.Predefined:
                    return ",";
                case ReadCsvSeparatorEnum.Custom:
                    return customSeparator;
                case ReadCsvSeparatorEnum.FixedColumnWidths:
                    throw new NotSupportedException("Fixed column widths not supported in this implementation.");
                default:
                    throw new ArgumentOutOfRangeException(nameof(separatorType));
            }
        }

        private static string[] ParseRow(string row, ReadCsvSeparatorEnum separatorType, string customSeparator)
        {
            switch (separatorType)
            {
                case ReadCsvSeparatorEnum.Predefined:
                    return row.Split(',');
                case ReadCsvSeparatorEnum.Custom:
                    return row.Split(customSeparator.ToCharArray());
                case ReadCsvSeparatorEnum.FixedColumnWidths:
                    throw new NotSupportedException("Fixed column widths not supported in this implementation.");
                default:
                    throw new ArgumentOutOfRangeException(nameof(separatorType));
            }
        }
    }
}