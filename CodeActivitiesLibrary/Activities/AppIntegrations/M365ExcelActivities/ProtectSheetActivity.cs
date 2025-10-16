using Azure.Identity;
using CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities
{
    [DisplayName("Protect Sheet (HTTP)")]
    [Description("Protects an Excel worksheet with an optional password.")]
    [ActivityMetaData(nodeImg:"/assets/M365.svg")]
    public class ProtectSheetActivity : BaseCodeActivity
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
        [Description("The relative path to the Excel file in the drive (e.g., 'Reports/ProtectedSheet.xlsx').")]
        public InArgument<string> FilePath { get; set; }

        [RequiredArgument]
        [DisplayName("Worksheet Name")]
        [Description("The name of the worksheet to protect (e.g., 'Financials').")]
        public InArgument<string> WorksheetName { get; set; }

        [DisplayName("Password (Optional)")]
        [Description("An optional password to protect the sheet. If provided, users will need it to unprotect the sheet. Leave blank for password-less protection.")]
        public InArgument<string> Password { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                ProtectSheetAsync(
                    TenantId.Get(context),
                    ClientId.Get(context),
                    ClientSecret.Get(context),
                    DriveId.Get(context),
                    FilePath.Get(context),
                    WorksheetName.Get(context),
                    Password.Get(context)
                ).GetAwaiter().GetResult();

                StatusMessage.Set(context, $"Success: Sheet {WorksheetName.Get(context)} protected");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error protecting sheet: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private async Task ProtectSheetAsync(string tenantId, string clientId, string clientSecret,
    string driveId, string filePath, string worksheet, string password)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build Graph API URL
                var url = GraphHttpHelper.BuildDriveItemUrl(
                    driveId,
                    filePath,
                    $"/workbook/worksheets/{worksheet}/protection/protect"
                );

                // Prepare payload: only include password if provided
                var payload = string.IsNullOrEmpty(password)
                ? new Dictionary<string, string>()
                : new Dictionary<string, string> { { "password", password } };
                // Send POST request via helper
                var response = await GraphHttpHelper.PostAsync(client, url, payload);
                response.EnsureSuccessStatusCode();
            }
        }

    }
}
