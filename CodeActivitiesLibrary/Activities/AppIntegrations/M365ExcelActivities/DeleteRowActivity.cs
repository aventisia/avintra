using Azure.Identity;
using CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities
{
    [DisplayName("Delete Row from Table")]
    [Description("Deletes a row from a table in Excel using Microsoft Graph HTTP POST.")]
    [ActivityMetaData(nodeImg:"/assets/M365.svg")]
    public class DeleteRowActivity : BaseCodeActivity
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
        [Description("The table name to delete row from")]
        public InArgument<string> TableName { get; set; }

        [RequiredArgument]
        [DisplayName("Row Index")]
        [Description("0-based index of the row to delete")]
        public InArgument<int> RowIndex { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var tenantId = TenantId.Get(context);
            var clientId = ClientId.Get(context);
            var clientSecret = ClientSecret.Get(context);
            var driveId = DriveId.Get(context);
            var itemId = ItemId.Get(context);
            var tableName = TableName.Get(context);
            var rowIndex = RowIndex.Get(context);

            DeleteRowAsync(
            tenantId,
            clientId, clientSecret,
            driveId, itemId, tableName, rowIndex
            ).GetAwaiter().GetResult();

            StatusMessage.Set(context, $" Success: Row {RowIndex.Get(context)} deleted from table {TableName.Get(context)}");
            IsSuccess.Set(context, true);
        }

        private async Task DeleteRowAsync(string tenantId, string clientId, string clientSecret,
          string driveId, string itemId, string tableName, int rowIndex)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build Graph API URL
                var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/tables/{tableName}/rows/{rowIndex}/delete";

                // POST request with no payload
                var response = await client.PostAsync(url, null);
                response.EnsureSuccessStatusCode();
            }
        }

    }
}
