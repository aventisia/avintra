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

            try
            {
                if (connection != null && connection.State == ConnectionState.Open)
                {
                    connection.Close();
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, "Database connection closed successfully.");
                }
                else
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Connection was already closed or is null.");
                }
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error closing database connection: {ex.Message}");
            }

        }
    }
}