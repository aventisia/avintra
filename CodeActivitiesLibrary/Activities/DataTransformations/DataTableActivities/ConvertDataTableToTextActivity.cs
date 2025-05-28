using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Text;


namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Convert Data Table to CSV Text")]
    [Description("Converts a data table into a CSV (comma-separated values) text representation.")]
    public class ConvertDataTableToTextActivity : CodeActivity
    {
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var dataTable = DataTable.Get(context);
                var includeColumnNames = IncludeColumnNames.Get(context);
                var useCustomSeparator = UseCustomColumnsSeparator.Get(context);
                var separatorChar = GetSeparatorCharacter(context, useCustomSeparator);

                if (dataTable == null)
                    throw new ArgumentException("Data table cannot be null.");

                // Build CSV text from DataTable
                var csv = new StringBuilder();

                // Add column headers
                if (includeColumnNames)
                    csv.AppendLine(string.Join(separatorChar, dataTable.Columns
                        .OfType<DataColumn>()
                        .Select(c => c.ColumnName)));

                // Add rows
                foreach (DataRow row in dataTable.Rows)
                    csv.AppendLine(string.Join(separatorChar, row.ItemArray.Select(field => field.ToString())));


                status += $" Converted data table '{dataTable.TableName}' to CSV format.";
            }
            catch (Exception ex)
            {
                status = $"Error converting data table to CSV: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        private string GetSeparatorCharacter(CodeActivityContext context, bool useCustom)
        {
            if (!useCustom) return GetSystemDefaultSeparator();

            var customSep = CustomColumnsSeparator.Get(context);
            if (string.IsNullOrWhiteSpace(customSep))
                return GetSystemDefaultSeparator();

            return customSep;
        }

        private string GetSystemDefaultSeparator()
        {
            // Use system-specific separator based on current culture
            return CultureInfo.CurrentCulture.TextInfo.ListSeparator;
        }

        #region Inputs

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Data Table")]
        [Description("The data table variable to convert to CSV text.")]
        public InArgument<DataTable> DataTable { get; set; }

        [Category("Advanced")]
        [DisplayName("Include Column Names")]
        [Description("Specifies whether to include column names as the first row in the CSV output.")]
        [DefaultValue(false)]
        public InArgument<bool> IncludeColumnNames { get; set; }

        [Category("Advanced")]
        [DisplayName("Use Custom Column Separator")]
        [Description("Specifies whether to use a custom column separator instead of a predefined one.")]
        [DefaultValue(false)]
        public InArgument<bool> UseCustomColumnsSeparator { get; set; }

        [Category("Advanced")]
        [DisplayName("Separator")]
        [Description("The column separator to use in the CSV text.")]
        [DefaultValue(ColumnSeparatorEnum.SystemDefault)]
        public InArgument<ColumnSeparatorEnum> Separator { get; set; }

        [Category("Advanced")]
        [DisplayName("Custom Columns Separator")]
        [Description("A custom string used to separate columns in the CSV output.")]
        public InArgument<string> CustomColumnsSeparator { get; set; }

        #endregion

        #region Outputs

        [Category("Output")]
        [DisplayName("CSV Text Output")]
        [Description("The CSV text representation of the data table.")]
        public OutArgument<string> OCsvTextOutput { get; set; }

        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion
    }

    public enum ColumnSeparatorEnum
    {
        [Display(Name = "System Default", Description = "Uses the system's default separator.")]
        SystemDefault,

        [Display(Name = "Comma", Description = "Uses ',' as column separator.")]
        Comma,

        [Display(Name = "Semicolon", Description = "Uses ';' as column separator.")]
        Semicolon,

        [Display(Name = "Tab", Description = "Uses tab character as column separator.")]
        Tab
    }
}