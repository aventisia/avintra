using System;
using System.Activities;
using System.ComponentModel;
using System.Data.SqlClient;

namespace CodeActivitiesLibrary.DataTransformations.DatebaseActivities
{
    [DisplayName("Open SQL Connection"), Description("Open a new connection to a database")]
    public class OpenSqlConnectionActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The connection string to the database.")]
        public InArgument<string> ConnectionString { get; set; }

        
        

        protected override void Execute(CodeActivityContext context)
        {
            var connectionString = ConnectionString.Get(context);
            var status = "";

            try
            {
                using (var connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    status = "Database connection opened successfully.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error opening database connection: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}