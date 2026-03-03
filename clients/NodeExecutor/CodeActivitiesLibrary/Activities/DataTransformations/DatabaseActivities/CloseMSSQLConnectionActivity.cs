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
    [DisplayName("Close MS SQL Connection")]
    [Description("Closes an open Microsoft SQL Server database connection")]
    [ActivityMetaData(nodeImg: "/assets/Database.svg")]
    public class CloseMSSQLConnectionActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("MS SQL Connection")]
        [Description("The MS SQL Server connection returned from Open MS SQL Connection node.")]
        public InArgument<SqlConnection> SqlConnection { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var connection = SqlConnection.Get(context);

            try
            {
                if (connection == null)
                    throw new ArgumentException("SQL Connection is required.");

                if (connection.State != ConnectionState.Closed)
                {
                    connection.Close();
                    connection.Dispose();
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "MS SQL Server connection closed successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error closing database connection: {ex.Message}");
            }
        }
    }
}