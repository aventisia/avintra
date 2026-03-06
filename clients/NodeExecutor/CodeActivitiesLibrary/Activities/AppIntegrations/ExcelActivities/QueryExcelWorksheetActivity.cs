using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data;
using System.Data.OleDb;
using System.IO;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Query Excel Worksheet")]
    [Description("Executes a SQL query on an Excel worksheet and returns the result as a DataTable.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class QueryExcelWorksheetActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Excel File Path")]
        [Description("Full path of the Excel file (.xls or .xlsx).")]
        public InArgument<string> FilePath { get; set; }

        [RequiredArgument]
        [DisplayName("SQL Query")]
        [Description("SQL query to execute. Example: SELECT * FROM [Sheet1$] WHERE Salary > 50000")]
        public InArgument<string> SqlQuery { get; set; }

        [DisplayName("First Row As Header")]
        [Description("Specify whether first row contains column headers.")]
        [DefaultValue(true)]
        public InArgument<bool> FirstRowAsHeader { get; set; }

        [DisplayName("Result DataTable")]
        [Description("DataTable containing the query result.")]
        public OutArgument<DataTable> Result { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string tempFilePath = null;

            try
            {
                var filePath = FilePath.Get(context);
                var query = SqlQuery.Get(context);
                var hasHeader = FirstRowAsHeader.Get(context);

                if (string.IsNullOrWhiteSpace(filePath))
                    throw new ArgumentException("File path cannot be empty.");

                if (!File.Exists(filePath))
                    throw new FileNotFoundException("Excel file not found.", filePath);

                if (string.IsNullOrWhiteSpace(query))
                    throw new ArgumentException("SQL query cannot be empty.");

                if (IsFileLocked(filePath))
                {
                    tempFilePath = Path.Combine(Path.GetTempPath(),
                        Guid.NewGuid().ToString() + Path.GetExtension(filePath));

                    File.Copy(filePath, tempFilePath, true);
                    filePath = tempFilePath;
                }

                var dataTable = new DataTable();
                var extension = Path.GetExtension(filePath).ToLower();

                string extendedProperties = extension == ".xls"
                    ? $"Excel 8.0;HDR={(hasHeader ? "YES" : "NO")};IMEX=1"
                    : $"Excel 12.0 Xml;HDR={(hasHeader ? "YES" : "NO")};IMEX=1";

                string connectionString =
                    $"Provider=Microsoft.ACE.OLEDB.12.0;" +
                    $"Data Source={filePath};" +
                    $"Extended Properties=\"{extendedProperties}\";";

                using (var connection = new OleDbConnection(connectionString))
                {
                    connection.Open();

                    using (var command = new OleDbCommand(query, connection))
                    using (var adapter = new OleDbDataAdapter(command))
                    {
                        adapter.Fill(dataTable);
                    }
                }
                Result.Set(context, dataTable);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Query executed successfully. Rows fetched: {dataTable.Rows.Count}");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context,$"Error executing Excel query: {ex.Message}");
            }
            finally
            {
                if (!string.IsNullOrEmpty(tempFilePath) && File.Exists(tempFilePath))
                {
                    try { File.Delete(tempFilePath); }
                    catch
                    { /* ignore */ }
                }
            }
        }
        private static bool IsFileLocked(string filePath)
        {
            try
            {
                using (FileStream stream = File.Open(filePath, FileMode.Open, FileAccess.Read, FileShare.None))
                {
                    stream.Close();
                }
            }
            catch (IOException)
            {
                return true;
            }

            return false;
        }
    }

}