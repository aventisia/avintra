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
        [DisplayName("SQL Connection")]
        [Description("The SQL connection to close.")]
        public InArgument<SqlConnection> SqlConnection { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var connection = SqlConnection.Get(context);
            var status = "";
            try
            {
                if (connection != null && connection.State == ConnectionState.Open)
                {
                    connection.Close();
                    status = "Database connection closed successfully.";
                }
                else
                {
                    status = "Connection was already closed or null.";
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