using NodeLibrary.DataTableNodes.Enums;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Convert Data Table to CSV Text"), Description("Converts a data table into a CSV (comma-separated values) text representation.")]
[NodeMetadata(icon: "/assets/DataTable.svg")]
public class ConvertDataTableToCsvTextNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table variable to convert to CSV text.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Include Column Names"), Description("Specifies whether to include column names as the first row in the CSV output.")]
    public InArgument<bool> IncludeColumnNames { get; set; } = new InArgument<bool>(true);

    [DisplayName("Use Custom Columns Separator"), Description("Specifies whether to use a custom column separator instead of a predefined one.")]
    public InArgument<bool> UseCustomColumnsSeparator { get; set; } = new InArgument<bool>(false);

    [DisplayName("Separator"), Description("The column separator to use in the CSV text.")]
    public InArgument<CsvSeparatorEnum> Separator { get; set; } = new InArgument<CsvSeparatorEnum>(CsvSeparatorEnum.SystemDefault);

    [DisplayName("Custom Columns Separator"), Description("A custom string used to separate columns in the CSV output.")]
    [RenderIfCondition(nameof(UseCustomColumnsSeparator), true)]
    public InArgument<string> CustomColumnsSeparator { get; set; } = new InArgument<string>();

    [DisplayName("CSV Text Output"), Description("The CSV text representation of the data table.")]
    public OutArgument<string> CsvTextOutput { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var csvText = string.Empty;
        var status = "Operation completed successfully.";

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
                csvBuilder.AppendLine(string.Join(separator, row.ItemArray.Select(field => FormatField(field))));

            csvText = csvBuilder.ToString();
            status = "Successfully converted data table to CSV.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            csvText = string.Empty;
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error converting data table to CSV: {ex.Message}");
        }
        finally
        {
            CsvTextOutput.Set(context, csvText);
        }
    }

    private string GetSeparator(INodeContext context, bool useCustom)
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

    private string FormatField(object field)
    {
        var value = field?.ToString() ?? string.Empty;

        // If field contains comma, newline, or double quote, wrap in quotes
        if (value.Contains(",") || value.Contains("\n") || value.Contains("\""))
        {
            value = $"\"{value.Replace("\"", "\"\"")}\""; // Escape double quotes
        }

        return value;
    }
}
