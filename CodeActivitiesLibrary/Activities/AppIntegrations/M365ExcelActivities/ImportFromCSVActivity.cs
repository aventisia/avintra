using Azure.Identity;
using CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities
{
    [DisplayName("Import CSV to Worksheet (HTTP)")]
    [Description("Imports CSV data into an Excel worksheet starting from cell A1.")]
    public class ImportFromCSVActivity : BaseCodeActivity
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
        [Description("The unique ID of the OneDrive or SharePoint document library drive where the Excel file is stored.")]
        public InArgument<string> DriveId { get; set; }

        [RequiredArgument]
        [DisplayName("File Path")]
        [Description("The relative path to the Excel file in the drive (e.g., 'Data/ImportTarget.xlsx').")]
        public InArgument<string> FilePath { get; set; }

        [RequiredArgument]
        [DisplayName("Worksheet Name")]
        [Description("The name of the worksheet where CSV data will be imported (e.g., 'RawData'). If it doesn't exist, the operation may fail.")]
        public InArgument<string> WorksheetName { get; set; }

        [RequiredArgument]
        [DisplayName("CSV Content")]
        [Description("The full CSV data as a string (including headers if needed). Example: \"Name,Age\\nJohn,30\\nJane,25\". Line breaks must use \\n.")]
        public InArgument<string> CSVContent { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                ImportCSVAsync(
                    TenantId.Get(context),
                    ClientId.Get(context),
                    ClientSecret.Get(context),
                    DriveId.Get(context),
                    FilePath.Get(context),
                    WorksheetName.Get(context),
                    CSVContent.Get(context)
                ).GetAwaiter().GetResult();

                StatusMessage.Set(context, $"Success: CSV imported into {WorksheetName.Get(context)}");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error importing CSV: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private async Task ImportCSVAsync(string tenantId, string clientId, string clientSecret,
            string driveId, string filePath, string worksheet, string csvContent)
        {
            // Convert CSV into 2D array
            var rows = csvContent
                .Split(new[] { "\r\n", "\n" }, StringSplitOptions.RemoveEmptyEntries)
                .Select(r => r.Split(',').ToArray())
                .ToArray();

            var payload = new { values = rows };

            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build Graph API URL
                var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/root:{filePath}:/workbook/worksheets/{worksheet}/range(address='A1')";

                // Send PATCH request using helper
                var response = await GraphHttpHelper.PatchAsync(client, url, payload);
                response.EnsureSuccessStatusCode();
            }
        }
    }
}
