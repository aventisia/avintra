using CodeActivitiesLibrary.DataTransformations.DatabaseActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data.SqlClient;

namespace CodeActivitiesLibrary.DataTransformations.DatabaseActivities
{
    [DisplayName("Open SQL Connection")]
    [Description("Open a new connection to a database")]
    [ActivityMetaData(nodeImg: "/assets/Database.svg")]
    public class OpenSqlConnectionActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Connection String")]
        [Description("The connection string to the database.")]
        public InArgument<string> ConnectionString { get; set; }

        [DisplayName("SQL Connection")]
        [Description("The opened SQL connection metadata.")]
        public OutArgument<JToken> SqlConnection { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var connectionString = ConnectionString.Get(context);

            try
            {
                var connection = new SqlConnection(connectionString);
                connection.Open();

                var connectionId = SqlConnectionManager.Add(connection);

                var result = new JObject
                {
                    ["ConnectionId"] = connectionId,
                    ["State"] = connection.State.ToString(),
                    ["Database"] = connection.Database,
                    ["DataSource"] = connection.DataSource,
                    ["OpenedAtUtc"] = DateTime.UtcNow
                };

                SqlConnection.Set(context, result);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Database connection opened successfully.");
            }
            catch (Exception ex)
            {
                SqlConnection.Set(context, JValue.CreateNull());
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error opening database connection: {ex.Message}");
            }
        }
    }
}