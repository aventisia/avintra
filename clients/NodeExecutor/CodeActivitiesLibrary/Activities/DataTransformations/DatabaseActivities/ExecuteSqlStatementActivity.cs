using CodeActivitiesLibrary.DataTransformations.DatabaseActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Data.SqlClient;

namespace CodeActivitiesLibrary.DataTransformations.DatabaseActivities
{
    [DisplayName("Execute SQL Statement")]
    [Description("Connect to a database and execute an SQL statement.")]
    [ActivityMetaData(nodeImg: "/assets/Database.svg")]
    public class ExecuteSqlStatementActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Connection Mode")]
        public InArgument<SqlConnectionMode> ConnectionMode { get; set; }

        [DisplayName("Connection String")]
        [Description("The connection string to the database.")]
        [RenderIfCondition(nameof(ConnectionMode), SqlConnectionMode.UseConnectionString)]
        [FieldType(FieldType.Password)]
        public InArgument<string> ConnectionString { get; set; }

        [DisplayName("Existing SQL Connection")]
        [Description("The Existing connection string to the database.")]
        [RenderIfCondition(nameof(ConnectionMode), SqlConnectionMode.UseExistingConnection)]
        public InArgument<JToken> ExistingConnection { get; set; }

        [RequiredArgument]
        [DisplayName("SQL Statement")]
        [Description("The SQL statement to execute.")]
        public InArgument<string> SqlStatement { get; set; }

        [RequiredArgument]
        [DisplayName("Operation Type")]
        [Description("The type of SQL operation to perform.")]
        public InArgument<SqlOperationType> OperationType { get; set; }

        [DisplayName("Result Data Table")]
        [Description("The result data table.")]
        public OutArgument<DataTable> ResultDataTable { get; set; }

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
                        var connectionString = ConnectionString.Get(context);

                        if (string.IsNullOrWhiteSpace(connectionString))
                            throw new ArgumentException("Connection string is required.");

                        connection = new SqlConnection(connectionString);
                        connection.Open();
                        disposeConnection = true;
                        break;

                    case SqlConnectionMode.UseExistingConnection:

                        var connectionToken = ExistingConnection.Get(context);

                        if (connectionToken == null || connectionToken.Type == JTokenType.Null)
                            throw new ArgumentException("Existing SQL Connection is required.");

                        // Extract ConnectionId from JToken
                        var connectionId = connectionToken["ConnectionId"]?.ToString();

                        if (string.IsNullOrWhiteSpace(connectionId))
                            throw new ArgumentException("ConnectionId not found in SQL Connection token.");

                        connection = SqlConnectionManager.Get(connectionId);

                        if (connection == null)
                            throw new ArgumentException("Invalid or expired SQL connection.");

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
                            StatusMessage.Set(context, $"NonQuery executed successfully. Rows affected: {rows}");
                            break;

                        case SqlOperationType.Scalar:
                            var scalar = command.ExecuteScalar();
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
                StatusMessage.Set(context, "Execute SQL Statement Successfully ");
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
            [Display(Name = "Use Connection String")]
            UseConnectionString,

            [Display(Name = "Use Existing Connection")]
            UseExistingConnection
        }
    }
}