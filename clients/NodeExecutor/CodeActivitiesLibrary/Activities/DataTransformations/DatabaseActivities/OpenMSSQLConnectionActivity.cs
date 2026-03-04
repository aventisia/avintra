using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data.SqlClient;
using System.Security;

namespace CodeActivitiesLibrary.DataTransformations.DatabaseActivities
{
    [DisplayName("Open MS SQL Connection")]
    [Description("Open a new connection to a Microsoft SQL Server database")]
    [ActivityMetaData(nodeImg: "/assets/Database.svg")]
    public class OpenMSSQLConnectionActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Connection String")]
        [Description("The connection string to the MS SQL Server database. For example: 'Server=localhost\\SQLEXPRESS;Database=master;User Id=myUsername;Password=myPassword;'")]
        public InArgument<SecureString> ConnectionString { get; set; }

        [DisplayName("MS SQL Connection")]
        [Description("The opened MS SQL Server connection.")]
        public OutArgument<SqlConnection> SqlConnection { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var connectionString = ConvertSecureStringToString(ConnectionString.Get(context));

            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(connectionString))
                    throw new ArgumentException("Connection string is required and cannot be empty.");

                // Create and open connection
                var connection = new SqlConnection(connectionString);
                connection.Open();

                // Return the actual connection object
                SqlConnection.Set(context, connection);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"MS SQL Server connection opened successfully to '{connection.Database}' on '{connection.DataSource}'.");
            }
            catch (ArgumentException argEx)
            {
                SqlConnection.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Invalid argument: {argEx.Message}");
            }
            catch (SqlException sqlEx)
            {
                SqlConnection.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"SQL error opening connection: {sqlEx.Message}");
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