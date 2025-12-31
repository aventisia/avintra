using Azure.Identity;
using CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities
{
    [DisplayName("Insert Row into Table")]
    [Description("Inserts a new row into a table in Excel using Microsoft Graph HTTP POST.")]
    [ActivityMetaData(nodeImg:"/assets/M365.svg")]
    public class InsertRowInTableActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Tenant ID")]
        [Description("Azure AD Tenant ID")]
        public InArgument<string> TenantId { get; set; }

        [RequiredArgument]
        [DisplayName("Client ID")]
        [Description("Azure AD Client ID")]
        public InArgument<string> ClientId { get; set; }

        [RequiredArgument]
        [DisplayName("Client Secret")]
        [Description("Azure AD Client Secret")]
        public InArgument<string> ClientSecret { get; set; }

        [RequiredArgument]
        [DisplayName("Drive ID")]
        [Description("OneDrive or SharePoint Drive ID")]
        public InArgument<string> DriveId { get; set; }

        [RequiredArgument]
        [DisplayName("Item ID")]
        [Description("Excel file Item ID")]
        public InArgument<string> ItemId { get; set; }

        [RequiredArgument]
        [DisplayName("Table Name")]
        [Description("The table name to insert row into")]
        public InArgument<string> TableName { get; set; }

        [RequiredArgument]
        [DisplayName("Row Values JSON")]
        [Description("Values as JSON array of arrays, e.g., [[\"val1\",\"val2\"]]")]
        public InArgument<string> RowValuesJson { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var tenantId = TenantId.Get(context);
            var clientId = ClientId.Get(context);
            var clientSecret = ClientSecret.Get(context);
            var driveId = DriveId.Get(context);
            var itemId = ItemId.Get(context);
            var tableName = TableName.Get(context);
            var rowValuesJson = RowValuesJson.Get(context);

            InsertRowAsync(
                 tenantId, clientId, clientSecret,
             driveId, itemId, tableName, rowValuesJson
            ).GetAwaiter().GetResult();

            StatusMessage.Set(context, $" Success: Row inserted into table {TableName.Get(context)}");
            IsSuccess.Set(context, true);
        }

        private async Task InsertRowAsync(string tenantId, string clientId, string clientSecret,
             string driveId, string itemId, string tableName, string rowValuesJson)
        {
            // Prepare payload for Graph API
            var payload = new { values = System.Text.Json.JsonSerializer.Deserialize<object[][]>(rowValuesJson) };

            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build Graph API URL
                var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/tables/{tableName}/rows/add";

                // Send POST request using helper
                var response = await GraphHttpHelper.PostAsync(client, url, payload);
                response.EnsureSuccessStatusCode();
            }
        }

    }
}
