using CodeActivitiesLibrary.DataTransformations.DataTableActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Text;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Convert Data Table to CSV Text")]
    [Description("Converts a data table into a CSV (comma-separated values) text representation.")]
    public class ConvertDataTableToTextActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Data Table")]
        [Description("The data table variable to convert to CSV text.")]
        public InArgument<DataTable> DataTable { get; set; }


        [DisplayName("Include Column Names")]
        [Description("Specifies whether to include column names as the first row in the CSV output.")]
        [DefaultValue(true)]
        public InArgument<bool> IncludeColumnNames { get; set; }


        [DisplayName("Use Custom Columns Separator")]
        [Description("Specifies whether to use a custom column separator instead of a predefined one.")]
        [DefaultValue(false)]
        public InArgument<bool> UseCustomColumnsSeparator { get; set; }


        [DisplayName("Separator")]
        [Description("The column separator to use in the CSV text.")]
        [DefaultValue(CsvSeparatorEnum.SystemDefault)]
        public InArgument<CsvSeparatorEnum> Separator { get; set; }


        [DisplayName("Custom Columns Separator")]
        [Description("A custom string used to separate columns in the CSV output.")]
        [RenderIfCondition(nameof(UseCustomColumnsSeparator), true)]
        public InArgument<string> CustomColumnsSeparator { get; set; }

        [DisplayName("CSV Text Output")]
        [Description("The CSV text representation of the data table.")]
        public OutArgument<string> CsvTextOutput { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var csvText = string.Empty;

            try
            {
                var dataTable = DataTable.Get(context);
                var includeColumnNames = IncludeColumnNames.Get(context);
                var useCustomSeparator = UseCustomColumnsSeparator.Get(context);

                if (dataTable == null)
                    throw new ArgumentException("Data table cannot be null.");

                // Determine separator
                var separator = GetSeparator(context, useCustomSeparator);

                // Build CSV text from DataTable
                var csvBuilder = new StringBuilder();

                // Add column headers
                if (includeColumnNames)
                    csvBuilder.AppendLine(string.Join(separator,
                        dataTable.Columns.Cast<DataColumn>().Select(c => c.ColumnName)));

                // Add rows
                foreach (DataRow row in dataTable.Rows)
                    csvBuilder.AppendLine(string.Join(separator, row.ItemArray.Select(field => field.ToString())));

                csvText = csvBuilder.ToString();
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Successfully converted data table to CSV.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error converting data table to CSV: {ex.Message}");
            }
        }

        private string GetSeparator(CodeActivityContext context, bool useCustom)
        {
            if (!useCustom)
            {
                var separatorEnum = Separator.Get(context);
                switch (separatorEnum)
                {
                    case CsvSeparatorEnum.Comma:
                        return ",";
                    case CsvSeparatorEnum.Semicolon:
                        return ";";
                    case CsvSeparatorEnum.Tab:
                        return "\t";
                    default:
                        return CultureInfo.CurrentCulture.TextInfo.ListSeparator;
                }
            }
            else
            {
                var customSep = CustomColumnsSeparator.Get(context);
                if (string.IsNullOrWhiteSpace(customSep))
                    throw new ArgumentException(
                        "Custom separator cannot be empty when 'Use Custom Columns Separator' is enabled.");

                return customSep;
            }
        }
    }
}