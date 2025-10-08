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
    [DisplayName("Check If File Exists (HTTP)")]
    [Description("Checks if a workbook exists in OneDrive or SharePoint.")]
    public class CheckIfFileExistsActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Tenant ID")]
        [Description("The Azure AD tenant ID (e.g., your-tenant.onmicrosoft.com or GUID).")]
        public InArgument<string> TenantId { get; set; }

        [RequiredArgument]
        [DisplayName("Client ID")]
        [Description("The Azure AD application (client) ID registered in your tenant.")]
        public InArgument<string> ClientId { get; set; }

        [RequiredArgument]
        [DisplayName("Client Secret")]
        [Description("The client secret for the Azure AD application. Keep this secure.")]
        public InArgument<string> ClientSecret { get; set; }

        [RequiredArgument]
        [DisplayName("Drive ID")]
        [Description("The unique ID of the OneDrive or SharePoint document library drive.")]
        public InArgument<string> DriveId { get; set; }

        [RequiredArgument]
        [DisplayName("File Path")]
        [Description("The relative path to the file in the drive (e.g., 'Reports/Sales.xlsx').")]
        public InArgument<string> FilePath { get; set; }

        [DisplayName("File Exists")]
        [Description("True if the file exists; otherwise, false.")]
        public OutArgument<bool> Exists { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var exists = CheckIfFileExistsAsync(
                    TenantId.Get(context),
                    ClientId.Get(context),
                    ClientSecret.Get(context),
                    DriveId.Get(context),
                    FilePath.Get(context)
                ).GetAwaiter().GetResult();

                Exists.Set(context, exists);
                StatusMessage.Set(context, exists ? "File exists." : "File does not exist.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error checking file: {ex.Message}");
                Exists.Set(context, false);
                IsSuccess.Set(context, false);
            }
        }

        private async Task<bool> CheckIfFileExistsAsync(string tenantId, string clientId, string clientSecret,
         string driveId, string filePath)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build Graph API URL
                var url = GraphHttpHelper.BuildDriveItemUrl(driveId, filePath);

                try
                {
                    // Send GET request using helper
                    var response = await GraphHttpHelper.GetAsync(client, url);
                    return response.IsSuccessStatusCode;
                }
                catch
                {
                    // If any exception occurs (e.g., 404), return false
                    return false;
                }
            }
        }

    }
}
