using NodeLibrary.FileNodes.Enums;

namespace NodeLibrary.FileNodes;

[DisplayName("Write to CSV File"), Description("Writes a data table, data row, or list to a CSV file.")]
[NodeMetadata(icon: "/assets/File.svg")]
public class WriteToCsvFileNode : BaseNode
{
    [DisplayName("Variable to Write"), Description("The data to write to the CSV file (DataTable, DataRow, or List).")]
    public required InArgument<object> VariableToWrite { get; set; }

    [DisplayName("File Path"), Description("The full path of the CSV file to write.")]
    public required InArgument<string> FilePath { get; set; }

    [DisplayName("Encoding"), Description("The encoding of the CSV file.")]
    public InArgument<CsvEncodingEnum> EncodingOption { get; set; } = new InArgument<CsvEncodingEnum>(CsvEncodingEnum.UTF8);

    [DisplayName("Use Custom Column Separator"), Description("Specifies whether to use a custom column separator.")]
    public InArgument<bool> UseCustomColumnSeparator { get; set; } = new InArgument<bool>(false);

    [DisplayName("Custom Column Separator"), Description("The custom delimiter used in the CSV file.")]
    [RenderIfCondition(nameof(UseCustomColumnSeparator), true)]
    public InArgument<string> CustomColumnSeparator { get; set; } = new InArgument<string>();

    [DisplayName("Predefined Separator"), Description("The predefined separator used in the CSV file (e.g., Comma, Tab).")]
    [RenderIfCondition(nameof(UseCustomColumnSeparator), false)]
    public InArgument<CsvPredefinedSeparatorEnum> PredefinedSeparator { get; set; } =
        new InArgument<CsvPredefinedSeparatorEnum>(CsvPredefinedSeparatorEnum.Comma);

    [DisplayName("If File Exists"), Description("Specifies how to handle existing files.")]
    public InArgument<FileExistOptionEnum> IfFileExists { get; set; } = new InArgument<FileExistOptionEnum>(FileExistOptionEnum.Overwrite);

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var variableToWrite = VariableToWrite.Get(context);
            var filePath = FilePath.Get(context);
            var encodingEnum = EncodingOption.Get(context); // FIXED name
            var useCustomColumnSeparator = UseCustomColumnSeparator.Get(context);
            var ifFileExists = IfFileExists.Get(context);

            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("File path cannot be empty.");

            if (variableToWrite == null)
                throw new ArgumentException("Variable to write cannot be null.");

            var separator = ",";
            if (useCustomColumnSeparator)
            {
                var customSep = CustomColumnSeparator.Get(context);
                if (!string.IsNullOrWhiteSpace(customSep))
                    separator = customSep;
            }
            else
            {
                var predefSep = PredefinedSeparator.Get(context);
                switch (predefSep)
                {
                    case CsvPredefinedSeparatorEnum.SystemDefault:
                        separator = ",";
                        break;
                    case CsvPredefinedSeparatorEnum.Comma:
                        separator = ",";
                        break;
                    case CsvPredefinedSeparatorEnum.Tab:
                        separator = "\t";
                        break;
                    case CsvPredefinedSeparatorEnum.Semicolon:
                        separator = ";";
                        break;
                    default:
                        throw new ArgumentOutOfRangeException();
                }
            }

            var fileMode = ifFileExists == FileExistOptionEnum.Append
                ? FileMode.Append
                : FileMode.Create;

            var encoding = GetEncoding(encodingEnum);

            using (var fileStream = new FileStream(filePath, fileMode, FileAccess.Write, FileShare.None))
            using (var writer = new StreamWriter(fileStream, encoding))
            {
                if (variableToWrite is DataTable dataTable)
                    WriteDataTable(writer, dataTable, separator);
                else if (variableToWrite is DataRow dataRow)
                    WriteDataRow(writer, dataRow, separator);
                else if (variableToWrite is System.Collections.IEnumerable enumerable)
                    WriteEnumerable(writer, enumerable, separator);
                else
                    throw new ArgumentException(
                        "Unsupported type for 'Variable to Write'. Supported types: DataTable, DataRow, IEnumerable.");
            }

            status += $" Successfully wrote data to '{filePath}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error writing to CSV file: {ex.Message}";
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
    }

    private static void WriteDataTable(StreamWriter writer, DataTable dataTable, string separator)
    {
        // Write headers
        for (var i = 0; i < dataTable.Columns.Count; i++)
        {
            writer.Write(dataTable.Columns[i].ColumnName);
            if (i < dataTable.Columns.Count - 1)
                writer.Write(separator);
        }

        writer.WriteLine();

        // Write rows
        foreach (DataRow row in dataTable.Rows)
        {
            for (var i = 0; i < dataTable.Columns.Count; i++)
            {
                writer.Write((row[i] ?? "").ToString());
                if (i < dataTable.Columns.Count - 1)
                    writer.Write(separator);
            }

            writer.WriteLine();
        }
    }

    private static void WriteDataRow(StreamWriter writer, DataRow dataRow, string separator)
    {
        for (var i = 0; i < dataRow.ItemArray.Length; i++)
        {
            writer.Write((dataRow[i] ?? "").ToString());
            if (i < dataRow.ItemArray.Length - 1)
                writer.Write(separator);
        }

        writer.WriteLine();
    }

    private static void WriteEnumerable(StreamWriter writer, System.Collections.IEnumerable enumerable,
        string separator)
    {
        foreach (var item in enumerable)
            writer.WriteLine(item?.ToString() ?? "");
    }

    private static Encoding GetEncoding(CsvEncodingEnum encoding)
    {
        switch (encoding)
        {
            case CsvEncodingEnum.SystemDefault:
                return Encoding.Default;
            case CsvEncodingEnum.UTF8:
                return Encoding.UTF8;
            case CsvEncodingEnum.Unicode:
                return Encoding.Unicode;
            case CsvEncodingEnum.BigEndianUnicode:
                return Encoding.BigEndianUnicode;
            case CsvEncodingEnum.UTF8NoBOM:
                return new UTF8Encoding(false);
            case CsvEncodingEnum.ASCII:
                return Encoding.ASCII;
            default:
                throw new ArgumentOutOfRangeException(nameof(encoding), encoding, null);
        }
    }

    public enum CsvPredefinedSeparatorEnum
    {
        [Display(Name = "System Default", Description = "Uses a System Default as the separator.")]
        SystemDefault,

        [Display(Name = "Comma", Description = "Uses a comma (,) as the separator.")]
        Comma,

        [Display(Name = "Tab", Description = "Uses a tab character as the separator.")]
        Tab,

        [Display(Name = "Semicolon", Description = "Uses a semicolon (;) as the separator.")]
        Semicolon
    }
    public enum FileExistOptionEnum
    {
        [Display(Name = "Overwrite Existing Content", Description = "Overwrites the existing content of the file.")]
        Overwrite,

        [Display(Name = "Append Content", Description = "Appends content to the end of the existing file.")]
        Append
    }
}
