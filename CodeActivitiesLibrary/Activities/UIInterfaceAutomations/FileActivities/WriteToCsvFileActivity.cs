using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities.Enums;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data;
using System.IO;
using System.Text;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    [DisplayName("Write to CSV File")]
    [Description("Writes a data table, data row, or list to a CSV file.")]
    public class WriteToCsvFileActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Variable to Write")]
        [Description("The data to write to the CSV file (DataTable, DataRow, or List).")]
        public InArgument<object> VariableToWrite { get; set; }

        [RequiredArgument]
        [DisplayName("File Path")]
        [Description("The full path of the CSV file to write.")]
        public InArgument<string> FilePath { get; set; }


        [DisplayName("Encoding")]
        [Description("The encoding of the CSV file.")]
        [DefaultValue(CsvEncodingEnum.UTF8)]
        public InArgument<CsvEncodingEnum> EncodingOption { get; set; } // Renamed to avoid conflict


        [DisplayName("Use Custom Column Separator")]
        [Description("Specifies whether to use a custom column separator.")]
        public InArgument<bool> UseCustomColumnSeparator { get; set; } = new InArgument<bool>(false);


        [DisplayName("Custom Column Separator")]
        [Description("The custom delimiter used in the CSV file.")]
        [RenderIfCondition(nameof(UseCustomColumnSeparator), "True")]
        public InArgument<string> CustomColumnSeparator { get; set; }


        [DisplayName("Predefined Separator")]
        [Description("The predefined separator used in the CSV file (e.g., Comma, Tab).")]
        [RenderIfCondition(nameof(UseCustomColumnSeparator), "False")]
        public InArgument<CsvPredefinedSeparatorEnum> PredefinedSeparator { get; set; } =
            new InArgument<CsvPredefinedSeparatorEnum>(CsvPredefinedSeparatorEnum.Comma);


        [DisplayName("If File Exists")]
        [Description("Specifies how to handle existing files.")]
        [DefaultValue(FileExistOptionEnum.Overwrite)]
        public InArgument<FileExistOptionEnum> IfFileExists { get; set; }

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
                var variableToWrite = VariableToWrite.Get(context);
                var filePath = FilePath.Get(context);
                var encodingEnum = EncodingOption.Get(context); // FIXED name
                var useCustomColumnSeparator = UseCustomColumnSeparator.Get(context);
                var ifFileExists = IfFileExists.Get(context);

                if (string.IsNullOrWhiteSpace(filePath))
                    throw new ArgumentException("File path cannot be empty.");

                if (variableToWrite == null)
                    throw new ArgumentException("Variable to write cannot be null.");

                string separator = ",";
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

                FileMode mode = ifFileExists == FileExistOptionEnum.Append
                    ? FileMode.Append
                    : FileMode.Create;

                using (var writer = new StreamWriter(filePath, false, GetEncoding(encodingEnum)))
                {
                    if (variableToWrite is DataTable dataTable)
                    {
                        WriteDataTable(writer, dataTable, separator);
                    }
                    else if (variableToWrite is DataRow dataRow)
                    {
                        WriteDataRow(writer, dataRow, separator);
                    }
                    else if (variableToWrite is System.Collections.IEnumerable enumerable)
                    {
                        WriteEnumerable(writer, enumerable, separator);
                    }
                    else
                    {
                        throw new ArgumentException("Unsupported type for 'Variable to Write'. Supported types: DataTable, DataRow, IEnumerable.");
                    }
                }

                status += $" Successfully wrote data to '{filePath}'.";
            }
            catch (Exception ex)
            {
                status = $"Error writing to CSV file: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        // ----------------------
        // Helper Methods
        // ----------------------

        private static void WriteDataTable(StreamWriter writer, DataTable dataTable, string separator)
        {
            for (int i = 0; i < dataTable.Columns.Count; i++)
            {
                writer.Write(dataTable.Columns[i].ColumnName);
                if (i < dataTable.Columns.Count - 1)
                    writer.Write(separator);
            }
            writer.WriteLine();

            foreach (DataRow row in dataTable.Rows)
            {
                for (int i = 0; i < dataTable.Columns.Count; i++)
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
            for (int i = 0; i < dataRow.ItemArray.Length; i++)
            {
                writer.Write((dataRow[i] ?? "").ToString());
                if (i < dataRow.ItemArray.Length - 1)
                    writer.Write(separator);
            }
            writer.WriteLine();
        }

        private static void WriteEnumerable(StreamWriter writer, System.Collections.IEnumerable enumerable, string separator)
        {
            foreach (var item in enumerable)
            {
                writer.WriteLine(item?.ToString() ?? "");
            }
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

        // ----------------------
        // Enums
        // ----------------------

        public enum CsvPredefinedSeparatorEnum
        {
            [Description("Comma")]
            Comma,
            [Description("Tab")]
            Tab,
            [Description("Semicolon")]
            Semicolon
        }

        public enum FileExistOptionEnum
        {
            [Description("Overwrite existing content")]
            Overwrite,
            [Description("Append Content")]
            Append
        }
    }
}
