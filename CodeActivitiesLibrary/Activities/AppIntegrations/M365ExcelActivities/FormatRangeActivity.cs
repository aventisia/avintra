using Azure.Identity;
using CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Documents;

namespace CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities
{
    [DisplayName("Format Excel Range (HTTP)")]
    [Description("Applies font color, fill color, and bold formatting to an Excel range using Microsoft Graph HTTP PATCH.")]
    public class FormatRangeActivity : BaseCodeActivity
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
        [Description("Range to format, e.g., A1:D10")]
        public InArgument<string> RangeAddress { get; set; }

        [DisplayName("Font Color (Hex)")]
        [Description("6-digit hex without #, e.g., FF0000")]
        public InArgument<string> FontColor { get; set; }

        [DisplayName("Fill Color (Hex)")]
        [Description("6-digit hex without #, e.g., FFFF00")]
        public InArgument<string> FillColor { get; set; }

        [DisplayName("Bold")]
        [Description("Apply bold formatting")]
        public InArgument<bool> Bold { get; set; }

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
                var fontColor = FontColor.Get(context);
                var fillColor = FillColor.Get(context);
                var bold = Bold.Get(context);

                FormatRangeAsync(
                tenantId, clientId, clientSecret,
                driveId, itemId, sheetName, rangeAddress,
                fontColor, fillColor, bold
                ).GetAwaiter().GetResult();

                StatusMessage.Set(context, $"Success: Range '{RangeAddress.Get(context)}' formatted.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error for range: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private async Task FormatRangeAsync(
            string tenantId, string clientId, string clientSecret,
            string driveId, string itemId, string sheetName, string rangeAddress,
            string fontColor, string fillColor, bool bold)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build Graph API URL
                var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{sheetName}/range(address='{rangeAddress}')";

                // Build payload
                var payload = new
                {
                    format = new
                    {
                        font = new { color = $"#{fontColor}", bold = bold },
                        fill = new { color = $"#{fillColor}" }
                    }
                };

                // Send PATCH request using helper
                var response = await GraphHttpHelper.PatchAsync(client, url, payload);
                response.EnsureSuccessStatusCode();
            }
        }

    }
}
