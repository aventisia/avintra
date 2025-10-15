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
    [DisplayName("Resize Table (HTTP)")]
    [Description("Resizes an existing Excel table to a new range.")]
    [ActivityMetaData(nodeImg:"/assets/M365.svg")]
    public class ResizeTableActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Tenant ID")]
        [Description("The Azure AD tenant identifier (e.g., 'contoso.onmicrosoft.com' or a GUID). Used to authenticate with Microsoft 365.")]
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
        [DisplayName("Workbook Item ID")]
        [Description("The Microsoft Graph DriveItem ID of the Excel workbook file.")]
        public InArgument<string> ItemId { get; set; }

        [RequiredArgument]
        [DisplayName("Table Name")]
        [Description("The name of the existing Excel table to resize (e.g., 'Table1', 'SalesData').")]
        public InArgument<string> TableName { get; set; }

        [RequiredArgument]
        [DisplayName("New Range Address")]
        [Description("The new A1-style range address for the table (e.g., 'A1:D20'). Must include headers and all data rows.")]
        public InArgument<string> NewRange { get; set; }
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                ResizeTableAsync(
                    TenantId.Get(context), ClientId.Get(context), ClientSecret.Get(context),
                    DriveId.Get(context), ItemId.Get(context), TableName.Get(context), NewRange.Get(context)
                ).GetAwaiter().GetResult();

                StatusMessage.Set(context, $" Success: Table '{TableName.Get(context)}' resized to {NewRange.Get(context)}.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $" Error resizing table: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private async Task ResizeTableAsync(string tenantId, string clientId, string clientSecret,
             string driveId, string itemId, string tableName, string newRange)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build the Graph API URL for resizing the table
                var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/tables/{tableName}/resize";

                // Payload with the new range
                var payload = new { address = newRange };

                // Send POST request via helper
                var response = await GraphHttpHelper.PostAsync(client, url, payload);
                response.EnsureSuccessStatusCode();
            }
        }

    }
}
