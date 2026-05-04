using Microsoft.Data.SqlClient;

namespace NodeLibrary.DatabaseNodes;

[DisplayName("Open MS SQL Connection"), Description("Open a new connection to a Microsoft SQL Server database")]
[NodeMetadata(icon: "/assets/Database.svg")]
public class OpenMsSqlConnectionNode : BaseNode
{
    [DisplayName("Connection String"), Description("The connection string to the MS SQL Server database. For example: 'Server=localhost\\SQLEXPRESS;Database=master;User Id=myUsername;Password=myPassword;'")]
    public required InArgument<SecureString> ConnectionString { get; set; }

    [DisplayName("MS SQL Connection"), Description("The opened MS SQL Server connection.")]
    public OutArgument<SqlConnection> SqlConnection { get; set; } = new OutArgument<SqlConnection>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var connectionString = ConvertSecureStringToString(ConnectionString.Get(context));

            // Validate input
            if (string.IsNullOrWhiteSpace(connectionString))
                throw new ArgumentException("Connection string is required and cannot be empty.");

            // Create and open connection
            var connection = new SqlConnection(connectionString);
            connection.Open();

            // Return the actual connection object
            SqlConnection.Set(context, connection);
            status = $"MS SQL Server connection opened successfully to '{connection.Database}' on '{connection.DataSource}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (ArgumentException argEx)
        {
            SqlConnection.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Invalid argument: {argEx.Message}");
        }
        catch (SqlException sqlEx)
        {
            SqlConnection.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"SQL error opening connection: {sqlEx.Message}");
        }
        catch (Exception ex)
        {
            SqlConnection.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error opening database connection: {ex.Message}");
        }
    }

    private static string? ConvertSecureStringToString(SecureString? secureString)
    {
        if (secureString == null)
            return string.Empty;

        var ptr = System.Runtime.InteropServices.Marshal.SecureStringToGlobalAllocUnicode(secureString);
        try
        {
            return System.Runtime.InteropServices.Marshal.PtrToStringUni(ptr);
        }
        finally
        {
            System.Runtime.InteropServices.Marshal.ZeroFreeGlobalAllocUnicode(ptr);
        }
    }
}
