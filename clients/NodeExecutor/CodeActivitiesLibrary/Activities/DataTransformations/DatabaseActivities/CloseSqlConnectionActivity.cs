using CodeActivitiesLibrary.DataTransformations.DatabaseActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data;
using System.Data.SqlClient;

namespace CodeActivitiesLibrary.DataTransformations.DatabaseActivities
{
    [DisplayName("Close SQL Connection")]
    [Description("Closes an open SQL database connection")]
    [ActivityMetaData(nodeImg: "/assets/Database.svg")]
    public class CloseSqlConnectionActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("SQL Connection")]
        [Description("The SQL connection metadata returned from OpenSqlConnectionActivity.")]
        public InArgument<JToken> SqlConnection { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var connectionToken = SqlConnection.Get(context);

            try
            {
                if (connectionToken == null || connectionToken.Type == JTokenType.Null)
                    throw new ArgumentException("SQL Connection token is required.");

                var connectionId = connectionToken["ConnectionId"]?.ToString();

                if (string.IsNullOrWhiteSpace(connectionId))
                    throw new ArgumentException("ConnectionId not found in SQL Connection token.");

                var connection = SqlConnectionManager.Get(connectionId);

                if (connection != null && connection.State != ConnectionState.Closed)
                {
                    connection.Close();
                    connection.Dispose();
                }

                SqlConnectionManager.Remove(connectionId);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Database connection closed successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error closing database connection: {ex.Message}");
            }
        }
    }
}