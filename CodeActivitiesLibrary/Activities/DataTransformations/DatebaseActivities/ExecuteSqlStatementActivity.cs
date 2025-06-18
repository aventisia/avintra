using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Data.SqlClient;

namespace CodeActivitiesLibrary.DataTransformations.DatebaseActivities
{
    [DisplayName("Execute SQL Statement")]
    [Description("Connect to a database and execute an SQL statement")]
    public class ExecuteSqlStatementActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Connection String")]
        [Description("The connection string to the database.")]
        public InArgument<string> ConnectionString { get; set; }

        [RequiredArgument]
        [DisplayName("SQL Statement")]
        [Description("The SQL statement to execute.")]
        public InArgument<string> SqlStatement { get; set; }

        [DisplayName("Operation Type")]
        [Description("The type of SQL operation to perform.")]
        public InArgument<SqlOperationType> OperationType { get; set; }

        [DisplayName("Result Data Table")]
        [Description("The result data table.")]
        public OutArgument<DataTable> ResultDataTable { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var connectionString = ConnectionString.Get(context);
            var sqlStatement = SqlStatement.Get(context);
            var operationType = OperationType.Get(context);
            DataTable resultTable = null;
            var status = "";
            try
            {
                using (var connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    using (var command = new SqlCommand(sqlStatement, connection))
                    {
                        switch (operationType)
                        {
                            case SqlOperationType.NonQuery:
                                command.ExecuteNonQuery();
                                status = "SQL statement executed successfully.";
                                break;
                            case SqlOperationType.Scalar:
                                var scalarResult = command.ExecuteScalar();
                                status = $"SQL statement executed successfully with scalar result: {scalarResult}";
                                break;
                            case SqlOperationType.DataSet:
                                using (var adapter = new SqlDataAdapter(command))
                                {
                                    var dataSet = new DataSet();
                                    adapter.Fill(dataSet);
                                    resultTable = dataSet.Tables.Count > 0 ? dataSet.Tables[0] : null;
                                    status = resultTable != null
                                        ? $"SQL statement executed successfully with {resultTable.Rows.Count} rows."
                                        : "SQL statement executed successfully with no results.";
                                }

                                break;
                            default:
                                throw new ArgumentException("Invalid operation type");
                        }
                        ResultDataTable.Set(context, resultTable);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, "SQL statement executed successfully");
                    }
                }
            }
            catch (Exception ex)
            {
                ResultDataTable.Set(context, resultTable);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error executing SQL statement: {ex.Message}");
            }

            ResultDataTable.Set(context, resultTable);
            StatusMessage.Set(context, "Execute SQL Statement successfully");
        }

        public enum SqlOperationType
        {
            [Display(Name = "Non-Query", Description = "Execute a non-query SQL statement.")]
            NonQuery,

            [Display(Name = "Scalar", Description = "Execute a SQL statement and return a scalar value.")]
            Scalar,

            [Display(Name = "DataSet", Description = "Execute a SQL statement and return a data set.")]
            DataSet
        }
    }
}