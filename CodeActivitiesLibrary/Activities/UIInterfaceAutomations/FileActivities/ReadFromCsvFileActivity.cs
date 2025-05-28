using System;
using System.Activities;
using System.ComponentModel;
using System.Data;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    //[DisplayName("Read From CSV File"), Description("Reads a CSV file into a data table.")]
    //public class ReadFromCsvFileActivity : CodeActivity
    //{
    //    [RequiredArgument, Category("Input"), Description("The full path of the CSV file to read.")]
    //    public InArgument<string> FilePath { get; set; }

    //    [Category("Output"), Description("Returns the data table containing the CSV data.")]
    //    public OutArgument<DataTable> DataTable { get; set; }

    //    [Category("Output"), Description("Returns the status message.")]
    //    public OutArgument<string> StatusMessage { get; set; }

    //    protected override void Execute(CodeActivityContext context)
    //    {
    //        var filePath = FilePath.Get(context);
    //        DataTable dataTable = null;
    //        var status = "";

    //        try
    //        {
    //            if (!File.Exists(filePath))
    //                throw new ArgumentException($"CSV file not found: {filePath}");

    //            using (TextFieldParser parser = new TextFieldParser(filePath))
    //            {
    //                parser.TextFieldType = FieldType.Delimited;
    //                parser.SetDelimiters(",");
    //                parser.HasFieldsEnclosedInQuotes = true;

    //                dataTable = new DataTable();

    //                // Read headers
    //                string[] headers = parser.ReadFields();
    //                foreach (var header in headers)
    //                {
    //                    dataTable.Columns.Add(header);
    //                }

    //                // Read rows
    //                while (!parser.EndOfData)
    //                {
    //                    string[] fields = parser.ReadFields();
    //                    dataTable.Rows.Add(fields);
    //                }
    //            }

    //            DataTable.Set(context, dataTable);
    //            status = "CSV file read successfully.";
    //        }
    //        catch (Exception ex)
    //        {
    //            status = $"Error reading CSV file: {ex.Message}";
    //        }

    //        StatusMessage.Set(context, status);
    //    }
    //}
}