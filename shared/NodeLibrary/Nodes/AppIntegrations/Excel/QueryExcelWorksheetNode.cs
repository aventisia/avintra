using System.Data.OleDb;

namespace NodeLibrary.ExcelNodes;

[DisplayName("Query Excel Worksheet"), Description("Executes a SQL query against an Excel worksheet using OLE DB and returns the result as a DataTable.")]
[NodeMetadata(icon: "/assets/Excel.svg")]
public class QueryExcelWorksheetNode : BaseNode
{
    [DisplayName("Workbook Path"), Description("The file path of the Excel workbook to query.")]
    public required InArgument<string> WorkbookPath { get; set; }

    [DisplayName("SQL Query"), Description("The SQL query to execute against the Excel file. Use worksheet names like [Sheet1$] as table names.")]
    public required InArgument<string> SqlQuery { get; set; }

    [DisplayName("Has Headers"), Description("Whether the first row contains column headers.")]
    public InArgument<bool> HasHeaders { get; set; } = new InArgument<bool>(true);

    [DisplayName("Query Result"), Description("The result of the query as a DataTable.")]
    public OutArgument<DataTable> QueryResult { get; set; } = new OutArgument<DataTable>();

    [DisplayName("Row Count"), Description("The number of rows returned by the query.")]
    public OutArgument<int> RowCount { get; set; } = new OutArgument<int>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var workbookPath = WorkbookPath.Get(context);
            var sqlQuery = SqlQuery.Get(context);
            var hasHeaders = HasHeaders.Get(context);

            if (string.IsNullOrWhiteSpace(workbookPath))
                throw new ArgumentException("Workbook path cannot be empty.");

            if (string.IsNullOrWhiteSpace(sqlQuery))
                throw new ArgumentException("SQL query cannot be empty.");

            if (!System.IO.File.Exists(workbookPath))
                throw new System.IO.FileNotFoundException($"Workbook not found at: {workbookPath}");

            string hdr = hasHeaders ? "Yes" : "No";
            string extension = System.IO.Path.GetExtension(workbookPath).ToLowerInvariant();

            string connectionString = extension switch
            {
                ".xlsx" or ".xlsm" => $"Provider=Microsoft.ACE.OLEDB.12.0;Data Source={workbookPath};Extended Properties=\"Excel 12.0 Xml;HDR={hdr};IMEX=1\"",
                ".xls" => $"Provider=Microsoft.ACE.OLEDB.12.0;Data Source={workbookPath};Extended Properties=\"Excel 8.0;HDR={hdr};IMEX=1\"",
                _ => throw new NotSupportedException($"Unsupported file extension: {extension}")
            };

            var dataTable = new DataTable();

            using (var connection = new OleDbConnection(connectionString))
            {
                connection.Open();
                using var command = new OleDbCommand(sqlQuery, connection);
                using var adapter = new OleDbDataAdapter(command);
                adapter.Fill(dataTable);
            }

            QueryResult.Set(context, dataTable);
            RowCount.Set(context, dataTable.Rows.Count);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Query executed successfully. Returned {dataTable.Rows.Count} row(s).");
        }
        catch (Exception ex)
        {
            QueryResult.Set(context, null);
            RowCount.Set(context, 0);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error executing query: {ex.Message}");
        }
    }
}




