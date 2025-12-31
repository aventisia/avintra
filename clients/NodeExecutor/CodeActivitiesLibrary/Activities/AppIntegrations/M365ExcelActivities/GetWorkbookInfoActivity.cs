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
    [DisplayName("Get Workbook Info (HTTP)")]
    [Description("Gets metadata (author, created date, modified date) for a workbook.")]
    [ActivityMetaData(nodeImg:"/assets/M365.svg")]
    public class GetWorkbookInfoActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Tenant ID")]
        [Description("The Azure AD tenant identifier. Used to authenticate with Microsoft 365.")]
        public InArgument<string> TenantId { get; set; }

        [RequiredArgument]
        [DisplayName("Client ID")]
        [Description("The Application (Client) ID of the Azure AD app registered to access Microsoft Graph.")]
        public InArgument<string> ClientId { get; set; }

        [RequiredArgument]
        [DisplayName("Client Secret")]
        [Description("The client secret of the Azure AD application. Ensure it has the necessary permissions (e.g., Files.ReadWrite.All).")]
        public InArgument<string> ClientSecret { get; set; }

        [RequiredArgument]
        [DisplayName("Drive ID")]
        [Description("The unique ID of the OneDrive or SharePoint document library drive where the workbook is stored.")]
        public InArgument<string> DriveId { get; set; }

        [RequiredArgument]
        [DisplayName("Item ID")]
        [Description("The Microsoft Graph DriveItem ID of the Excel workbook file.")]
        public InArgument<string> ItemId { get; set; }

        [DisplayName("Workbook Metadata JSON")]
        [Description("A JSON string containing the workbook's metadata properties such as name, ID, created/modified dates, size, and web URL. Useful for logging or downstream processing.")]
        public OutArgument<string> WorkbookMetadata { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var tenantId = TenantId.Get(context);
                var clientId = ClientId.Get(context);
                var clientSecret = ClientSecret.Get(context);
                var driveId = DriveId.Get(context);
                var itemId = ItemId.Get(context);

                var metadata = GetWorkbookInfoAsync(tenantId, clientId, clientSecret, driveId, itemId).GetAwaiter().GetResult();

                WorkbookMetadata.Set(context, metadata);
                StatusMessage.Set(context, " Success: Workbook info retrieved.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $" Error getting workbook info: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private async Task<string> GetWorkbookInfoAsync(string tenantId, string clientId, string clientSecret,
     string driveId, string itemId)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build Graph API URL
                var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}";

                // Send GET request using helper
                var response = await GraphHttpHelper.GetAsync(client, url);
                response.EnsureSuccessStatusCode();

                return await response.Content.ReadAsStringAsync();
            }
        }

    }
}
