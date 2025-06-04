using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data;
using System.Data.SqlClient;

namespace CodeActivitiesLibrary.DataTransformations.DatebaseActivities
{
    [DisplayName("Close SQL Connection")]
    [Description("Close an open connection to a database")]
    public class CloseSqlConnectionActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [Description("The connection string to the database.")]
        public InArgument<string> ConnectionString { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var connectionString = ConnectionString.Get(context);
            var status = "";

            try
            {
                using (var connection = new SqlConnection(connectionString))
                {
                    if (connection.State == ConnectionState.Open)
                    {
                        connection.Close();
                        status = "Database connection closed successfully.";
                    }
                    else
                    {
                        status = "Connection was already closed.";
                    }
                }
            }
            catch (Exception ex)
            {
                status = $"Error closing database connection: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}