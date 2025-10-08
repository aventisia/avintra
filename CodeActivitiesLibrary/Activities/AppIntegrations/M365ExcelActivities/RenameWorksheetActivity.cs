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
    [DisplayName("Rename Worksheet (HTTP)")]
    [Description("Renames an existing worksheet in a workbook.")]

    public class RenameWorksheetActivity : BaseCodeActivity
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
        [DisplayName("File Path")]
        [Description("The relative path to the Excel file in the drive (e.g., 'Reports/Analysis.xlsx').")]
        public InArgument<string> FilePath { get; set; }

        [RequiredArgument]
        [DisplayName("Worksheet ID")]
        [Description("The unique Microsoft Graph ID of the worksheet to rename. This is not the worksheet name.")]
        public InArgument<string> WorksheetId { get; set; }

        [RequiredArgument]
        [DisplayName("New Worksheet Name")]
        [Description("The new name for the worksheet (e.g., 'Q3_Summary'). Must be unique within the workbook and not contain invalid characters like \\ / ? * [ ].")]
        public InArgument<string> NewName { get; set; }
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                RenameWorksheetAsync(
                    TenantId.Get(context),
                    ClientId.Get(context),
                    ClientSecret.Get(context),
                    DriveId.Get(context),
                    FilePath.Get(context),
                    WorksheetId.Get(context),
                    NewName.Get(context)
                ).GetAwaiter().GetResult();

                StatusMessage.Set(context, $"Success: Worksheet renamed to {NewName.Get(context)}");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error renaming worksheet: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }
        private async Task RenameWorksheetAsync(string tenantId, string clientId, string clientSecret,
            string driveId, string filePath, string worksheetId, string newName)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build the Graph API URL for the worksheet
                var url = GraphHttpHelper.BuildDriveItemUrl(driveId, filePath, $"/workbook/worksheets/{worksheetId}");

                // Payload with the new name
                var payload = new { name = newName };

                // Send PATCH request via helper
                var response = await GraphHttpHelper.PatchAsync(client, url, payload);
                response.EnsureSuccessStatusCode();
            }
        }

    }
}
