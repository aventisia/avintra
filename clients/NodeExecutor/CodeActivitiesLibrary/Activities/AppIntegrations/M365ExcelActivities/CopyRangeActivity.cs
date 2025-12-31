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
    [DisplayName("Copy Range (HTTP)")]
    [Description("Copies a range of cells to another location in the workbook.")]
    [ActivityMetaData(nodeImg:"/assets/M365.svg")]
    public class CopyRangeActivity : BaseCodeActivity
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
        [DisplayName("Source Range")]
        [Description("The A1-style address of the range to copy from (e.g., 'A1:C10' or 'Sheet2!B5:D20'). Must be a valid range in the source worksheet.")]
        public InArgument<string> SourceRange { get; set; }

        [RequiredArgument]
        [DisplayName("Destination Range")]
        [Description("The A1-style address of the top-left cell or range where data will be pasted (e.g., 'E1' or 'Sheet3!A1'). The destination range must be the same size as the source or larger.")]
        public InArgument<string> DestinationRange { get; set; }
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                CopyRangeAsync(
                    TenantId.Get(context), ClientId.Get(context), ClientSecret.Get(context),
                    DriveId.Get(context), ItemId.Get(context),
                    SourceRange.Get(context), DestinationRange.Get(context)
                ).GetAwaiter().GetResult();

                StatusMessage.Set(context, $" Success: Range '{SourceRange.Get(context)}' copied to '{DestinationRange.Get(context)}'.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $" Error copying range: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private async Task CopyRangeAsync(string tenantId, string clientId, string clientSecret,
     string driveId, string itemId, string sourceRange, string destinationRange)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Extract worksheet name from sourceRange (e.g., "Sheet1!A1:B5")
                var worksheetName = sourceRange.Split('!')[0];
                var sourceAddress = sourceRange.Split('!')[1];

                // Build Graph API URL
                var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{worksheetName}/range(address='{sourceAddress}')/copy";

                // Payload
                var payload = new
                {
                    destinationAddress = destinationRange
                };

                // Send POST request using helper
                var response = await GraphHttpHelper.PostAsync(client, url, payload);
                response.EnsureSuccessStatusCode();
            }
        }

    }
}
