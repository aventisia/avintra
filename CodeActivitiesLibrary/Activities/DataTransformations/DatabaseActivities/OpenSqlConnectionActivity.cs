using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data.SqlClient;

namespace CodeActivitiesLibrary.DataTransformations.DatabaseActivities
{
    [DisplayName("Open SQL Connection")]
    [Description("Open a new connection to a database")]
    public class OpenSqlConnectionActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Connection String")]
        [Description("The connection string to the database.")]
        public InArgument<string> ConnectionString { get; set; }

        [DisplayName("SQL Connection")]
        [Description("The opened SQL connection.")]
        public OutArgument<SqlConnection> SqlConnection { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var connectionString = ConnectionString.Get(context);
            SqlConnection connection = null;

            try
            {
                connection = new SqlConnection(connectionString);
                connection.Open();
                SqlConnection.Set(context, connection);

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Database connection opened successfully.");
            }
            catch (Exception ex)
            {
                SqlConnection.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error opening database connection: {ex.Message}");
            }
        }
    }
}