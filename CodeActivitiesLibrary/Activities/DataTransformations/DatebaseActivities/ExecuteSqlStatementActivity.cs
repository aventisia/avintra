using System;
using System.Activities;
using System.ComponentModel;
using System.Data.SqlClient;

namespace CodeActivitiesLibrary.DataTransformations.DatebaseActivities
{
    [DisplayName("Execute SQL Statement"), Description("Connect to a database and execute an SQL statement")]
    public class ExecuteSqlStatementActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The connection string to the database.")]
        public InArgument<string> ConnectionString { get; set; }

        [RequiredArgument, Category("Input"), Description("The SQL statement to execute.")]
        public InArgument<string> SqlStatement { get; set; }

        
        

        protected override void Execute(CodeActivityContext context)
        {
            var connectionString = ConnectionString.Get(context);
            var sqlStatement = SqlStatement.Get(context);
            var status = "";

            try
            {
                using (var connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    using (var command = new SqlCommand(sqlStatement, connection))
                    {
                        command.ExecuteNonQuery();
                    }
                    status = "SQL statement executed successfully.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error executing SQL statement: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}