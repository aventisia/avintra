using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.FileActivities.Enums;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.IO;
using System.Text;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.FileActivities
{
    [DisplayName("Read from CSV File")]
    [Description("Reads a CSV file into a DataTable.")]
    public class ReadFromCsvFileActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("File Path")]
        [Description("The full path of the CSV file to read.")]
        public InArgument<string> FilePath { get; set; }


        [DisplayName("Encoding")]
        [Description("The encoding of the CSV file.")]
        [DefaultValue(CsvEncodingEnum.UTF8)]
        public InArgument<CsvEncodingEnum> EncodingOption { get; set; }


        [DisplayName("Trim Fields")]
        [Description("Specifies whether to trim whitespace from the fields.")]
        public InArgument<bool> TrimFields { get; set; } = new InArgument<bool>(true);


        [DisplayName("First Line Contains Column Names")]
        [Description("Specifies whether the first row of the CSV file contains column names.")]
        public InArgument<bool> FirstLineContainsColumnNames { get; set; } = new InArgument<bool>(true);


        [DisplayName("Columns Separator")]
        [Description("The type of separator used in the CSV file (Predefined or Custom).")]
        public InArgument<SeparatorTypeEnum> ColumnsSeparatorType { get; set; } =
            new InArgument<SeparatorTypeEnum>(SeparatorTypeEnum.Predefined);


        [DisplayName("Predefined Separator")]
        [Description("The predefined delimiter used in the CSV file (e.g., Comma, Tab).")]
        [RenderIfCondition(nameof(ColumnsSeparatorType), SeparatorTypeEnum.Predefined)]
        public InArgument<PredefinedSeparatorEnum> PredefinedSeparator { get; set; } =
            new InArgument<PredefinedSeparatorEnum>(PredefinedSeparatorEnum.Comma);


        [DisplayName("Custom Separator")]
        [Description("The custom delimiter used in the CSV file.")]
        [RenderIfCondition(nameof(ColumnsSeparatorType), SeparatorTypeEnum.Custom)]
        public InArgument<string> CustomSeparator { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("CSV Table")]
        [Description("The contents of the CSV file as a DataTable.")]
        public OutArgument<DataTable> CsvTable { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------

        protected override void Execute(CodeActivityContext context)
        {

            try
            {
                var filePath = FilePath.Get(context);
                var encodingEnum = EncodingOption.Get(context);
                var trimFields = TrimFields.Get(context);
                var firstLineContainsColumnNames = FirstLineContainsColumnNames.Get(context);
                var columnsSeparatorType = ColumnsSeparatorType.Get(context);

                if (string.IsNullOrWhiteSpace(filePath))
                    throw new ArgumentException("File path cannot be empty.");

                var separator = ",";
                if (columnsSeparatorType == SeparatorTypeEnum.Predefined)
                {
                    var predefSep = PredefinedSeparator.Get(context);
                    switch (predefSep)
                    {
                        case PredefinedSeparatorEnum.Comma:
                            separator = ",";
                            break;
                        case PredefinedSeparatorEnum.Tab:
                            separator = "\t";
                            break;
                        case PredefinedSeparatorEnum.Semicolon:
                            separator = ";";
                            break;
                        default:
                            throw new ArgumentOutOfRangeException();
                    }
                }
                else if (columnsSeparatorType == SeparatorTypeEnum.Custom)
                {
                    var customSep = CustomSeparator.Get(context);
                    if (!string.IsNullOrWhiteSpace(customSep))
                        separator = customSep;
                    else
                        throw new ArgumentException("Custom separator cannot be empty.");
                }

                using (var reader = new StreamReader(filePath, GetEncoding(encodingEnum)))
                using (var csvReader = new CsvReader(reader, separator)) // Fully qualify if needed
                {
                    var dataTable = new DataTable();

                    string line;
                    var lineNumber = 0;

                    while ((line = csvReader.ReadLine()) != null)
                    {
                        if (firstLineContainsColumnNames && lineNumber == 0)
                        {
                            // Read column names
                            var columns = line.Split(new[] { separator }, StringSplitOptions.None);
                            foreach (var column in columns)
                            {
                                dataTable.Columns.Add(trimFields ? column.Trim() : column);
                            }
                        }
                        else
                        {
                            // Read data rows
                            var values = line.Split(new[] { separator }, StringSplitOptions.None);
                            var row = dataTable.NewRow();
                            for (var i = 0; i < values.Length; i++)
                            {
                                row[i] = trimFields ? values[i].Trim() : values[i];
                            }
                            dataTable.Rows.Add(row);
                        }

                        lineNumber++;
                    }

                    CsvTable.Set(context, dataTable);
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $" Successfully read data from '{filePath}'.");
                }
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error reading CSV file: {ex.Message}");
            }
        }

        // ----------------------
        // Helper Methods
        // ----------------------

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

        public enum SeparatorTypeEnum
        {
            [Display(Name = "Predefined", Description = "Use one of the built-in predefined separators.")]
            Predefined,

            [Display(Name = "Custom", Description = "Define a custom separator character or string.")]
            Custom,

        }
        public enum PredefinedSeparatorEnum
        {
            [Display(Name = "Comma", Description = "Uses a comma (,) as the separator.")]
            Comma,

            [Display(Name = "Tab", Description = "Uses a tab character as the separator.")]
            Tab,

            [Display(Name = "Semicolon", Description = "Uses a semicolon (;) as the separator.")]
            Semicolon
        }

        // ----------------------
        // Helper Class
        // ----------------------

        internal class CsvReader : IDisposable
        {
            private readonly StreamReader _reader;
            private readonly string _separator;

            public CsvReader(StreamReader reader, string separator)
            {
                _reader = reader ?? throw new ArgumentNullException(nameof(reader));
                _separator = separator ?? throw new ArgumentNullException(nameof(separator));
            }

            public string ReadLine()
            {
                return _reader.ReadLine();
            }

            // Forward Dispose to the StreamReader
            public void Dispose()
            {
                _reader.Dispose();
            }
        }
    }
}