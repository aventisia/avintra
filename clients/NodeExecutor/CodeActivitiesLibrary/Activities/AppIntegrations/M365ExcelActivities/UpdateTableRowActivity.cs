using Azure.Identity;
using CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Microsoft.Office.Interop.Excel;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities
{
    [DisplayName("Update Table Row")]
    [Description("Updates a row in a table in the workbook.")]
    [ActivityMetaData(nodeImg:"/assets/M365.svg")]
    public class UpdateTableRowActivity : BaseCodeActivity
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
        [Description("Name of the table")]
        public InArgument<string> TableName { get; set; }

        [RequiredArgument]
        [DisplayName("Row Index")]
        [Description("Zero-based index of the row to update")]
        public InArgument<int> RowIndex { get; set; }

        [RequiredArgument]
        [DisplayName("Values (JSON Array)")]
        [Description("Array of new values for the row")]
        public InArgument<string> ValuesJson { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var tenantId = TenantId.Get(context);
            var clientId = ClientId.Get(context);
            var clientSecret = ClientSecret.Get(context);
            var driveId = DriveId.Get(context);
            var itemId = ItemId.Get(context);
            var tableName = TableName.Get(context);
            var rowIndex = RowIndex.Get(context);
            var valuesJson = ValuesJson.Get(context);

            UpdateTableRowAsync(
            tenantId, clientId, clientSecret,
             driveId, itemId, tableName, rowIndex, valuesJson
            ).GetAwaiter().GetResult();

            StatusMessage.Set(context, $"Success: Row {RowIndex.Get(context)} updated in table '{TableName.Get(context)}'.");
            IsSuccess.Set(context, true);
        }

        private async Task UpdateTableRowAsync(string tenantId, string clientId, string clientSecret,
            string driveId, string itemId, string tableName, int rowIndex, string valuesJson)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build the Graph API URL for the specific row in the table
                var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/tables/{tableName}/rows/{rowIndex}";

                // Prepare the payload
                var payload = new { values = System.Text.Json.JsonSerializer.Deserialize<object>(valuesJson) };

                // Send PATCH request via helper
                var response = await GraphHttpHelper.PatchAsync(client, url, payload);
                response.EnsureSuccessStatusCode();
            }
        }

    }
}
