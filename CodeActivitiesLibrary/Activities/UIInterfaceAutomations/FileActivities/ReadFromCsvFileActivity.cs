using System;
using System.Activities;
using System.ComponentModel;
using System.Data;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{

    [DisplayName("CSV File Reader")]
    [Description("Reads a CSV file from the specified path and returns the content as a DataTable.")]
    public class ReadFromCsvFileActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("CSV File Path")]
        [Description("The full path to the CSV file to be read.")]
        public InArgument<string> FilePath { get; set; }

        [Category("Input")]
        [DisplayName("Has Header Row")]
        [Description("Specify whether the CSV file includes a header row.")]
        [DefaultValue(true)]
        public InArgument<bool> HasHeader { get; set; } = new InArgument<bool>(true);

        [Category("Output")]
        [DisplayName("CSV Data Table")]
        [Description("The output DataTable containing the contents of the CSV file.")]
        public OutArgument<DataTable> OutputDataTable { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string filePath = FilePath.Get(context);
            bool hasHeader = HasHeader.Get(context);

            if (string.IsNullOrWhiteSpace(filePath))
            {
                throw new ArgumentException("CSV file path cannot be null or empty.");
            }

            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException("CSV file not found at the specified path.", filePath);
            }

            var dataTable = new DataTable();

            using (var reader = new StreamReader(filePath))
            {
                bool columnsInitialized = false;

                while (!reader.EndOfStream)
                {
                    var line = reader.ReadLine();
                    if (string.IsNullOrWhiteSpace(line))
                        continue;

                    var values = line.Split(',');

                    if (!columnsInitialized)
                    {
                        if (hasHeader)
                        {
                            foreach (var header in values)
                            {
                                dataTable.Columns.Add(header.Trim());
                            }
                        }
                        else
                        {
                            for (int i = 0; i < values.Length; i++)
                            {
                                dataTable.Columns.Add($"Column{i + 1}");
                            }

                            dataTable.Rows.Add(values);
                        }

                        columnsInitialized = true;
                        if (hasHeader)
                            continue; // Skip to next line since this one is the header
                    }
                    else
                    {
                        dataTable.Rows.Add(values);
                    }
                }
            }

            OutputDataTable.Set(context, dataTable);
        }
    }
}
