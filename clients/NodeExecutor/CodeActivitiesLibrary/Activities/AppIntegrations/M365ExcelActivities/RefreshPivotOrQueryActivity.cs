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
    [DisplayName("Refresh PivotTable or Query")]
    [Description("Refreshes a PivotTable or data query in the workbook.")]
    [ActivityMetaData(nodeImg:"/assets/M365.svg")]
    public class RefreshPivotOrQueryActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Tenant ID")]
        [Description("The Azure Active Directory tenant ID (e.g., 'contoso.onmicrosoft.com' or a GUID).")]
        public InArgument<string> TenantId { get; set; }

        [RequiredArgument]
        [DisplayName("Client ID")]
        [Description("The Application (Client) ID of the Azure AD registered app used to authenticate with Microsoft Graph.")]
        public InArgument<string> ClientId { get; set; }

        [RequiredArgument]
        [DisplayName("Client Secret")]
        [Description("The client secret (password) of the Azure AD application for service principal authentication.")]
        public InArgument<string> ClientSecret { get; set; }

        [RequiredArgument]
        [DisplayName("Drive ID")]
        [Description("The unique identifier of the OneDrive or SharePoint document library where the Excel file is stored.")]
        public InArgument<string> DriveId { get; set; }

        [RequiredArgument]
        [DisplayName("Item ID")]
        [Description("The unique identifier of the Excel workbook file within the specified drive.")]
        public InArgument<string> ItemId { get; set; }

        [RequiredArgument]
        [DisplayName("PivotTable or Query Name")]
        [Description("The name of the PivotTable or Power Query (query) in the Excel workbook to refresh.")]
        public InArgument<string> Name { get; set; }
        protected override void Execute(CodeActivityContext context)
        {
            var tenantId = TenantId.Get(context);
            var clientId = ClientId.Get(context);
            var clientSecret = ClientSecret.Get(context);
            var driveId = DriveId.Get(context);
            var itemId = ItemId.Get(context);
            var name = Name.Get(context);

            RefreshAsync(
            tenantId, clientId, clientSecret,
            driveId, itemId, name
            ).GetAwaiter().GetResult();

            StatusMessage.Set(context, $" Success: Refreshed '{Name.Get(context)}'.");
            IsSuccess.Set(context, true);
        }

        private async Task RefreshAsync(string tenantId, string clientId, string clientSecret,
            string driveId, string itemId, string name)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{name}/refresh";

                // POST request with no body
                var response = await GraphHttpHelper.PostAsync(client, url, null);
                response.EnsureSuccessStatusCode();
            }
        }

    }
}
