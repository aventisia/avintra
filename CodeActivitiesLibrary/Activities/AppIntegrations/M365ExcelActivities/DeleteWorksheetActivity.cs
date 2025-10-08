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
    [DisplayName("Delete Worksheet")]
    [Description("Deletes a worksheet from the workbook using Microsoft Graph HTTP DELETE.")]
    public class DeleteWorksheetActivity : BaseCodeActivity
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
        public InArgument<string> ClientSecret
        {
            get; set;
        }
        [RequiredArgument]
        [DisplayName("Drive ID")]
        [Description("OneDrive or SharePoint Drive ID")]
        public InArgument<string> DriveId { get; set; }

        [RequiredArgument]
        [DisplayName("Item ID")]
        [Description("Excel file Item ID")]
        public InArgument<string> ItemId { get; set; }

        [RequiredArgument]
        [DisplayName("Worksheet Name")]
        [Description("Name of the worksheet to delete")]
        public InArgument<string> WorksheetName { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var tenantId = TenantId.Get(context);
            var clientId = ClientId.Get(context);
            var clientSecret = ClientSecret.Get(context);
            var driveId = DriveId.Get(context);
            var itemId = ItemId.Get(context);
            var worksheetName = WorksheetName.Get(context);

            DeleteWorksheetAsync(
            tenantId, clientId, clientSecret,
            driveId, itemId, worksheetName
            ).GetAwaiter().GetResult();

            StatusMessage.Set(context, $"Success: Worksheet '{WorksheetName.Get(context)}' deleted.");
            IsSuccess.Set(context, true);
        }

        private async Task DeleteWorksheetAsync(string tenantId, string clientId, string clientSecret,
        string driveId, string itemId, string worksheetName)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build Graph API URL
                var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{worksheetName}";

                // Send DELETE request using helper
                var response = await GraphHttpHelper.DeleteAsync(client, url);
                response.EnsureSuccessStatusCode();
            }
        }

    }
}
