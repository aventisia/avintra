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
    [DisplayName("Clear Excel Range (HTTP)")]
    [Description("Clears all values in an Excel range using Microsoft Graph HTTP PATCH.")]
    [ActivityMetaData(nodeImg:"/assets/M365.svg")]
    public class ClearRangeActivity : BaseCodeActivity
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
        [DisplayName("Worksheet Name")]
        [Description("Worksheet containing the range")]
        public InArgument<string> WorksheetName { get; set; }

        [RequiredArgument]
        [DisplayName("Range Address")]
        [Description("Range to clear, e.g., A1:D10")]
        public InArgument<string> RangeAddress { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var tenantId = TenantId.Get(context);
                var clientId = ClientId.Get(context);
                var clientSecret = ClientSecret.Get(context);
                var driveId = DriveId.Get(context);
                var itemId = ItemId.Get(context);
                var sheetName = WorksheetName.Get(context);
                var rangeAddress = RangeAddress.Get(context);

                ClearRangeAsync(
                tenantId, clientId, clientSecret,
                driveId, itemId, sheetName, rangeAddress
                ).GetAwaiter().GetResult();

                StatusMessage.Set(context, $"Success: Range '{RangeAddress.Get(context)}' cleared.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $" Error to Clear Excel Range: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private async Task ClearRangeAsync(
         string tenantId, string clientId, string clientSecret,
         string driveId, string itemId, string sheetName, string rangeAddress)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build Graph API URL
                var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{sheetName}/range(address='{rangeAddress}')";

                // Payload to clear values: empty array of arrays
                var payload = new
                {
                    values = new object[0][] // equivalent to [[]]
                };

                // Send PATCH request using helper
                var response = await GraphHttpHelper.PatchAsync(client, url, payload);
                response.EnsureSuccessStatusCode();
            }
        }

    }
}
