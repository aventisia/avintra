using System;
using System.Activities;
using System.ComponentModel;
using System.Data;
using System.IO;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    //[DisplayName("Read From CSV Text")]
    //[Description("Generates a data table from a CSV text.")]
    //public sealed class ReadFromCsvTextActivity : CodeActivity
    //{
    //    [Category("Input")]
    //    [DisplayName("CSV Text")]
    //    [Description("The CSV text to parse.")]
    //    public InArgument<string> CsvText { get; set; }

    //    [Category("Output")]
    //    [DisplayName("Result Data Table")]
    //    [Description("The generated data table.")]
    //    public OutArgument<DataTable> ResultDataTable { get; set; }

    //    [Category("Output")]
    //    [Description("Returns the result status message.")]
    //    public OutArgument<string> StatusMessage { get; set; }

    //    protected override void Execute(CodeActivityContext context)
    //    {
    //        var csvText = context.GetValue(CsvText);

    //        if (string.IsNullOrEmpty(csvText))
    //        {
    //            context.SetValue(StatusMessage, "Error: CSV text is required.");
    //            return;
    //        }

    //        try
    //        {
    //            using (var reader = new StringReader(csvText))
    //            {
    //                var dataTable = new DataTable();
    //                var headers = reader.ReadLine()?.Split(',');
    //                if (headers != null)
    //                {
    //                    foreach (var header in headers) dataTable.Columns.Add(header);

    //                    while (!reader.EndOfStream)
    //                    {
    //                        var row = reader.ReadLine().Split(',');
    //                        if (row.Length == headers.Length) dataTable.Rows.Add(row);
    //                    }
    //                }

    //                context.SetValue(ResultDataTable, dataTable);
    //                context.SetValue(StatusMessage, "Data table generated from CSV successfully.");
    //            }
    //        }
    //        catch (Exception ex)
    //        {
    //            context.SetValue(StatusMessage, $"Error: {ex.Message}");
    //        }
    //    }
    //}
}