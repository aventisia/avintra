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
    [DisplayName("Unprotect Sheet (HTTP)")]
    [Description("Removes protection from an Excel worksheet.")]
    public class UnprotectSheetActivity : BaseCodeActivity
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
        public InArgument<string> ClientSecret { get; set; }

        [RequiredArgument]
        [DisplayName("Drive ID")]
        [Description("OneDrive or SharePoint Drive ID")]
        public InArgument<string> DriveId { get; set; }

        [RequiredArgument]
        [DisplayName("File Path")]
        [Description("The relative path to the Excel workbook in the drive (e.g., 'Reports/ProtectedData.xlsx').")]
        public InArgument<string> FilePath { get; set; }

        [RequiredArgument]
        [DisplayName("Worksheet Name")]
        [Description("The name of the protected worksheet to unprotect (e.g., 'Summary').")]
        public InArgument<string> WorksheetName { get; set; }

        [DisplayName("Password")]
        [Description("The password used to protect the sheet. Required only if the worksheet was protected with a password. Leave blank if no password was set.")]
        public InArgument<string> Password { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                UnprotectSheetAsync(
                    TenantId.Get(context),
                    ClientId.Get(context),
                    ClientSecret.Get(context),
                    DriveId.Get(context),
                    FilePath.Get(context),
                    WorksheetName.Get(context),
                    Password.Get(context)
                ).GetAwaiter().GetResult();

                StatusMessage.Set(context, $"Success: Sheet {WorksheetName.Get(context)} unprotected");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error unprotecting sheet: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private async Task UnprotectSheetAsync(
            string tenantId, string clientId, string clientSecret,
            string driveId, string filePath, string worksheet, string password)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build URL with helper
                var url = GraphHttpHelper.BuildDriveItemUrl(
                    driveId,
                    filePath,
                    "/workbook/worksheets/" + worksheet + "/protection/unprotect"
                );

                // Build payload JSON manually (safe for C# 7.3)
                string payloadJson;
                if (string.IsNullOrWhiteSpace(password))
                {
                    payloadJson = "{}";
                }
                else
                {
                    payloadJson = "{ \"password\": \"" + password.Replace("\"", "\\\"") + "\" }";
                }

                // Send POST request via helper
                var response = await GraphHttpHelper.PostAsync(client, url, payloadJson);
                response.EnsureSuccessStatusCode();
            }
        }
    }
}
