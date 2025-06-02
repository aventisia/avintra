using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    [DisplayName("CSV Writer Activity")]
    [Description("Writes the contents of a DataTable to a CSV file with options to append or overwrite.")]
    public class WriteToCsvFileActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("CSV Output File Path")]
        [Description("The full path where the CSV file will be written.")]
        public InArgument<string> FilePath { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Data Table to Write")]
        [Description("The DataTable whose contents should be written to the CSV file.")]
        public InArgument<DataTable> InputDataTable { get; set; }

        [Category("Input")]
        [DisplayName("Include Header Row")]
        [Description("Indicates whether column names should be included as the header row in the CSV.")]
        [DefaultValue(true)]
        public InArgument<bool> IncludeHeader { get; set; } = new InArgument<bool>(true);

        [Category("Input")]
        [DisplayName("Append To File")]
        [Description("Specify whether the data should be appended to the file if it exists.")]
        [DefaultValue(false)]
        public InArgument<bool> AppendToFile { get; set; } = new InArgument<bool>(false); 

        protected override void Execute(CodeActivityContext context)
        {
            string filePath = FilePath.Get(context);
            DataTable dataTable = InputDataTable.Get(context);
            bool includeHeader = IncludeHeader.Get(context);
            bool append = AppendToFile.Get(context);

            try
            {
                using (var writer = new StreamWriter(filePath, append))
                {
                    // Write header if needed and if file is new or not appending
                    if (includeHeader && (!append || new FileInfo(filePath).Length == 0))
                    {
                        List<string> headerValues = new List<string>();
                        foreach (DataColumn column in dataTable.Columns)
                        {
                            headerValues.Add(QuoteIfNeeded(column.ColumnName));
                        }
                        writer.WriteLine(string.Join(",", headerValues));
                    }

                    // Write data rows
                    foreach (DataRow row in dataTable.Rows)
                    {
                        List<string> rowValues = new List<string>();
                        foreach (var field in row.ItemArray)
                        {
                            rowValues.Add(QuoteIfNeeded(field?.ToString()));
                        }
                        writer.WriteLine(string.Join(",", rowValues));
                    }
                }

                StatusMessage.Set(context, "CSV file written successfully.");
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Failed to write CSV: {ex.Message}");
            }
        }

        private string QuoteIfNeeded(string input)
        {
            if (string.IsNullOrEmpty(input)) return "";

            if (input.Contains(",") || input.Contains("\"") || input.Contains("\n"))
            {
                input = input.Replace("\"", "\"\"");
                return $"\"{input}\"";
            }
            return input;
        }
    }

}