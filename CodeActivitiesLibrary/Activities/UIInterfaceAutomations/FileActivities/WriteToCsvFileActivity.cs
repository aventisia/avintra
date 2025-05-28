using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    //[DisplayName("Write To CSV File"), Description("Writes a data table, data row, or list to a CSV file.")]
    //public class WriteToCsvFileActivity : CodeActivity
    //{
    //    [RequiredArgument, Category("Input"), Description("The full path of the CSV file to write to.")]
    //    public InArgument<string> FilePath { get; set; }

    //    [RequiredArgument, Category("Input"), Description("The data to write to the CSV file.")]
    //    public InArgument<object> Data { get; set; }

    //    [Category("Output"), Description("Returns the status message.")]
    //    public OutArgument<string> StatusMessage { get; set; }

    //    protected override void Execute(CodeActivityContext context)
    //    {
    //        var filePath = FilePath.Get(context);
    //        var data = Data.Get(context);
    //        var status = "";

    //        try
    //        {
    //            if (string.IsNullOrWhiteSpace(filePath))
    //                throw new ArgumentException("FilePath cannot be empty.");

    //            var dir = Path.GetDirectoryName(filePath);
    //            if (!Directory.Exists(dir))
    //            {
    //                Directory.CreateDirectory(dir);
    //            }

    //            using (TextFieldWriter writer = new TextFieldWriter(filePath))
    //            {
    //                if (data is DataTable dataTable)
    //                {
    //                    foreach (DataRow row in dataTable.Rows)
    //                    {
    //                        writer.WriteLine(row.ItemArray);
    //                    }
    //                }
    //                else if (data is DataRow dataRow)
    //                {
    //                    writer.WriteLine(dataRow.ItemArray);
    //                }
    //                else if (data is IEnumerable<object> dataList)
    //                {
    //                    foreach (var item in dataList)
    //                    {
    //                        writer.WriteLine(item.ToString());
    //                    }
    //                }
    //                else
    //                {
    //                    throw new ArgumentException("Unsupported data type.");
    //                }
    //            }

    //            status = $"Data written to CSV file at {filePath}";
    //        }
    //        catch (Exception ex)
    //        {
    //            status = $"Error writing to CSV file: {ex.Message}";
    //        }

    //        StatusMessage.Set(context, status);
    //    }
    //}
}