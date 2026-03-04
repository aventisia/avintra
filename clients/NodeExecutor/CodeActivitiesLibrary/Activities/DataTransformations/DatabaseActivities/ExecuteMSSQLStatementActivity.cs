using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Data.SqlClient;
using System.Security;

namespace CodeActivitiesLibrary.DataTransformations.DatabaseActivities
{
    [DisplayName("Execute MS SQL Statement")]
    [Description("Connect to a Microsoft SQL Server database and execute a SQL statement.")]
    [ActivityMetaData(nodeImg: "/assets/Database.svg")]
    public class ExecuteMSSQLStatementActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Connection Mode")]
        [Description("Select whether to use a connection string or an existing SQL connection.")]
        [DefaultValue(SqlConnectionMode.UseExistingConnection)]
        public InArgument<SqlConnectionMode> ConnectionMode { get; set; }

        [DisplayName("Connection String")]
        [Description("The connection string to the MS SQL Server database.")]
        [RenderIfCondition(nameof(ConnectionMode), SqlConnectionMode.UseConnectionString)]
        public InArgument<SecureString> ConnectionString { get; set; }

        [DisplayName("Existing MS SQL Connection")]
        [Description("The existing MS SQL Server connection from Open MS SQL Connection node.")]
        [RenderIfCondition(nameof(ConnectionMode), SqlConnectionMode.UseExistingConnection)]
        public InArgument<SqlConnection> ExistingConnection { get; set; }
        
        [RequiredArgument]
        [DisplayName("Operation Type")]
        [Description("The type of SQL operation to perform.")]
        [DefaultValue(SqlOperationType.NonQuery)]
        public InArgument<SqlOperationType> OperationType { get; set; }

        [RequiredArgument]
        [DisplayName("SQL Statement")]
        [Description("The SQL statement to execute on MS SQL Server.")]
        public InArgument<string> SqlStatement { get; set; }

        [DisplayName("Result Data Table")]
        [Description("The result data table from DataSet operation.")]
        [RenderIfCondition(nameof(OperationType), SqlOperationType.DataSet)]
        public OutArgument<DataTable> ResultDataTable { get; set; }

        [DisplayName("Scalar Result")]
        [Description("The scalar value returned from Scalar operation.")]
        [RenderIfCondition(nameof(OperationType), SqlOperationType.Scalar)]
        public OutArgument<object> ScalarResult { get; set; }

        [DisplayName("Affected Rows")]
        [Description("The number of rows affected by NonQuery operation.")]
        [RenderIfCondition(nameof(OperationType), SqlOperationType.NonQuery)]
        public OutArgument<int> AffectedRows { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            SqlConnection connection = null;
            bool disposeConnection = false;

            try
            {
                var mode = ConnectionMode.Get(context);
                var sqlStatement = SqlStatement.Get(context);
                var operationType = OperationType.Get(context);

                if (string.IsNullOrWhiteSpace(sqlStatement))
                    throw new ArgumentException("SQL statement is required.");

                switch (mode)
                {
                    case SqlConnectionMode.UseConnectionString:
                        var connectionString = ConvertSecureStringToString(ConnectionString.Get(context));

                        if (string.IsNullOrWhiteSpace(connectionString))
                            throw new ArgumentException("Connection string is required.");

                        connection = new SqlConnection(connectionString);
                        connection.Open();
                        disposeConnection = true;
                        break;

                    case SqlConnectionMode.UseExistingConnection:

                        connection = ExistingConnection.Get(context);

                        if (connection == null)
                            throw new ArgumentException("Existing SQL Connection is required.");

                        if (connection.State != ConnectionState.Open)
                            connection.Open();

                        disposeConnection = false;
                        break;

                    default:
                        throw new ArgumentException("Invalid connection mode selected.");
                }

                using (var command = new SqlCommand(sqlStatement, connection))
                {
                    switch (operationType)
                    {
                        case SqlOperationType.NonQuery:
                            int rows = command.ExecuteNonQuery();
                            AffectedRows.Set(context, rows);
                            StatusMessage.Set(context, $"NonQuery executed successfully. Rows affected: {rows}");
                            break;

                        case SqlOperationType.Scalar:
                            var scalar = command.ExecuteScalar();
                            ScalarResult.Set(context, scalar);
                            StatusMessage.Set(context, $"Scalar executed successfully. Result: {scalar}");
                            break;
                        case SqlOperationType.DataSet:
                            using (var adapter = new SqlDataAdapter(command))
                            {
                                var table = new DataTable();
                                adapter.Fill(table);
                                ResultDataTable.Set(context, table);
                                StatusMessage.Set(context,
                                    $"DataSet executed successfully. Rows returned: {table.Rows.Count}");
                            }
                            break;
                        default:
                            throw new ArgumentException("Invalid SQL operation type.");
                    }
                }

                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error executing SQL statement: {ex.Message}");
            }
            finally
            {
                if (disposeConnection && connection != null)
                {
                    connection.Close();
                    connection.Dispose();
                }
            }
        }

        public enum SqlOperationType
        {
            [Display(Name = "Non-Query", Description = "Execute INSERT, UPDATE, DELETE statements.")]
            NonQuery,

            [Display(Name = "Scalar", Description = "Execute a SQL statement and return a single value.")]
            Scalar,

            [Display(Name = "DataSet", Description = "Execute a SQL statement and return a result set as DataTable.")]
            DataSet
        }

        public enum SqlConnectionMode
        {
            [Display(Name = "Use Connection String", Description = "Provide a connection string to connect to the MS SQL Server database.")]
            UseConnectionString,

            [Display(Name = "Use Existing Connection", Description = "Use an existing SQL connection from Open MS SQL Connection node.")]
            UseExistingConnection
        }
    }
}