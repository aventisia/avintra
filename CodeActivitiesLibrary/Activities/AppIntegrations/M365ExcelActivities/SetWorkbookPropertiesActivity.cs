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
    [DisplayName("Set Workbook Properties (HTTP)")]
    [Description("Sets metadata properties like Title, Author, and Keywords for a workbook.")]
    public class SetWorkbookPropertiesActivity : BaseCodeActivity
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
        [Description("The relative path to the Excel file in the drive (e.g., 'Reports/AnnualReport.xlsx').")]
        public InArgument<string> FilePath { get; set; }

        [DisplayName("Title")]
        [Description("The document title to set in the workbook's metadata (e.g., 'Q3 Financial Summary').")]
        public InArgument<string> Title { get; set; }

        [DisplayName("Author")]
        [Description("The author name to embed in the workbook's properties (e.g., 'Finance Team').")]
        public InArgument<string> Author { get; set; }

        [DisplayName("Keywords")]
        [Description("Comma-separated keywords for document indexing and search (e.g., 'finance, quarterly, 2024').")]
        public InArgument<string> Keywords { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                SetPropertiesAsync(
                    TenantId.Get(context),
                    ClientId.Get(context),
                    ClientSecret.Get(context),
                    DriveId.Get(context),
                    FilePath.Get(context),
                    Title.Get(context),
                    Author.Get(context),
                    Keywords.Get(context)
                ).GetAwaiter().GetResult();

                StatusMessage.Set(context, "Success: Workbook properties updated");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error setting workbook properties: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }
        private async Task SetPropertiesAsync(string tenantId, string clientId, string clientSecret,
            string driveId, string filePath, string title, string author, string keywords)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                var url = GraphHttpHelper.BuildDriveItemUrl(driveId, filePath, "/workbook/properties");

                var payload = new
                {
                    title,
                    author,
                    keywords
                };

                var response = await GraphHttpHelper.PatchAsync(client, url, payload);
                response.EnsureSuccessStatusCode();
            }
        }
    }
}
