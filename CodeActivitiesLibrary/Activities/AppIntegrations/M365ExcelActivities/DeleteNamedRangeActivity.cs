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
    [DisplayName("Delete Named Range (HTTP)")]
    [Description("Deletes a named range in an Excel workbook using Microsoft Graph HTTP DELETE.")]
    public class DeleteNamedRangeActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Tenant ID")]
        [Description("Azure AD Tenant ID")]
        public InArgument<string> TenantId { get; set; }

        [RequiredArgument]
        [DisplayName("Client ID")]
        [Description("Azure AD Application Client ID")]
        public InArgument<string> ClientId { get; set; }

        [RequiredArgument]
        [DisplayName("Client Secret")]
        [Description("Azure AD Application Client Secret")]
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
        [DisplayName("Named Range Name")]
        [Description("Name of the range to delete")]
        public InArgument<string> Name { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var tenantId = TenantId.Get(context);
                var clientId = ClientId.Get(context);
                var clientSecret = ClientSecret.Get(context);
                var driveId = DriveId.Get(context);
                var itemId = ItemId.Get(context);
                var name = Name.Get(context);

                DeleteNamedRangeAsync(
                tenantId,
                clientId,
                clientSecret,
                driveId,
                itemId,
                name
                ).GetAwaiter().GetResult();

                StatusMessage.Set(context, $" Success: Named range '{Name.Get(context)}' deleted.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $" Error for Named range: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private async Task DeleteNamedRangeAsync(
     string tenantId, string clientId, string clientSecret,
     string driveId, string itemId, string name)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build Graph API URL
                var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/names/{name}";

                // Send DELETE request using helper
                var response = await GraphHttpHelper.DeleteAsync(client, url);
                response.EnsureSuccessStatusCode();
            }
        }

    }
}
