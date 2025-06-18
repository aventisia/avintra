using CodeActivitiesLibrary.DataTransformations.DataTableActivities.Enums;
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
    public class ReadFromCsvTextActivity : BaseCodeActivity
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
        [RenderIfCondition(nameof(ColumnsSeparator), ReadCsvSeparatorEnum.Custom)]
        public InArgument<string> CustomSeparator { get; set; }

        [DisplayName("Fixed Column Widths")]
        [Description("The fixed widths of columns when 'Columns Separator' is 'Fixed Column Widths'.")]
        [RenderIfCondition(nameof(ColumnsSeparator), ReadCsvSeparatorEnum.FixedColumnWidths)]
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
            DataTable resultTable = null;
            try
            {
                var csvText = CsvText.Get(context);
                var trimFields = TrimFields.Get(context);
                var firstLineContainsColumnNames = FirstLineContainsColumnNames.Get(context);
                var getFieldsAsText = GetCsvFieldsAsText.Get(context);
                var columnsSeparator = ColumnsSeparator.Get(context);
                var fixedColumnWidths = FixedColumnWidths.Get(context);

                if (string.IsNullOrWhiteSpace(csvText))
                    throw new ArgumentException("CSV text cannot be empty.");
                resultTable = ReadCsvToDataTable(csvText, trimFields, firstLineContainsColumnNames, getFieldsAsText,
                    columnsSeparator, CustomSeparator.Get(context), fixedColumnWidths);


                ResultDataTable.Set(context, resultTable);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Successfully generated the data table from CSV.");

            }

            catch (Exception ex)
            {
                ResultDataTable.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error generating data table: {ex.Message}");
            }
        }

        private static DataTable ReadCsvToDataTable(string csvText, bool trimFields, bool firstLineContainsColumnNames,
            bool getFieldsAsText, ReadCsvSeparatorEnum columnsSeparator, string customSeparator,
            string fixedColumnWidths)
        {
            using (var reader = new StringReader(csvText))
            {
                var table = new DataTable();
                if (firstLineContainsColumnNames)
                {
                    var headers = reader.ReadLine()
                        ?.Split(GetSeparator(columnsSeparator, customSeparator, fixedColumnWidths).ToCharArray());
                    if (headers == null || !headers.Any())
                        throw new ArgumentException("CSV text does not contain valid column names.");
                    foreach (var header in headers)
                        table.Columns.Add(header);
                }

                string line;
                while ((line = reader.ReadLine()) != null)
                {
                    if (string.IsNullOrWhiteSpace(line)) continue;
                    var values = ParseRow(line, columnsSeparator, customSeparator);
                    if (table.Columns.Count == 0)
                    {
                        for (var i = 0; i < values.Length; i++)
                            table.Columns.Add($"Column {i}");
                    }

                    var newRow = table.NewRow();
                    for (var i = 0; i < values.Length; i++)
                        if (getFieldsAsText)
                            newRow[i] = values[i];
                        else
                            newRow[i] = Convert.ChangeType(values[i], typeof(string));
                    table.Rows.Add(newRow);
                }

                if (!trimFields) return table;

                foreach (DataRow row in table.Rows)
                    for (var i = 0; i < row.ItemArray.Length; i++)
                        if (row[i] != null)
                            row[i] = ((string)row[i]).Trim();

                return table;
            }
        }

        private static string GetSeparator(ReadCsvSeparatorEnum separatorType, string customSeparator,
            string fixedColumnWidths)
        {
            switch (separatorType)
            {
                case ReadCsvSeparatorEnum.Predefined:
                    return ",";
                case ReadCsvSeparatorEnum.Custom:
                    return customSeparator;
                case ReadCsvSeparatorEnum.FixedColumnWidths:
                    return fixedColumnWidths;
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
                default:
                    throw new ArgumentOutOfRangeException(nameof(separatorType));
            }
        }
    }
}