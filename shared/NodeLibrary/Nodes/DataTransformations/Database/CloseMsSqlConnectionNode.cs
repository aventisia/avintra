using Microsoft.Data.SqlClient;

namespace NodeLibrary.DatabaseNodes;

[DisplayName("Close MS SQL Connection"), Description("Closes an open Microsoft SQL Server database connection")]
[NodeMetadata(icon: "/assets/Database.svg")]
public class CloseMsSqlConnectionNode : BaseNode
{
    [DisplayName("MS SQL Connection"), Description("The MS SQL Server connection returned from Open MS SQL Connection node.")]
    public required InArgument<SqlConnection> SqlConnection { get; set; }

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var connection = SqlConnection.Get(context);

            if (connection == null)
                throw new ArgumentException("SQL Connection is required.");

            if (connection.State != ConnectionState.Closed)
            {
                connection.Close();
                connection.Dispose();
            }

            status = "MS SQL Server connection closed successfully.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error closing database connection: {ex.Message}");
        }
    }
}
