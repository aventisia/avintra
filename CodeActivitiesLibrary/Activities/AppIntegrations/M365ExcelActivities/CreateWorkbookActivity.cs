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
    [DisplayName("Create Workbook (HTTP)")]
    [Description("Creates a new Excel workbook in OneDrive/SharePoint using Microsoft Graph HTTP PUT.")]
    public class CreateWorkbookActivity : BaseCodeActivity
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
        [DisplayName("File Path")]
        [Description("Relative path in the drive, e.g., /Documents/NewWorkbook.xlsx")]
        public InArgument<string> FilePath { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var tenantId = TenantId.Get(context);
                var clientId = ClientId.Get(context);
                var clientSecret = ClientSecret.Get(context);
                var driveId = DriveId.Get(context);
                var filePath = FilePath.Get(context);

                CreateWorkbookAsync(tenantId, clientId, clientSecret, driveId, filePath).GetAwaiter().GetResult();

                StatusMessage.Set(context, $" Success: Workbook created at {filePath}");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $" Error creating workbook: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private async Task CreateWorkbookAsync(string tenantId, string clientId, string clientSecret,
     string driveId, string filePath)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build Graph API URL
                var url = GraphHttpHelper.BuildDriveItemUrl(driveId, filePath, "/content");

                // Empty file content (0 bytes, Excel will auto-recognize .xlsx)
                var contentBytes = new byte[0];

                // Send PUT request using helper
                var response = await GraphHttpHelper.PutAsync(client, url, contentBytes);
                response.EnsureSuccessStatusCode();
            }
        }

    }
}
